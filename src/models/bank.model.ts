import { BaseContentEntity, FetchListParams } from "./common.model";
import { Country } from "./country.model";

export interface Bank extends BaseContentEntity {
  bic8: string;
  bic11: string;
  branchCode: string;
  country: Country;
  name: string;
  registeredAddress: string;
  operationalAddress: string;
  branchDescription: string;
  branchAddress: string;
  instType: string;
}

export interface BankSearchReqParams extends FetchListParams {
  country: string;
  query: string;
}