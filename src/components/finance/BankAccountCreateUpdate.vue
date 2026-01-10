<script setup lang="ts">
import { reactive, ref, computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { BankAccount, BankAccountCreate } from '@/models/bankAccount.model';
import { useAppStore } from '@/store/app';
import { BankService } from '@/services/bank.service';
import { Bank } from '@/models/bank.model';
import { debounce } from 'lodash-es';

const props = defineProps({
  bankAccount: {
    type: Object as PropType<BankAccount | null>,
    default: null,
  },
})
const emits = defineEmits(['submit', 'cancel']);
const { t, locale } = useI18n();

const appStore = useAppStore();
const currencies = computed(() => appStore.currencies);
const countries = computed(() => {
  return appStore.countries.map(item => {
    let title = locale.value === 'ru' && item.nameRu
      ? item.nameRu
      : item.name;
    if (!title) title = item.name;
    return {
      ...item,
      title,
      subtitle: title === item.nameNative ? '' : item.nameNative,
    };
  })
});
const bankService = new BankService();
const banks = ref<Bank[]>([]);
// form
const formInitialData = {
  name: props.bankAccount?.name ?? '',
  bank: props.bankAccount?.bank ?? null,
  active: props.bankAccount?.active ?? true,
  currency: props.bankAccount?.currency?.id ?? null,
  country: props.bankAccount?.country?.iso2 ?? null,
  startingBalance: props.bankAccount?.startingBalance ?? 0,
  balance: props.bankAccount?.balance ?? 0,
};

const formData = reactive(formInitialData);
const rules = {
  name: { required },
  currency: { required },
  country: { required },
};
const $v = useVuelidate(rules, formData);
const submit = async () => {
  const isValid = await $v.value.$validate();
  if (isValid) {
    const payload = {
      ...formData,
      currency: { id: formData.currency },
      country: { iso2: formData.country },
    } as Partial<BankAccountCreate>;
    emits('submit', payload);
  }
}
const cancel = () => {
  emits('cancel');
}
const onBankSearch = (query: string) => {
  if (!formData.country || query.length < 3) return;
  bankService.findAll({ country: formData.country, query })
    .then(data => {
      if (data.length) banks.value = data;
    })
}
</script>

<template>
  <v-card :title="bankAccount ? t('bankAccount.update') : t('bankAccount.create')">
    <v-card-item>
      <v-form @keyup.enter="submit">
        <v-textarea
          v-model="formData.name"
          class="mb-4"
          :label="t('bankAccount.fields.name')"
          :error-messages="$v.name.$errors.map(e => e.$message as string)"
          rows="1"
          auto-grow
          @blur="$v.name.$touch" />
        <v-row>
          <v-col cols="12" md="6">
            <v-autocomplete
              v-if="currencies.length"
              v-model="formData.currency"
              :items="currencies"
              :label="t('bankAccount.fields.currency')"
              :item-props="item => ({ title: `${item.symbol} - ${item.name}` })"
              item-title="name"
              item-value="id"
              :error-messages="$v.currency.$errors.map(e => e.$message as string)"
              @blur="$v.currency.$touch" />
            <v-autocomplete
              v-if="countries.length"
              v-model="formData.country"
              :items="countries"
              :label="t('bankAccount.fields.country')"
              item-title="title"
              item-value="iso2"
              :filter-keys="['id', 'raw.name', 'raw.nameRu', 'raw.nameNative', 'raw.iso3']"
              :error-messages="$v.country.$errors.map(e => e.$message as string)"
              @blur="$v.country.$touch">
              <template v-slot:item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :subtitle="item.raw.subtitle ?? ''"
                  :title="item.title">
                  <template #prepend>
                    <span class="noto-emoji mr-4">
                      {{ item.raw.emoji }}
                    </span>
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
            <v-autocomplete
              v-model="formData.bank"
              :items="banks"
              :label="t('bankAccount.fields.bank')"
              :disabled="!formData.country"
              item-title="name"
              item-value="id"
              @update:search="(val: string) => debounce(onBankSearch, 500)(val)" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="formData.startingBalance"
              type="number"
              :label="t('bankAccount.fields.startingBalance')" />
            <v-text-field
              v-model.number="formData.balance"
              type="number"
              :label="t('bankAccount.fields.balance')" />
            <v-switch
              v-model="formData.active"
              :label="formData.active ? t('bankAccount.active') : t('bankAccount.notActive')"
              :color="formData.active ? 'success' : 'default'" />
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