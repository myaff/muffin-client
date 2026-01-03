import { BaseContentEntity, Moodable } from "./common.model";
import { RateVersion } from "./rates.model";
import { Task } from "./tasks.model";

export interface Tracking extends BaseContentEntity, Moodable {
  task: Task;
  date: string;
  note?: string;
  amount: number;
  rateVersion: RateVersion;
}

export type TrackingCreate = Omit<Tracking, 'id' | 'createdAt' | 'updatedAt'> & {
  task: Pick<Task, 'id'>;
  // rateVersion: Pick<RateVersion, 'id'>;
};

export type TrackingUpdate = Partial<Tracking> & Pick<Tracking, 'id'>;

export function isTracking(data: unknown): data is Tracking {
  return data !== null
    && typeof data === 'object'
    && 'id' in data
    && 'task' in data
    && 'date' in data
    && 'amount' in data
    && 'rateVersion' in data;
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