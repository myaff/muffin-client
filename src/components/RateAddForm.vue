<script setup lang="ts">
import useRate from '@/composables/useRate';
import { Rate, RateType } from '@/models/rates.model';
import { useRatesStore } from '@/store/rates';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { PropType, reactive, ref } from 'vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  currency: {
    type: String,
    default: '',
  },
  type: {
    type: String as PropType<RateType>,
    default: '',
  },
  values: {
    type: Array as PropType<number[]>,
    default: () => [],
  },
});
const emits = defineEmits(['cancel', 'submit', 'create']);
const { t, n, d } = useI18n();
const ratesStore = useRatesStore();
if (!ratesStore.list.length) ratesStore.fetchList();
const ratesMap = computed(() => {
  return ratesStore.list.reduce((acc, rate) => {
    if (!acc[rate.id]) acc[rate.id] = rate;
    return acc;
  }, {} as { [key: number]: Rate })
})
const formData = reactive({
  rates: props.values
});
const currentCurrency = computed(() => {
  if (props.currency) return props.currency;
  if (formData.rates.length) return ratesMap.value[formData.rates.at(0) as number].currency.id
  return '';
});
const currentType = computed(() => {
  if (props.type) return props.type;
  if (formData.rates.length) return ratesMap.value[formData.rates.at(0) as number].type;
  return '';
})
const rates = computed(() => {
  if (!currentCurrency.value && !currentType.value) return ratesStore.list;
  return ratesStore.list.filter(rate => {
    let res = true;
    if (res && currentCurrency.value) res =  rate.currency.id === currentCurrency.value;
    if (res && currentType.value) res = rate.type === currentType.value;
    return res;
  });
});
const rules = {
  rates: { required },
};
const $v = useVuelidate(rules, formData);
const { formatRateForSelect } = useRate({ t, n, d });
const submit = async () => {
  const isValid = await $v.value.$validate();
  if (!isValid) return;
  emits('submit', formData.rates);
}
</script>

<template>
  <v-card :title="t('rates.add')">
    <v-card-item>
      <v-form @submit="submit">
        <v-select 
          v-model="$v.rates.$model" 
          :items="rates"
          item-value="id"
          :item-props="(rate) => formatRateForSelect(rate)"
          multiple
          :error-messages="$v.rates.$errors.map(e => e.$message as string)" />
      </v-form>
    </v-card-item>
    <v-card-actions class="px-6 pb-6">
      <v-btn @click="emits('create')">
        {{ t('rates.create') }}
      </v-btn>
      <v-spacer />
      <v-btn @click="emits('cancel')">
        {{ t('btn.cancel') }}
      </v-btn>
      <v-btn color="primary" variant="flat" @click="submit">
        {{ t('btn.submit') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>