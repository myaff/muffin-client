// Utilities
import { Country } from '@/models/country.model';
import { Currency } from '@/models/currency.model';
import { Status } from '@/models/status.model';
import { CountryService } from '@/services/country.service';
import { CurrencyService } from '@/services/currency.service';
import { StatusService } from '@/services/status.service';
import { defineStore } from 'pinia'
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {

  const currencyService = new CurrencyService();
  const currencies = ref<Currency[]>([]);

  const fetchCurrencies = () => {
    return currencyService.findAll()
      .then(data => {
        currencies.value = data;
      })
  }

  const countryService = new CountryService();
  const countries = ref<Country[]>([]);

  const fetchCountries = () => {
    return countryService.findAll()
      .then(data => countries.value = data);
  }

  const statusService = new StatusService();
  const statuses = ref<Status[]>([]);

  const fetchStatuses = () => {
    return statusService.findAll()
      .then(data => {
        statuses.value = data;
      });
  }

  return {
    currencies, fetchCurrencies,
    countries, fetchCountries,
    statuses, fetchStatuses,
  };
});
