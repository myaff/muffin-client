import { BaseContentEntity, Moodable } from "./common.model";
import { Country } from "./country.model";
import { RatePlan } from "./rates.model";

export interface Client extends BaseContentEntity, Moodable {
  name: string;
  country: Country;
  ratePlan: RatePlan | null;
  fullName: string | null;
  active: boolean;
  region: string | null;
  city: string | null;
  streetAddress: string | null;
  zipCode: number | null;
  taxId: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
}

export type ClientCreate = Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'country' | 'ratePlan'> & {
  country: Pick<Country, 'iso2'>
  ratePlan?: Pick<RatePlan, 'id'>;
};
export type ClientUpdate = Partial<Client>;

export function isClient(data: unknown): data is Client {
  return data !== null
    && typeof data === 'object'
    && 'id' in data
    && 'name' in data
    && 'country' in data;
}