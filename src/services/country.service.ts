import { ApiService } from "./api.service";
import { Country } from "@/models/country.model";
import { AxiosError } from "axios";

export class CountryService extends ApiService {
  resource = '/country';
  findAll() {
    return CountryService.api.get<Country[]>(this.resource)
    .then(res => res.data)
    .catch((error: AxiosError) => {
      throw { title: error.code, message: error.message };
    });
  }
}