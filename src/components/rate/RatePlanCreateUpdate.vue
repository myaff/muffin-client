<script setup lang="ts">
import { Client } from '@/models/clients.model';
import { Project } from '@/models/projects.model';
import { RatePlanFull, RateRecurringUnit, RateScope, RateType } from '@/models/rates.model';
import { useAppStore } from '@/store/app';
import useVuelidate from '@vuelidate/core';
import { required, requiredIf } from '@vuelidate/validators';
import { format } from 'date-fns';
import { computed, PropType, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  item: {
    type: Object as PropType<RatePlanFull>,
    default: null,
  },
  scope: {
    type: String as PropType<RateScope>,
    default: RateScope.USER,
  },
  client: {
    type: Object as PropType<Client | null>,
    default: null,
  },
  project: {
    type: Object as PropType<Project | null>,
    default: null,
  },
});
const { t } = useI18n();
const rateTypesByScope = {
  [RateScope.USER]: [RateType.HOURLY],
  [RateScope.CLIENT]: [RateType.HOURLY, RateType.RECURRING],
  [RateScope.PROJECT]: [RateType.HOURLY, RateType.RECURRING, RateType.FIXED],
};
const rateScope = computed(() => props.item?.scope ?? props.scope);
const rateTypes = computed(() => {
  const available = rateTypesByScope[rateScope.value] ?? [];
  return available.map(key => ({
    value: key,
    title: t(`rates.types.${key}.title`),
  }));
});

const DATE_FORMAT = 'yyyy-MM-dd';
const initFormData = {
  name: props.item?.name ?? '',
  client: props.item?.client?.id ?? props.client?.id ?? null,
  project: props.item?.project?.id ?? props.project?.id ?? null,
  type: rateTypes.value.at(0)?.value ?? null,
  currency: props.item?.currency.id
    ?? props.project?.client?.country?.currency?.id
    ?? props.client?.country?.currency?.id
    ?? null,
  recurringUnit: props.item?.recurringUnit ?? null,
  active: props.item?.active ?? true,
};
const initVersionData = {
  amount: null as number | null,
  startDate: format(new Date(), DATE_FORMAT),
  endDate: null,
  includedHours: 0,
  overageHourly: 0,
  recurringCount: 1,
};
const formData = ref({...initFormData});
const formVersionData = ref({ ...initVersionData });
const rules = computed(() =>({
  name: { required },
  currency: { required },
  amount: { required: requiredIf(!props.item) },
  startDate: { required: requiredIf(!props.item) },
}));
const $v = useVuelidate(rules, {...formData.value, ...formVersionData.value});
const recurringUnits = computed(() => {
  return Object.values(RateRecurringUnit).map(key => ({
    value: key,
    title: t(`rates.recurringUnit.${key}.title`),
  }));
});
const appStore = useAppStore();
const currencies = computed(() => appStore.currencies);
watchEffect(() => {
  if (formData.value.type === RateType.RECURRING) {
    formData.value.recurringUnit = recurringUnits.value.at(0)?.value ?? null;
  } else formData.value.recurringUnit = null;
});
const emits = defineEmits(['submit', 'cancel']);
const submit = async () => {
  const isValid = await $v.value.$validate();
  if (isValid) {
    const payload = {
      ...formData.value,
      ...(!props.item?.id && { version: { ...formVersionData.value } }),
    };
    emits('submit', payload);
  };
}
const cancel = () => {
  emits('cancel');
}
</script>

<template>
  <v-card :title="item ? t('rates.update') : t('rates.create')">
    <v-card-item>
      <v-form @submit="submit">
        <v-text-field
          v-model="formData.name"
          :label="t('rates.fields.name')"
          class="mb-4"
          hide-details
          :error-messages="$v.name.$errors.map(e => e.$message as string)"
          @blur="$v.name.$touch" />
        <v-radio-group
          v-if="rateTypes.length > 1"
          v-model="formData.type"
          :label="t('rates.fields.type')"
          inline>
          <v-radio
            v-for="item in rateTypes"
            :key="item.value"
            :value="item.value"
            :label="item.title" />
        </v-radio-group>
        <v-radio-group
          v-if="formData.type === RateType.RECURRING"
          v-model="formData.recurringUnit"
          :label="t('rates.fields.recurringUnit')"
          inline>
          <v-radio v-for="item in recurringUnits" :key="item.value" :value="item.value" :label="item.title" />
        </v-radio-group>
        <v-text-field
          v-if="!item && formData.type === RateType.RECURRING"
          v-model.number="formVersionData.recurringCount"
          type="number"
          :label="t('rates.fields.recurringCount')"
          min-value="1" />
        <v-select
          v-if="client"
          v-model="formData.client"
          :items="[client]"
          :label="t('rates.fields.client')"
          item-title="name"
          item-value="id"
          disabled />
        <v-select
          v-if="project"
          v-model="formData.project"
          :items="[project]"
          :label="t('rates.fields.project')"
          item-title="title"
          item-value="id"
          disabled />
        <v-select
          v-model="formData.currency"
          :items="currencies"
          :label="t('rates.fields.currency')"
          :item-props="item => ({ title: `${item.symbol} - ${item.name}` })"
          item-value="id"
          :disabled="!!item || !!formData.client || !!formData.project"
          :error-messages="$v.currency.$errors.map(e => e.$message as string)"
          @blur="$v.currency.$touch" />
        <v-switch
          v-model="formData.active"
          :label="formData.active ? t('rates.active') : t('rates.notActive')"
          :color="formData.active ? 'success' : 'default'" />
        <v-text-field
          v-if="!item"
          v-model.number="formVersionData.amount"
          type="number"
          :label="t('rates.fields.amount')"
          :error-messages="$v.amount.$errors.map(e => e.$message as string)"
          @blur="$v.amount.$touch" />
        <v-row v-if="!item">
          <v-col>
            <v-text-field
              v-model="formVersionData.startDate"
              type="date"
              :label="t('rates.fields.startDate')"
              :error-messages="$v.startDate.$errors.map(e => e.$message as string)"
              @blur="$v.startDate.$touch" />
          </v-col>
          <v-col>
            <v-text-field
              v-model="formVersionData.endDate"
              type="date"
              :label="t('rates.fields.endDate')" />
          </v-col>
        </v-row>
        <v-text-field
          v-if="!item && formData.type !== RateType.HOURLY"
          v-model.number="formVersionData.includedHours"
          type="number"
          :label="t('rates.fields.includedHours')" />
        <v-text-field
          v-if="!item && formData.type !== RateType.HOURLY"
          v-model.number="formVersionData.overageHourly"
          type="number"
          :label="t('rates.fields.overageHourly')" />
      </v-form>
    </v-card-item><v-card-actions class="px-6 pb-6">
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