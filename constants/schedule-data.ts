export type ScheduleTaskStatus = 'done' | 'late' | 'todo';

export type ScheduleTask = {
  id: string;
  time: string;
  title: string;
  description: string;
  status: ScheduleTaskStatus;
};

export const SCHEDULE_DATE_LABEL = '04.06.2026 | Your road to success';

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
    title: 'Check e-mail',
    description: "Start your day with seeing what's going on",
    status: 'done',
  },
  {
    id: '2',
    time: '09:05',
    title: 'Check e-mail',
    description: "Start your day with seeing what's going on",
    status: 'done',
  },
  {
    id: '3',
    time: '09:15',
    title: 'Check e-mail',
    description: "Start your day with seeing what's going on",
    status: 'late',
  },
  {
    id: '4',
    time: '10:15',
    title: 'Check e-mail',
    description: "Start your day with seeing what's going on",
    status: 'todo',
  },
];
