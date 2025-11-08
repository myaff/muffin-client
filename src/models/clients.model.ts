import { Orgform } from "./orgform.model";

export enum ClientType {
  PERSON = 'person',
  COMPANY = 'company',
}

export interface Client {
  id: number;
  type: ClientType;
  name: string;
  orgform: Orgform;
}

export type ClientCreate = {
  type: ClientType;
  name: string;
  orgform: number;
}
export type ClientUpdate = Partial<Client>;

export function isClient(data: unknown): data is Client {
  return data !== null
    && typeof data === 'object'
    && 'id' in data
    && 'type' in data
    && typeof data.type === 'string'
    && Object.values<string>(ClientType).includes(data.type)
    && 'name' in data;
}