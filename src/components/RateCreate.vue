<script setup lang="ts">
import { onMounted, reactive, computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useAppStore } from '@/store/app';
import { RateType } from '@/models/rates.model';
import { format } from 'date-fns';

const props = defineProps({
  currency: {
    type: String,
    default: undefined,
  },
  type: {
    type: String as PropType<RateType>,
    default: undefined,
  },
  lockCurrency: Boolean,
  lockType: Boolean,
})

const { t } = useI18n();
const DATE_FORMAT = 'yyyy-MM-dd';
const appStore = useAppStore();
const currencies = computed(() => appStore.currencies);
onMounted(() => {
  if (!currencies.value.length) appStore.fetchCurrencies();
});
// form
const formInitialData = {
  currency: props.currency ? props.currency : 'RUB',
  amount: null as number | null,
  type: props.type ? props.type : RateType.HOURLY,
  dateFrom: format(new Date(), DATE_FORMAT),
  dateTo: null,
};
const formData = reactive(formInitialData);
const rules = {
  currency: { required },
  amount: { required },
  dateFrom: { required },
};
const $v = useVuelidate(rules, formData);
const emits = defineEmits(['submit', 'cancel']);
const submit = async () => {
  const isValid = await $v.value.$validate();
  if (isValid) emits('submit', formData);
}
const cancel = () => {
  emits('cancel');
}
</script>

<template>
  <v-card :title="t('rates.create')">
    <v-card-item>
      <v-form @keyup.enter="submit">
        <v-select
          v-model="formData.currency"
          :items="currencies"
          :label="t('rates.fields.currency')"
          :item-props="item => ({ title: `${item.symbol} - ${item.name}` })"
          item-value="id"
          :disabled="lockCurrency && !!formData.currency"
          :error-messages="$v.currency.$errors.map(e => e.$message as string)"
          @blur="$v.currency.$touch" />
        <v-text-field
          v-model.number="formData.amount"
          type="number"
          :label="t('rates.fields.value')"
          :error-messages="$v.currency.$errors.map(e => e.$message as string)"
          @blur="$v.currency.$touch" />
        <v-radio-group
          v-model="formData.type"
          inline
          :disabled="lockType && !!formData.type"
          :label="t('rates.fields.type')">
          <v-radio
            v-for="item in Object.values(RateType)"
            :key="item"
            :value="item"
            :label="t(`rates.types.${item}.title`)"
            class="mr-4" />
        </v-radio-group>
        <v-row>
          <v-col>
            <v-text-field
              v-model="formData.dateFrom"
              type="date"
              :label="t('rates.fields.dateFrom')"
              :error-messages="$v.dateFrom.$errors.map(e => e.$message as string)"
              @blur="$v.dateFrom.$touch" />
          </v-col>
          <v-col>
            <v-text-field
              v-model="formData.dateTo"
              type="date"
              :label="t('rates.fields.dateTo')" />
          </v-col>
        </v-row>
      </v-form>
    </v-card-item>
    <v-card-actions class="px-6 pb-6">
      <v-spacer />
      <v-btn @click="cancel">{{ t('btn.cancel') }}</v-btn>
      <v-btn color="primary" variant="flat" @click="submit">{{ t('btn.submit') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>