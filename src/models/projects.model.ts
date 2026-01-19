import { Client } from "./clients.model";
import { BaseContentEntity, Deliverable, Estimatable, Moodable } from "./common.model";
import { RatePlanFull } from "./rates.model";
import { Task, TaskDetail } from "./tasks.model";

export interface Project extends BaseContentEntity, Estimatable, Moodable, Deliverable {
  title: string;
  active: boolean;
  client: Client;
  url: string | null;
  ratePlan: RatePlanFull | null;
  tasks?: Task[];
  code: string;
  description: string | null;
  priority: number | null;
}

interface ProjectUpdateRelations {
  tasks?: Pick<Task, 'id'>[];
  client?: Pick<Client, 'id'>;
}

export type ProjectCreate = Omit<Project, 'id'>;
export type ProjectUpdate = Partial<Omit<Project, 'id' | 'rates' | 'client' | 'tasks'>> & ProjectUpdateRelations;

export interface ProjectDetail extends Project {
  // tracking: Tracking[];
  tasks: TaskDetail[];
}

export function isProject(data: unknown): data is Project {
  return data !== null
    && typeof data === 'object'
    && 'id' in data
    && 'code' in data
    && 'title' in data;
}