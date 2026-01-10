import { Bank } from "./bank.model";
import { BaseContentEntity } from "./common.model";
import { Country } from "./country.model";
import { Currency } from "./currency.model";

export interface BankAccount extends BaseContentEntity {
  bank?: Bank;
  currency: Currency;
  country: Country;
  name: string;
  startingBalance: number;
  balance: number;
  active: boolean;
}

export type BankAccountCreate = Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt' | 'bank' | 'balance' | 'country' | 'currency'> & {
  country: Pick<Country, 'iso2'>;
  currency: Pick<Currency, 'id'>;
  bank?: Pick<Bank, 'bic11'>;
};

export type BankAccountUpdate = Partial<BankAccountCreate>;