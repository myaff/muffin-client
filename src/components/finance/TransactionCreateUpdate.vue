<script setup lang="ts">
import { reactive, ref, computed, PropType, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { minValue, required } from '@vuelidate/validators';
import { BankService } from '@/services/bank.service';
import { Bank } from '@/models/bank.model';
import { debounce } from 'lodash-es';
import { Transaction, TransactionCreate, TransactionType } from '@/models/transaction.model';
import { useTransactionsCategorieStore } from '@/store/transactionCategoriesStore';
import { useBankAccountsStore } from '@/store/bankAccounts';
import { useClientsStore } from '@/store/clients';
import useCreateUpdate from '@/composables/useCreateUpdate';
import useError from '@/composables/useError';
import TransactionCategoryCreateUpdate from './TransactionCategoryCreateUpdate.vue';
import { format } from 'date-fns';

const props = defineProps({
  transaction: {
    type: Object as PropType<Transaction | null>,
    default: null,
  },
})
const emits = defineEmits(['submit', 'cancel']);
const { t } = useI18n();

const bankAccountsStore = useBankAccountsStore();
const bankAccounts = computed(() => bankAccountsStore.list);
const clientsStore = useClientsStore();
const clients = computed(() => clientsStore.list);

// form
const FORMAT = 'yyyy-MM-dd';
const formInitialData = {
  bankAccount: props.transaction?.bankAccount?.id ?? null,
  client: props.transaction?.client?.id ?? null,
  date: props.transaction?.date ?? format(new Date(), FORMAT),
  amount: props.transaction?.amount ?? 0,
  type: props.transaction?.type ?? TransactionType.INCOME,
  categories: props.transaction?.categories.map(item => item.id) ?? [],
  note: props.transaction?.note ?? '',
};
const transactionCategoriesStore = useTransactionsCategorieStore();
const categories = computed(() => {
  return transactionCategoriesStore.list
    .filter(item => {
      return formData.type === TransactionType.INCOME
        ? item.income
        : item.expense;
    })
});

const formData = reactive(formInitialData);
const rules = {
  amount: { required, minValue: minValue(0.01) },
  bankAccount: { required },
  type: { required },
  date: { required },
};
const $v = useVuelidate(rules, formData);
watch(() => formData.type, () => {
  formData.categories = [];
})
const submit = async () => {
  const isValid = await $v.value.$validate();
  if (isValid) {
    const payload = {
      ...formData,
      bankAccount: { id: formData.bankAccount },
      categories: formData.categories.map(id => ({ id })),
      ...(formData.client && { client: { id: formData.client } }),
    } as Partial<TransactionCreate>;
    emits('submit', payload);
  }
}
const cancel = () => {
  emits('cancel');
}

const {
  isSending,
  sendingError,
  creationIsOpen,
  openCreation,
  create,
  cancel: cancelCreation,
} = useCreateUpdate({
  store: transactionCategoriesStore,
  onError: (e) => useError(e, t),
});
</script>

<template>
  <v-card :title="transaction ? t('transaction.update') : t('transaction.create')">
    <v-card-item>
      <v-form @keyup.enter="submit">
        <v-radio-group v-model="formData.type" inline>
          <template #prepend>
            <span class="text-medium-emphasis">
              {{ t('transaction.fields.type') }}
            </span>
          </template>
          <v-radio :value="TransactionType.INCOME" :label="t('finance.income')" class="mr-4" />
          <v-radio :value="TransactionType.EXPENSE" :label="t('finance.outcome')" />
        </v-radio-group>
        <v-text-field
          v-model.number="formData.amount"
          type="number"
          class="mb-4"
          :label="t('transaction.fields.amount')"
          :error-messages="$v.amount.$errors.map(e => e.$message as string)"
          @blur="$v.amount.$touch" />
        <v-autocomplete
          v-if="bankAccounts.length"
          v-model="formData.bankAccount"
          :items="bankAccounts"
          :label="t('transaction.fields.bankAccount')"
          item-title="name"
          item-value="id"
          class="mb-4"
          :error-messages="$v.bankAccount.$errors.map(e => e.$message as string)"
          @blur="$v.bankAccount.$touch" />
        <v-text-field
            type="date"
            :model-value="formData.date"
            :label="t('transaction.fields.date')"
            class="mb-4" />
        <v-autocomplete
          v-model="formData.categories"
          :items="categories"
          :label="t('transaction.fields.category')"
          item-title="name"
          item-value="id"
          class="mb-4"
          multiple
          clearable>
          <template #append>
            <v-btn elevation="0" variant="plain" icon="mdi-plus" @click="openCreation" />
          </template>
        </v-autocomplete>
        <v-autocomplete
          v-if="clients.length"
          v-model="formData.client"
          :items="clients"
          :label="t('transaction.fields.client')"
          item-title="name"
          item-value="id"
          class="mb-4"
          clearable />
        <v-textarea
          v-model="formData.note"
          class="mb-4"
          :label="t('transaction.fields.note')"
          rows="1"
          auto-grow />
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
    <v-dialog v-model="creationIsOpen" width="40vw" max-width="1280">
      <template v-if="!sendingError">
        <TransactionCategoryCreateUpdate
          :income="formData.type === TransactionType.INCOME"
          :expense="formData.type === TransactionType.EXPENSE"
          @cancel="cancelCreation"
          @submit="(e) => create(e)" />
        <v-overlay v-model="isSending" contained class="align-center justify-center">
          <v-progress-circular indeterminate />
        </v-overlay>
      </template>
      <v-alert v-else :title="sendingError?.title" :text="sendingError?.message" type="error" />
      <v-btn
        v-if="creationIsOpen && !isSending"
        icon="mdi-close"
        class="close-dialog"
        variant="plain"
        @click="cancelCreation" />
    </v-dialog>
  </v-card>
</template>