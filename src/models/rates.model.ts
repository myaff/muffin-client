import { Client } from "./clients.model";
import { BaseContentEntity } from "./common.model";
import { Currency } from "./currency.model";
import { Project } from "./projects.model";

export enum RateType {
  HOURLY = 'hourly',
  RECURRING = 'recurring',
  FIXED = 'fixed',
}

export interface Rate {
  currency: Pick<Currency, 'id'>;
  amount: number;
  type: RateType;
}

export interface RateDetail extends Rate {
  id: number;
  dateFrom: string;
  dateTo: string | null;
  projects?: Project[];
}

export type RateCreate = Omit<RateDetail, 'id' | 'projects'> & { projects: Pick<Project, 'id'>[] }
export type RateUpdate = Partial<RateDetail>;

export function isRate(data: unknown): data is RateDetail {
  return data !== null
    && typeof data === 'object'
    && 'id' in data
    && 'currency' in data
    && 'amount' in data
    && 'type' in data;
}

export enum RateRecurringUnit {
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export enum RateScope {
  USER = 'user',
  CLIENT = 'client',
  PROJECT = 'project',
}

export interface RatePlan extends BaseContentEntity {
  currency: Currency;
  name: string;
  type: RateType;
  recurringUnit: RateRecurringUnit;
  scope: RateScope;
  active: boolean;
}

export interface RatePlanWithVersions extends RatePlan {
  versions: Omit<RateVersion, 'ratePlan'>[];
}

export interface RatePlanWithRelations extends RatePlan {
  client: Client;
  project: Project;
}

export type RatePlanFull = RatePlanWithVersions & RatePlanWithRelations;

export interface RateVersion extends BaseContentEntity {
  ratePlan: RatePlan;
  amount: number;
  startDate: string;
  endDate: string | null;
  recurringCount: number;
  includedHours: number;
  overageHourly: number | null;
}