export enum StatusGroup {
  TODO = 'todo',
  PROGRESS = 'progress',
  APPROVE = 'approve',
  DONE = 'done',
}

export const StatusGroupColor = {
  [StatusGroup.TODO]: 'grey',
  [StatusGroup.PROGRESS]: 'blue',
  [StatusGroup.APPROVE]: 'deep-orange',
  [StatusGroup.DONE]: 'teal',
}

export interface Status {
  id: number;
  group: StatusGroup;
  title: string;
}

export type StatusCreate = Omit<Status, 'id'>;
export type StatusUpdate = Partial<Status>;

export function isStatus(data: unknown): data is Status {
  return data !== null
    && typeof data === 'object'
    && 'id' in data
    && 'title' in data
    && 'group' in data;
}