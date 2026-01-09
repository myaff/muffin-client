import { BankAccount } from "./bankAccount.model";
import { Client } from "./clients.model";
import { BaseContentEntity } from "./common.model";

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface TransactionCategory extends BaseContentEntity {
  name: string;
  income: boolean;
  expense: boolean;
}

export type TransactionCategoryCreate = Omit<TransactionCategory, 'id' | 'createdAt' | 'updatedAt'>;
export type TransactionCategoryUpdate = Partial<TransactionCategoryCreate>;

export interface Transaction extends BaseContentEntity {
  invoice?: any;
  client?: Client;
  bankAccount: BankAccount;
  date: string;
  amount: number;
  type: TransactionType;
  note?: string;
  categories: TransactionCategory[];
}

export type TransactionCreate = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'invoice' | 'client' | 'bankAccount' | 'categories'>
  & {
    bankAccount: Pick<BankAccount, 'id'>;
    client?: Pick<Client, 'id'>;
    categories: Pick<TransactionCategory, 'id'>[];
  }

export type TransactionUpdate = Partial<TransactionCreate>;