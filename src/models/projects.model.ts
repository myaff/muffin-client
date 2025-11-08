import { Client } from "./clients.model";
import { RateDetail } from "./rates.model";
import { Task } from "./tasks.model";
import { Tracking } from "./tracking.model";

export interface Project {
  id: number;
  title: string;
  active: boolean;
  client: Client;
  url?: string;
  rates?: RateDetail[];
  tasks?: Task[];
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
    && 'title' in data;
}