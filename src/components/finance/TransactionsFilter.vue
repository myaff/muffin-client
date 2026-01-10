<script setup lang="ts">
import { BankAccount } from '@/models/bankAccount.model';
import { Client } from '@/models/clients.model';
import { FilterParams } from '@/models/common.model';
import { TransactionCategory, TransactionType } from '@/models/transaction.model';
import { useBankAccountsStore } from '@/store/bankAccounts';
import { useClientsStore } from '@/store/clients';
import { useTransactionsCategorieStore } from '@/store/transactionCategoriesStore';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';

const emits = defineEmits(['update']);
const { t } = useI18n();

const clientsStore = useClientsStore();
const clients = computed(() => {
  return clientsStore.list;
})
const bankAccountsStore = useBankAccountsStore();
const bankAccounts = computed(() => {
  return bankAccountsStore.list;
})
const categoriesStore = useTransactionsCategorieStore();
const initFormData = {
  clients: [] as Client['id'][],
  bankAccounts: [] as BankAccount['id'][],
  categories: [] as TransactionCategory['id'][],
  type: 'all' as TransactionType | 'all',
  dateFrom: '',
  dateTo: '',
}
const formData = ref({ ...initFormData });
const categories = computed(() => {
  if (formData.value.type === 'all') return categoriesStore.list;
  return categoriesStore.list.filter(item => {
    if (formData.value.type === TransactionType.INCOME && item.income) return true;
    if (formData.value.type === TransactionType.EXPENSE && item.expense) return true;
    return false;
  });
});
const update = () => {
  const payload: FilterParams = { ...formData.value };
  if (payload.type === 'all') delete payload.type;
  emits('update', payload);
}
watch(formData, update, { deep: true });
const typeTogglerColor = computed(() => {
  switch(formData.value.type) {
    case TransactionType.INCOME:
      return 'success';
    case TransactionType.EXPENSE:
      return 'error';
    default:
      return 'primary';
  }
})
const showExtraFilter = ref(true);
const hasExtraFilter = computed(() => {
  return formData.value.clients?.length
  || formData.value.bankAccounts?.length
  || formData.value.categories?.length
  || formData.value.dateFrom
  || formData.value.dateTo;
})
const { xs, mdAndUp } = useDisplay();
watch(mdAndUp, value => {
  showExtraFilter.value = value;
})
</script>

<template>
  <div class="transactions-filter">
    <div class="transaction-filters__main d-flex justify-space-between align-center mb-4">
      <v-btn-toggle v-model="formData.type" :color="typeTogglerColor" :density="xs ? 'compact' : 'default'">
        <v-btn
          value="all"
          :text="t('finance.all')"
          :size="xs ? 'small' : 'default'" />
        <v-btn
          :value="TransactionType.INCOME"
          :text="t('finance.income')"
          prepend-icon="mdi-arrow-up"
          :size="xs ? 'small' : 'default'" />
        <v-btn
          :value="TransactionType.EXPENSE"
          :text="t('finance.outcome')"
          prepend-icon="mdi-arrow-down"
          :size="xs ? 'small' : 'default'" />
      </v-btn-toggle>
      <v-btn
        v-if="!mdAndUp"
        icon="mdi-filter-variant"
        variant="plain"
        size="small"
        slim
        @click="showExtraFilter = !showExtraFilter">
        <v-badge v-if="hasExtraFilter" dot color="error">
          <v-icon name="mdi-filter-variant" />
        </v-badge>
        <v-icon name="mdi-filter-variant" v-else />
      </v-btn>
    </div>
    <v-expand-transition>
      <div v-show="showExtraFilter" class="transactions-filters__extra">
        <v-select
          v-model="formData.clients"
          :items="clients"
          item-title="name"
          item-value="id"
          :label="t('transaction.fields.client')"
          multiple
          clearable
          chips
          hide-details
          class="mb-4" />
        <v-select
          v-model="formData.bankAccounts"
          :items="bankAccounts"
          item-title="name"
          item-value="id"
          :label="t('transaction.fields.bankAccount')"
          multiple
          clearable
          chips
          hide-details
          class="mb-4" />
        <v-select
          v-model="formData.categories"
          :items="categories"
          item-title="name"
          item-value="id"
          :label="t('transaction.fields.category')"
          multiple
          clearable
          chips
          hide-details
          class="mb-4" />
        <v-text-field
          v-model="formData.dateFrom"
          type="date"
          :label="t('date.from')"
          hide-details
          clearable
          class="mb-4" />
        <v-text-field
          v-model="formData.dateTo"
          type="date"
          :label="t('date.to')"
          hide-details
          clearable
          class="mb-4" />

      </div>
    </v-expand-transition>
  </div>
</template>