import { AvailableLocales } from "@/i18n";
import { Currency } from "./currency.model";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  lang: AvailableLocales;
  currency: Pick<Currency, 'id'>;
}

export interface UserSignIn {
  email: string;
  password: string;
}

export type UserSignUp = UserSignIn & Omit<User, 'id'>;

export interface Token {
  token: string;
  expiresAt: string | number;
}

export interface Signed {
  accessToken: Token;
  refreshToken: Token;
}