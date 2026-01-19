import { Client } from "./clients.model";
import { BaseContentEntity } from "./common.model";
import { Currency } from "./currency.model";
import { Project } from "./projects.model";
import { RateType } from "./rates.model";
import { Task } from "./tasks.model";
import { Tracking, TrackingLight } from "./tracking.model";

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PARTLY_PAID = 'partly-paid',
  PAID = 'paid',
}

export enum InvoiceEntryUnit {
  HOUR = 'HOUR',
  PCS = 'PCS',
}

export interface InvoiceEntry extends BaseContentEntity {
  name: string;
  pricePerUnit: number;
  count: number;
  total: number;
  invoice: Omit<Invoice, 'entries'>;
}

export type InvoiceEntryCreate = Omit<InvoiceEntry, 'id' | 'createdAt' | 'updatedAt' | 'invoice' | 'total'> & {
  tracking: Pick<Tracking, 'id'>[];
};

export type InvoiceEntryUpdate = Partial<InvoiceEntryCreate & { invoice: Pick<Invoice, 'id'> }>;

export interface Invoice extends BaseContentEntity {
  client: Client;
  startDate: string;
  endDate: string;
  issuedDate: string;
  dueDate: string;
  paidDate: string;
  currency: Currency;
  total: number;
  status: InvoiceStatus;
  entries: Omit<InvoiceEntry, 'invoice'>[];
}

export type InvoiceCreate = Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'entries' | 'client' | 'currency'> & {
  entries: Pick<InvoiceEntryPreview, 'key' | 'name'>[];
  client: Pick<Client, 'id'>;
  currency: Pick<Currency, 'id'>;
}

export type InvoiceUpdate = Partial<InvoiceCreate & { entries: InvoiceEntryUpdate[] }>;

export interface InvoiceEntryPreview extends Omit<InvoiceEntry, 'id' | 'createdAt' | 'updatedAt' | 'invoice' | 'tracking'> {
  key: string;
  unit: InvoiceEntryUnit;
  tracking: TrackingLight[];
}

export interface InvoicePreview {
  entries: InvoiceEntryPreview[];
  tasks: Task[];
  projects: Project[];
  total: number;
}

export interface InvoicePreviewParams {
  clientId: Client['id'];
  projectId?: Project['id'];
  type: RateType;
  dateFrom?: string;
  dateTo?: string;
}