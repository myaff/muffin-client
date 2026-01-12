<script setup lang="ts">
import { onMounted, reactive, computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useAppStore } from '@/store/app';
import { RatePlan, RateType, RateVersion } from '@/models/rates.model';
import { format } from 'date-fns';

const props = defineProps({
  ratePlan: {
    type: Object as PropType<RatePlan>,
    required: true,
  },
  version: {
    type: Object as PropType<RateVersion>,
    default: null,
  },
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
  amount: props.version?.amount ?? null,
  startDate: props.version?.startDate ?? format(new Date(), DATE_FORMAT),
  endDate: props.version?.endDate ?? null,
  includedHours: props.version?.includedHours ?? 0,
  overageHourly: props.version?.overageHourly ?? 0,
  recurringCount: props.version?.recurringCount ?? 1,
};
const formData = reactive(formInitialData);
const rules = {
  amount: { required },
  startDate: { required },
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
  <v-card :title="version ? t('rates.update') : t('rates.create')">
    <v-card-item>
      <v-form @keyup.enter="submit">
        <v-text-field
          v-model.number="formData.amount"
          type="number"
          :label="t('rates.fields.amount')"
          :error-messages="$v.amount.$errors.map(e => e.$message as string)"
          @blur="$v.amount.$touch" />
        <v-row>
          <v-col>
            <v-text-field
              v-model="formData.startDate"
              type="date"
              :label="t('rates.fields.startDate')"
              :error-messages="$v.startDate.$errors.map(e => e.$message as string)"
              @blur="$v.startDate.$touch" />
          </v-col>
          <v-col>
            <v-text-field
              v-model="formData.endDate"
              type="date"
              :label="t('rates.fields.endDate')" />
          </v-col>
        </v-row>
        <v-text-field
          v-if="ratePlan.type === RateType.RECURRING"
          v-model.number="formData.recurringCount"
          type="number"
          :label="t('rates.fields.recurringCount')"
          min-value="1" />
        <v-text-field
          v-if="ratePlan.type !== RateType.HOURLY"
          v-model.number="formData.includedHours"
          type="number"
          :label="t('rates.fields.includedHours')" />
        <v-text-field
          v-if="ratePlan.type !== RateType.HOURLY"
          v-model.number="formData.overageHourly"
          type="number"
          :label="t('rates.fields.overageHourly')" />
      </v-form>
    </v-card-item>
    <v-card-actions class="px-6 pb-6">
      <v-spacer />
      <v-btn @click="cancel">{{ t('btn.cancel') }}</v-btn>
      <v-btn color="primary" variant="flat" @click="submit">{{ t('btn.submit') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>