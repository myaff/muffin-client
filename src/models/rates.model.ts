import { Client } from "./clients.model";
import { BaseContentEntity } from "./common.model";
import { Currency } from "./currency.model";
import { Project } from "./projects.model";

export enum RateType {
  HOURLY = 'hourly',
  RECURRING = 'recurring',
  FIXED = 'fixed',
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

export interface RateVersion extends BaseContentEntity {
  ratePlan: RatePlan;
  amount: number;
  startDate: string;
  endDate: string | null;
  recurringCount: number;
  includedHours: number;
  overageHourly: number | null;
  editable: boolean;
  deletable: boolean;
}

export type RateVersionCreate = Omit<RateVersion, 'id' | 'createdAt' | 'updatedAt' | 'ratePlan' | 'editable' | 'deletable'> & {
  ratePlan: Pick<RatePlan, 'id'>;
};

export type RateVersionUpdate = Omit<RateVersionCreate, 'ratePlan'>;

export interface RatePlan extends BaseContentEntity {
  currency: Currency;
  name: string;
  type: RateType;
  recurringUnit: RateRecurringUnit | null;
  scope: RateScope;
  active: boolean;
}

export interface RatePlanWithVersions extends RatePlan {
  versions: Omit<RateVersion, 'ratePlan'>[];
}

export interface RatePlanWithRelations extends RatePlan {
  client: Client | null;
  project: Project | null;
}

export type RatePlanFull = RatePlanWithVersions & RatePlanWithRelations;

export type RatePlanCreate = Omit<RatePlan, 'id' | 'createdAt' | 'updatedAt'> & {
  client?: Pick<Client, 'id'>;
  project?: Pick<Project, 'id'>;
  version: Omit<RateVersionCreate, 'ratePlan'>;
}

export type RatePlanUpdate = Omit<RatePlanCreate, 'version'>;