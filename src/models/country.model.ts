import { Currency } from "./currency.model";

export interface Country {
  iso2: string;
  iso3: string;
  name: string;
  numericCode: number;
  phoneCode: string | null;
  capital: string | null;
  nameNative: string | null;
  nameRu: string | null;
  currency: Currency;
  latitude: number | null;
  longitude: number | null;
  tld: string | null;
  emoji: string | null;
  emojiu: string | null;
}