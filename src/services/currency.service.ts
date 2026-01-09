import { ApiService } from "./api.service";
import { Currency } from "@/models/currency.model";
import { AxiosError } from "axios";

export class CurrencyService extends ApiService {
  resource = '/currency';
  findAll() {
    return CurrencyService.api.get<Currency[]>(this.resource)
    .then(res => res.data)
    .catch((error: AxiosError) => {
      throw { title: error.code, message: error.message };
    });
  }
}