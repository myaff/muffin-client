<script setup lang="ts">
import { reactive, computed, PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useClientsStore } from '@/store/clients';
import { addBusinessDays, format, startOfMonth } from 'date-fns';
import { Invoice, InvoiceCreate, InvoiceEntryPreview, InvoicePreviewParams, InvoiceStatus } from '@/models/invoice.model';
import { Client } from '@/models/clients.model';
import InvoiceEntriesCreateUpdate from './InvoiceEntriesCreateUpdate.vue';
import { useInvoicesStore } from '@/store/invoices';
import { RateType } from '@/models/rates.model';

const props = defineProps({
  invoice: {
    type: Object as PropType<Invoice | null>,
    default: null,
  },
  client: {
    type: Object as PropType<Client | null>,
    default: null,
  },
  startDate: {
    type: String,
    default: null,
  },
  endDate: {
    type: String,
    default: null,
  },
})
const emits = defineEmits(['submit', 'cancel']);
const { t } = useI18n();

const clientsStore = useClientsStore();
const clients = computed(() => clientsStore.list);
const invoicesStore = useInvoicesStore();

const isLoading = ref(false);
const entries = ref<Map<string, InvoiceEntryPreview>>(new Map());
const total = ref(0);

// form
const FORMAT = 'yyyy-MM-dd';
const formInitialData = {
  client: props.invoice?.client?.id ?? props.client?.id ?? null,
  startDate: props.invoice?.startDate ?? props.startDate ?? format(startOfMonth(new Date()), FORMAT),
  endDate: props.invoice?.endDate ?? props.endDate ?? format(new Date(), FORMAT),
  issuedDate: props.invoice?.issuedDate ?? format(new Date(), FORMAT),
  dueDate: props.invoice?.dueDate ?? format(addBusinessDays(new Date(), 10), FORMAT),
  paidDate: props.invoice?.paidDate ?? null,
  status: props.invoice?.status ?? InvoiceStatus.DRAFT,
  type: RateType.HOURLY,
};
const selectedClient = computed(() => {
  return clients.value.find(item => item.id === formData.client);
});
const currency = computed(() => {
  if (props.client) return props.client.country.currency.id;
  return clients.value.find(item => item.id === formData.client)?.country?.currency.id;
})

const formData = reactive(formInitialData);
const rules = {
  client: { required },
  startDate: { required },
  endDate: { required },
};
const $v = useVuelidate(rules, formData);
const filter = computed(() => ({
  type: formData.type,
  clientId: formData.client,
  ...(!!formData?.startDate && { dateFrom: formData.startDate }),
  ...(!!formData?.endDate && { dateTo: formData.endDate }),
}));
const selected = ref<string[]>([]);
const entriesNames = ref<{ [key: string]: string }>({});
watch(selected, value => {
  total.value = value.reduce((sum, key) => {
    sum += entries.value.get(key)?.total ?? 0;
    return sum;
  }, 0);
});

function fetchPreview(params: InvoicePreviewParams) {
  isLoading.value = true;
  return invoicesStore.service
    .findPreview(params)
    .then(data => {
      entries.value = new Map(data.entries.map(entry => [entry.key, entry]));
      entries.value.forEach(entry => {
        selected.value.push(entry.key);
        entriesNames.value[entry.key] = entry.name;
      });
      total.value = data.total;
    })
    .finally(() => isLoading.value = false);
}
watch(filter, (value) => {
  if (value?.clientId) fetchPreview(value as InvoicePreviewParams);
}, { immediate: true, flush: 'post' });

const statuses = computed(() => {
  return Object.values(InvoiceStatus).map(key => ({
    value: key,
    title: t(`invoice.status.${key}`),
  }));
});

const submit = async () => {
  const isValid = await $v.value.$validate();
  if (isValid && selected.value.length) {
    const selectedEntries = selected.value.reduce((list, key) => {
      const name = entriesNames.value[key];
      if (name) list.push({ key, name  });
      return list;
    }, [] as Pick<InvoiceEntryPreview, 'key' | 'name'>[]);
    const payload = {
      ...formData,
      client: { id: formData.client },
      currency: { id: currency.value },
      entries: selectedEntries,
    } as Partial<InvoiceCreate>;
    emits('submit', payload);
  }
}
const cancel = () => {
  emits('cancel');
}
</script>

<template>
  <v-card :title="invoice ? t('invoice.update') : t('invoice.create')">
    <v-card-item>
      <v-form @keyup.enter="submit">
        <v-row>
          <v-col cols="12" md="4">
            <v-autocomplete
              v-if="clients.length"
              v-model="formData.client"
              :items="clients"
              :label="t('invoice.fields.client')"
              item-title="name"
              item-value="id"
              class="mb-4"
              :error-messages="$v.client.$errors.map(e => e.$message as string)"
              @blur="$v.client.$touch" />
            <v-text-field
              type="date"
              v-model="formData.startDate"
              :label="t('invoice.fields.startDate')"
              class="mb-4"
              :error-messages="$v.startDate.$errors.map(e => e.$message as string)"
              @blur="$v.startDate.$touch" />
            <v-text-field
              type="date"
              v-model="formData.endDate"
              :label="t('invoice.fields.endDate')"
              :error-messages="$v.endDate.$errors.map(e => e.$message as string)"
              @blur="$v.endDate.$touch" />
            <v-text-field
              type="date"
              v-model="formData.issuedDate"
              :label="t('invoice.fields.issuedDate')"
              class="mb-4" />
            <v-text-field
              type="date"
              v-model="formData.dueDate"
              :label="t('invoice.fields.dueDate')"
              class="mb-4" />
            <v-autocomplete
              v-model="formData.status"
              :items="statuses"
              :label="t('invoice.fields.status')"
              item-title="title"
              item-value="value"
              class="mb-4">
            </v-autocomplete>
            <v-text-field
              v-if="formData.status === InvoiceStatus.PAID"
              type="date"
              v-model="formData.paidDate"
              :label="t('invoice.fields.paidDate')"
              class="mb-4" />
          </v-col>
          <v-col cols="12" md="8">
            <InvoiceEntriesCreateUpdate
              v-if="selectedClient"
              :client="selectedClient"
              :entries="entries"
              :is-loading="isLoading"
              v-model:names="entriesNames"
              v-model:selected="selected"
              :total="total" />
          </v-col>
        </v-row>
      </v-form>
    </v-card-item>
    <v-card-actions class="px-6 pb-6">
      <v-spacer />
      <v-btn @click="cancel">
        {{ t('btn.cancel') }}
      </v-btn>
      <v-btn color="primary" variant="flat" @click="submit">
        {{ t('btn.submit') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>