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

export const SCHEDULE_GREETING = 'Good morning!';

export const SCHEDULE_TASK_DESCRIPTION =
  'Start by scanning your inbox for production alerts, deployment notifications, incident reports, code review requests, and blocked dependencies. Prioritize anything affecting systems, users, or team delivery. Flag actionable items and ignore low-priority noise until core issues are handled.';

export type ScheduleTimeGroup = {
  time: string;
  tasks: ScheduleTask[];
};

export function groupScheduleTasksByTime(
  tasks: ScheduleTask[],
): ScheduleTimeGroup[] {
  return tasks.reduce<ScheduleTimeGroup[]>((groups, task) => {
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.time === task.time) {
      lastGroup.tasks.push(task);
      return groups;
    }

    groups.push({ time: task.time, tasks: [task] });
    return groups;
  }, []);
}

export const SCHEDULE_TASKS: ScheduleTask[] = [
  {
    id: '1',
    time: '09:05',
    dueTime: '09:15',
    completedTime: '09:10',
    title: 'Check e-mail',
    description: "Start your day with seeing what's going on",
    detailDescription: SCHEDULE_TASK_DESCRIPTION,
    status: 'done',
    completedMessage: 'Well done on time! 🎉',
  },
  {
    id: '2',
    time: '09:05',
    dueTime: '09:15',
    completedTime: '09:41',
    title: 'Check e-mail',
    description: "Start your day with seeing what's going on",
    detailDescription: SCHEDULE_TASK_DESCRIPTION,
    status: 'late',
    completedMessage: 'Done at last!',
  },
  {
    id: '3',
    time: '09:20',
    dueTime: '09:15',
    title: 'Check e-mail',
    description: "Start your day with seeing what's going on",
    detailDescription: SCHEDULE_TASK_DESCRIPTION,
    status: 'overdue',
    completedStatus: 'late',
    completedMessage: 'Done at last!',
  },
  {
    id: '4',
    time: '10:15',
    dueTime: '10:30',
    title: 'Check e-mail',
    description: "Start your day with seeing what's going on",
    detailDescription: SCHEDULE_TASK_DESCRIPTION,
    status: 'todo',
    completedStatus: 'done',
    completedMessage: 'Well done on time! 🎉',
  },
];

export const SCHEDULE_TIMELINE_ITEMS: ScheduleTimelineItem[] = [
  { type: 'time', id: 'time-09-05', time: '09:05' },
  { type: 'task', task: SCHEDULE_TASKS[0] },
  { type: 'task', task: SCHEDULE_TASKS[1] },
  { type: 'time', id: 'time-09-15', time: '09:15' },
  { type: 'time', id: 'time-09-20', time: '09:20' },
  { type: 'task', task: SCHEDULE_TASKS[2] },
  { type: 'time', id: 'time-09-30', time: '09:30' },
  { type: 'time', id: 'time-10-15', time: '10:15' },
  { type: 'task', task: SCHEDULE_TASKS[3] },
  { type: 'time', id: 'time-10-30', time: '10:30' },
];

export function getScheduleTaskById(taskId: string): ScheduleTask | undefined {
  return SCHEDULE_TASKS.find((task) => task.id === taskId);
}
