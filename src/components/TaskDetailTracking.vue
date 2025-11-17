<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { type PropType, computed, ref } from 'vue';
import { format } from 'date-fns';
import { type Tracking } from '@/models/tracking.model';
import { RateType, RateVersion } from '@/models/rates.model';
import TrackingSummary from '@/components/TrackingSummary.vue';
const { t, n, d } = useI18n();
const props = defineProps({
  tracking: {
    type: Array as PropType<Tracking[]>,
    default: () => [],
  },
});
interface TrackingDay {
  date: string;
  amount: number;
  rate: RateVersion;
  subtotal: number;
  subtotalFormatted: string;
}
const trackingByDay = computed(() => {
  const trackingMap = props.tracking.reduce((acc, item) => {
    const date = format(new Date(item.date), 'yyyy-MM-dd');
    const isHourlyRate = item.rateVersion && item.rateVersion.ratePlan.type === RateType.HOURLY;
    if (!(date in acc)) {
      acc[date] = {
        date,
        rate: item.rateVersion,
        amount: 0,
        subtotal: 0,
        subtotalFormatted: isHourlyRate ? '' : '-',
      };
    }
    acc[date].amount += item.amount;
    if (item.rateVersion && isHourlyRate) {
      acc[date].subtotal += item.amount * item.rateVersion.amount;
      acc[date].subtotalFormatted = n(acc[date].subtotal, getCurrencyOptions(item.rateVersion));
    }
    return acc;
  }, {} as { [key: string]: TrackingDay });
  return Object.values(trackingMap);
});
interface TrackingMonth {
  date: Date;
  amount: number;
  subtotal: number;
  subtotalFormatted: string;
  tracking: typeof trackingByDay.value,
}
const tableData = computed(() => {
  const trackingMap = trackingByDay.value.reduce((acc, day) => {
    const date = new Date(day.date);
    date.setDate(1);
    const key = format(date, 'yyyy-MM');
    const isHourlyRate = day.rate && day.rate.ratePlan.type === RateType.HOURLY;
    if (!(key in acc)) {
      acc[key] = {
        date,
        amount: 0,
        subtotal: 0,
        subtotalFormatted: isHourlyRate ? '' : '-',
        tracking: []
      };
    }
    acc[key].amount += day.amount;
    acc[key].tracking.push(day);
    if (day.rate && isHourlyRate) {
      acc[key].subtotal += day.amount * day.rate.amount;
      acc[key].subtotalFormatted = n(acc[key].subtotal, getCurrencyOptions(day.rate));
    }
    return acc;
  }, {} as { [key: string]: TrackingMonth});
  return Object.values(trackingMap);
});
const summary = computed(() => {
  return tableData.value.reduce((acc, item) => {
    acc.amount += item.amount;
    item.tracking.forEach(tracking => {
      if (!(tracking.rate.ratePlan.currency.id in acc.money)) {
        acc.money[tracking.rate.ratePlan.currency.id] = 0;
      }
      acc.money[tracking.rate.ratePlan.currency.id] += tracking.subtotal;
    })
    return acc;
  }, { amount: 0, money: {} as { [key: string]: number } });
})
const expanded = ref([]);
const itemsPerPage = ref(6);
const page = ref(1);
const pagesCount = computed(() => Math.ceil(tableData.value.length / itemsPerPage.value));
const tableHeaders = [
  {
    key: 'date',
    title: t('date.title'),
    width: '150',
  },
  {
    key: 'amount',
    title: t('tracking.fields.hoursShort'),
  },
  {
    key: 'total',
    title: t('summary.subtotal'),
  },
]
function getCurrencyOptions(rate: RateVersion | null) {
  return {
    key: 'currency',
    ...(rate && { currency: rate.ratePlan.currency.id }),
  };
}
function firstUpper(str: string) {
  return str.at(0)?.toUpperCase() + str.substring(1);
}
</script>

<template>
  <div class="task-detail-tracking">
    <h5 class="d-flex justify-space-between align-center text-h5 mb-4">
      {{ t('tracking.title') }}
      <tracking-summary :amount="summary.amount" :money="summary.money" class="text-body-1" />
    </h5>
    <v-data-table
      v-model:expanded="expanded"
      v-model:items-per-page="itemsPerPage"
      :headers="tableHeaders"
      :items="tableData"
      item-value="date"
      fixed-header
      show-expand
      hide-default-footer
      class="tracking-table">
      <template #item="{ item, internalItem, isExpanded, toggleExpand }">
        <tr class="tracking-table__row" :class="{ expanded: isExpanded(internalItem) }">
            <td>
              {{ firstUpper(d(item.date, { month: 'long', year: 'numeric' })) }}
            </td>
            <td>{{ item.amount }}</td>
            <td>{{ item.subtotalFormatted }}</td>
            <td>
              <v-btn
                variant="flat"
                :icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                @click="toggleExpand(internalItem)" />
            </td>
          </tr>
      </template>
      <template #expanded-row="{ item }">
        <tr v-for="tracking in item.tracking" :key="tracking.date" class="tracking-table__row internal">
          <td class="pl-8">{{ d(tracking.date) }}</td>
          <td>{{ tracking.amount }}</td>
          <td>{{ tracking.subtotalFormatted }}</td>
          <td></td>
        </tr>
      </template>
      <template #bottom>
        <div v-if="pagesCount > 1" class="text-center pt-2">
          <v-pagination
            v-model="page"
            :length="pagesCount" />
        </div>
      </template>
      <template #no-data>
        <p class="text-body-1 text-medium-emphasis mt-5">
          {{ t('tracking.empty') }}
        </p>
      </template>
    </v-data-table>
  </div>
</template>

<style lang="scss" scoped>
.tracking-table {
  &__row {
    &.internal {
      background: rgba(var(--v-theme-surface-bright), var(--v-hover-opacity));
    }
    &.expanded {
      font-weight: bold;
    }
  }
}
</style>