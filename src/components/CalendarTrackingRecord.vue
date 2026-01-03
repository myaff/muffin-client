<script setup lang="ts">
import { RateType } from '@/models/rates.model';
import { TrackingDay } from '@/models/tracking.model';
import { PropType, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { n } = useI18n();
const props = defineProps({
  record: {
    type: Object as PropType<TrackingDay>,
    required: true,
  },
  min: {
    type: Number,
    default: 6,
  },
  max: {
    type: Number,
    default: 8,
  },
  isHoliday: {
    type: Boolean,
    default: false,
  },
})
enum DayStatus {
  UNDERWORK = 'UNDERWORK',
  OVERWORK = 'OVERWORK',
  NORMAL = 'NORMAL',
}
const dayStatus = computed(() => {
  if (props.record.total < props.min && !props.isHoliday) return DayStatus.UNDERWORK;
  if (props.record.total > props.max || props.isHoliday) return DayStatus.OVERWORK;
  return DayStatus.NORMAL;
})
const classes = computed(() => ({
  'text-error': dayStatus.value !== DayStatus.NORMAL,
  'text-medium-emphasis': dayStatus.value === DayStatus.NORMAL,
}))
const money = computed(() => {
  return props.record.tracking
    .filter(item => item.rateVersion && item.rateVersion.ratePlan.type === RateType.HOURLY)
    .reduce((acc, item) => {
      const currency = item.rateVersion.ratePlan.currency.id;
      if (!(currency in acc)) acc[currency] = { amount: 0, currency };
      acc[currency].amount += item.amount * item.rateVersion.amount;
      return acc;
    }, {} as { [key: string]: { amount: number, currency: string } })
})
</script>

<template>
  <div class="calendar-tracking-record text-right">
    <v-tooltip location="left">
      <template #activator="{ props }">
        <span v-bind="props" :class="classes" class="calendar-tracking-record__hours">
          {{ record.total }}
        </span>
      </template>
      <div class="calendar-tracking-record__money text-right">
        <div v-for="(item, key) in money"
          :key="key"
          class="calendar-tracking-record__money-item">
          {{ n(item.amount, { key: 'currency', currency: item.currency }) }}
        </div>
      </div>
    </v-tooltip>
  </div>
</template>