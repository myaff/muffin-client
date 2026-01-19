import { BaseContentEntity, Moodable } from "./common.model";
import { Project } from "./projects.model";
import { RatePlan, RateVersion } from "./rates.model";
import { Task } from "./tasks.model";

export interface Tracking extends BaseContentEntity, Moodable {
  task: Task;
  date: string;
  note?: string;
  amount: number;
  rateVersion: RateVersion;
  billable: boolean;
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
  dateFrom: string;
  dateTo: string;
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

export interface TrackingDayDto extends TrackingDay {
  date: string;
}
export interface TrackingCalendarDto {
  [key: string]: TrackingDayDto;
}

export type TrackingLight = Omit<Tracking, 'task' | 'rateVersion'> & {
  task: Pick<Task, 'id'>;
  project: Pick<Project, 'id'>;
  rateVersion: Pick<RateVersion, 'id'>;
  ratePlan: Pick<RatePlan, 'id'>;
}
