import { ListService } from "@/models/service.model";
import { ApiService } from "./api.service";
import { AxiosError } from "axios";
import { Bank, BankSearchReqParams } from "@/models/bank.model";

export class BankService extends ApiService implements ListService<Bank, BankSearchReqParams> {
  resource = '/bank';
  findAll(params?: BankSearchReqParams) {
    return BankService.api.get<Bank[]>(this.resource, { params })
    .then(res => res.data)
    .catch((error: AxiosError) => {
      throw { title: error.code, message: error.message };
    });
  }
}