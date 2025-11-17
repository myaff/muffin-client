import { Client } from "./clients.model";
import { BaseContentEntity, Estimatable, Moodable } from "./common.model";
import { RateDetail, RatePlan } from "./rates.model";
import { Task } from "./tasks.model";
import { Tracking } from "./tracking.model";

export interface Project extends BaseContentEntity, Estimatable, Moodable {
  title: string;
  active: boolean;
  client: Client;
  url: string | null;
  rates?: RateDetail[];
  ratePlan: RatePlan | null;
  tasks?: Task[];
  code: string;
  description: string | null;
  priority: number | null;
  startDate: string | null;
  endDate: string | null;
}

interface ProjectUpdateRelations {
  rates?: Pick<RateDetail, 'id'>[];
  tasks?: Pick<Task, 'id'>[];
  client?: Pick<Client, 'id'>;
}

export type ProjectCreate = Omit<Project, 'id'>;
export type ProjectUpdate = Partial<Omit<Project, 'id' | 'rates' | 'client' | 'tasks'>> & ProjectUpdateRelations;

export interface ProjectDetail extends Project {
  tracking: Tracking[];
}

export function isProject(data: unknown): data is Project {
  return data !== null
    && typeof data === 'object'
    && 'id' in data
    && 'code' in data
    && 'title' in data;
}