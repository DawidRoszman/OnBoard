export const ADMIN_OCCUPATIONS = [
  'Software Developer',
  'DevOps',
  'Project Manager',
  'Full-stack Developer',
  'Software Engineer',
] as const;

export type AdminOccupation = (typeof ADMIN_OCCUPATIONS)[number];
