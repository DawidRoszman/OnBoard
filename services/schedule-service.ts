import { API_BASE_URL } from '@/config/api';
import { getAuthUser } from '@/services/auth-session';

export type ScheduleTaskStatus = 'done' | 'late' | 'overdue' | 'todo';

export type ScheduleTask = {
  id: string;
  time: string;
  dueTime: string;
  completedTime?: string;
  title: string;
  description: string;
  detailDescription: string;
  status: ScheduleTaskStatus;
  completedStatus?: Extract<ScheduleTaskStatus, 'done' | 'late'>;
  completedMessage?: string;
};

export type ScheduleTimelineItem =
  | {
      type: 'time';
      id: string;
      time: string;
    }
  | {
      type: 'task';
      task: ScheduleTask;
    };

type ScheduleTimelineItemResponse =
  | {
      type: 'time';
      id: string;
      time: string;
    }
  | {
      type: 'task';
      taskId: string;
    };

export type Schedule = {
  greeting: string;
  footerText: string;
  tasks: ScheduleTask[];
  timelineItems: ScheduleTimelineItem[];
};

type ScheduleApiResponse = {
  greeting: string;
  footerText: string;
  tasks: ScheduleTask[];
  timelineItems: ScheduleTimelineItemResponse[];
};

type ScheduleTaskResponse = {
  task: ScheduleTask;
};

export class ScheduleError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'ScheduleError';
  }
}

function getScheduleUserId(): number {
  const user = getAuthUser();

  if (!user) {
    throw new ScheduleError('You must be logged in to load the schedule.', 401);
  }

  return user.id;
}

function buildScheduleUrl(path: string): string {
  const userId = getScheduleUserId();

  return `${API_BASE_URL}${path}?userId=${userId}`;
}

export async function getSchedule(): Promise<Schedule> {
  const response = await fetch(buildScheduleUrl('/schedule'));
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = getScheduleErrorMessage(body, response.status);
    throw new ScheduleError(message, response.status);
  }

  return mapScheduleResponse(body as ScheduleApiResponse);
}

export async function getScheduleTask(taskId: string): Promise<ScheduleTask> {
  const response = await fetch(buildScheduleUrl(`/schedule/tasks/${taskId}`));
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = getScheduleErrorMessage(body, response.status, 'task');
    throw new ScheduleError(message, response.status);
  }

  return (body as ScheduleTaskResponse).task;
}

export async function completeScheduleTask(
  taskId: string,
): Promise<ScheduleTask> {
  const response = await fetch(
    buildScheduleUrl(`/schedule/tasks/${taskId}/complete`),
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    },
  );
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = getScheduleErrorMessage(
      body,
      response.status,
      'complete',
    );
    throw new ScheduleError(message, response.status);
  }

  return (body as ScheduleTaskResponse).task;
}

export function getScheduleTaskById(
  schedule: Schedule,
  taskId: string,
): ScheduleTask | undefined {
  return schedule.tasks.find((task) => task.id === taskId);
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

function getScheduleErrorMessage(
  body: { error?: unknown },
  statusCode: number,
  context: 'schedule' | 'task' | 'complete' = 'schedule',
): string {
  if (typeof body.error === 'string') {
    return body.error;
  }

  if (statusCode === 404) {
    if (context === 'task') {
      return 'Task not found.';
    }

    return 'Schedule endpoint not found. Restart the mock API with npm run mock-api.';
  }

  if (context === 'complete') {
    return 'Failed to complete task. Please try again.';
  }

  if (context === 'task') {
    return 'Failed to load task. Please try again.';
  }

  return 'Failed to load schedule. Please try again.';
}
