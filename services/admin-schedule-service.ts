import { API_BASE_URL } from '@/config/api';
import type {
  Schedule,
  ScheduleTask,
  ScheduleTimelineItem,
} from '@/services/schedule-service';

export type AdminScheduleTaskPayload = {
  title: string;
  description: string;
  detailDescription: string;
  time: string;
  dueTime: string;
};

export type AdminScheduleTaskUpdatePayload = Partial<AdminScheduleTaskPayload>;

type ScheduleApiResponse = {
  greeting: string;
  footerText: string;
  tasks: ScheduleTask[];
  timelineItems: Array<
    | { type: 'time'; id: string; time: string }
    | { type: 'task'; taskId: string }
  >;
};

type ScheduleTaskResponse = {
  task: ScheduleTask;
};

export class AdminScheduleError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'AdminScheduleError';
  }
}

export async function getScheduleForUser(userId: number): Promise<Schedule> {
  const response = await fetch(
    `${API_BASE_URL}/schedule?userId=${userId}`,
  );
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = getAdminScheduleErrorMessage(body, response.status);
    throw new AdminScheduleError(message, response.status);
  }

  return mapScheduleResponse(body as ScheduleApiResponse);
}

export async function createScheduleTask(
  userId: number,
  payload: AdminScheduleTaskPayload,
): Promise<ScheduleTask> {
  const response = await fetch(
    `${API_BASE_URL}/admin/schedules/${userId}/tasks`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = getAdminScheduleErrorMessage(body, response.status);
    throw new AdminScheduleError(message, response.status);
  }

  return (body as ScheduleTaskResponse).task;
}

export async function updateScheduleTask(
  userId: number,
  taskId: string,
  payload: AdminScheduleTaskUpdatePayload,
): Promise<ScheduleTask> {
  const response = await fetch(
    `${API_BASE_URL}/admin/schedules/${userId}/tasks/${taskId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = getAdminScheduleErrorMessage(body, response.status);
    throw new AdminScheduleError(message, response.status);
  }

  return (body as ScheduleTaskResponse).task;
}

export async function deleteScheduleTask(
  userId: number,
  taskId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/admin/schedules/${userId}/tasks/${taskId}`,
    {
      method: 'DELETE',
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = getAdminScheduleErrorMessage(body, response.status);
    throw new AdminScheduleError(message, response.status);
  }
}

function mapScheduleResponse(response: ScheduleApiResponse): Schedule {
  const taskById = new Map(response.tasks.map((task) => [task.id, task]));
  const timelineItems: ScheduleTimelineItem[] = [];

  for (const item of response.timelineItems) {
    if (item.type === 'time') {
      timelineItems.push(item);
      continue;
    }

    const task = taskById.get(item.taskId);

    if (task) {
      timelineItems.push({ type: 'task', task });
    }
  }

  return {
    greeting: response.greeting,
    footerText: response.footerText,
    tasks: response.tasks,
    timelineItems,
  };
}

function getAdminScheduleErrorMessage(
  body: { error?: unknown },
  statusCode: number,
): string {
  if (typeof body.error === 'string') {
    return body.error;
  }

  if (statusCode === 404) {
    return 'Schedule or task not found.';
  }

  return 'Schedule update failed. Please try again.';
}
