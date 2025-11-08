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
    .filter(item => item.rate && item.rate.type === RateType.HOURLY)
    .reduce((acc, item) => {
      const currency = item.rate.currency.id;
      if (!(currency in acc)) acc[currency] = { value: 0, currency };
      acc[currency].value += item.hours * item.rate.value;
      return acc;
    }, {} as { [key: string]: { value: number, currency: string } })
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
          {{ n(item.value, { key: 'currency', currency: item.currency }) }}
        </div>
      </div>
    </v-tooltip>
  </div>
</template>

<style lang="scss" scoped>
.calendar-tracking-record {
  &__hours {
  }
}
</style>