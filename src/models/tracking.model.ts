import { RateDetail } from "./rates.model";
import { Task } from "./tasks.model";

export interface Tracking {
  id: number;
  task: Task;
  date: string;
  note?: string;
  hours: number;
  rate: RateDetail;
}

export interface TrackingCreate {
  task: Task;
  date: string;
  hours: number;
  note?: string;
}

export type TrackingUpdate = Partial<Tracking> & Pick<Tracking, 'id'>;

export function isTracking(data: unknown): data is Tracking {
  return data !== null
    && typeof data === 'object'
    && 'id' in data
    && 'task' in data
    && 'date' in data
    && 'hours' in data;
}

export interface TrackingDateFilter {
  dateFrom: Date;
  dateTo: Date;
}

export interface TrackingExtraFilter {
  project?: number[],
  client?: number | null;
}

export type TrackingFilter = TrackingDateFilter & TrackingExtraFilter;

export interface TrackingDay {
  tracking: Tracking[];
  total: number;
}