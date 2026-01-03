import { BaseContentEntity, Deliverable, Estimatable, Moodable } from "./common.model";
import { Project } from "./projects.model";
import { RateDetail, RatePlanWithVersions } from "./rates.model";
import { Status } from "./status.model";
import { Tracking } from "./tracking.model";


export interface Task extends BaseContentEntity, Estimatable, Moodable, Deliverable {
  title: string;
  project: Project;
  status: Status;
  url?: string;
  active: boolean;
  rates?: RateDetail[];
  code: string;
  description: string;
  priority: TaskPriority;
  ratePlan: RatePlanWithVersions;
}

export enum TaskPriority {
  HIGHEST = 1,
  HIGH = 2,
  MEDIUM = 3,
  LOW = 4,
  LOWEST = 5,
}

export interface TaskDetail extends Task {
  tracking: Tracking[];
}

interface TaskUpdateRelations {
  project?: Pick<Project, 'id'>;
  status?: Pick<Status, 'id'>;
}

export type TaskCreate = Omit<Task, 'id' | 'rates'>;
export type TaskUpdate = Partial<Omit<Task, 'project' | 'status'>> & TaskUpdateRelations;

export function isTask(data: unknown): data is Task {
  return data !== null
    && typeof data === 'object'
    && 'id' in data
    && 'title' in data
    && 'project' in data
    && 'status' in data
    && 'code' in data;
}