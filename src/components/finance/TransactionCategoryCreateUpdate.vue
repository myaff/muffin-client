<script setup lang="ts">
import { reactive, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { TransactionCategory, TransactionCategoryCreate } from '@/models/transaction.model';

const props = defineProps({
  transactionCategory: {
    type: Object as PropType<TransactionCategory | null>,
    default: null,
  },
  income: {
    type: Boolean,
    default: false,
  },
  expense: {
    type: Boolean,
    default: true,
  },
})
const emits = defineEmits(['submit', 'cancel']);
const { t } = useI18n();

// form
const formInitialData = {
  name: props.transactionCategory?.name ?? '',
  income: props.transactionCategory?.income ?? props.income,
  expense: props.transactionCategory?.expense ?? props.expense,
};

const formData = reactive(formInitialData);
const rules = {
  name: { required },
};
const $v = useVuelidate(rules, formData);
const submit = async () => {
  const isValid = await $v.value.$validate();
  if (isValid) {
    const payload = {
      ...formData,
    } as Partial<TransactionCategoryCreate>;
    emits('submit', payload);
  }
}
const cancel = () => {
  emits('cancel');
}
</script>

<template>
  <v-card :title="transactionCategory ? t('transactionCategory.update') : t('transactionCategory.create')">
    <v-card-item>
      <v-form @keyup.enter="submit">
        <v-text-field
          v-model="formData.name"
          type="text"
          class="mb-4"
          :label="t('transactionCategory.fields.name')" />
        <div class="d-flex ga-4">
          <v-checkbox v-model="formData.income" :label="t('transactionCategory.fields.income')" />
          <v-checkbox v-model="formData.expense" :label="t('transactionCategory.fields.expense')" />
        </div>
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