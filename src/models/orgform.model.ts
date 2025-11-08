export interface Orgform {
  id: number;
  name: string;
  shortName: string;
}

export type OrgformCreate = Omit<Orgform, 'id'>;
export type OrgformUpdate = Partial<Orgform>;