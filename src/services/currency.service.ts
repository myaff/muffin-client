import { ListService } from "@/models/service.model";
import { ApiService } from "./api.service";
import { Currency } from "@/models/currency.model";
import { AxiosError } from "axios";

export class CurrencyService extends ApiService implements ListService<Currency> {
  resoucrce = '/currency';
  findAll() {
    return CurrencyService.api.get<Currency[]>(this.resoucrce)
    .then(res => res.data)
    .catch((error: AxiosError) => {
      throw { title: error.code, message: error.message };
    });
  }
}