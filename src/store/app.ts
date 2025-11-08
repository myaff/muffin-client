// Utilities
import { Currency } from '@/models/currency.model';
import { Orgform } from '@/models/orgform.model';
import { Status } from '@/models/status.model';
import { CurrencyService } from '@/services/currency.service';
import { OrgformService } from '@/services/orgforms.service';
import { StatusService } from '@/services/status.service';
import { defineStore } from 'pinia'
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const orgformService = new OrgformService();
  const orgforms = ref<Orgform[]>([]);

  const fetchOrgforms = () => {
    return orgformService.findAll()
      .then(data => {
        orgforms.value = data;
      });
  }

  const currencyService = new CurrencyService();
  const currencies = ref<Currency[]>([]);

  const fetchCurrencies = () => {
    return currencyService.findAll()
      .then(data => {
        currencies.value = data;
      })
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
    orgforms, fetchOrgforms, 
    currencies, fetchCurrencies,
    statuses, fetchStatuses,
  };
});
