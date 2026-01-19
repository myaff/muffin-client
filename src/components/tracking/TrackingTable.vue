<script setup lang="ts">
import { GrouppedTableRow, TableSortItem, UiTableHeaderCell } from '@/models/ui.model';
import { ref, computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { Tracking } from '@/models/tracking.model';
import { RateType, RateVersion } from '@/models/rates.model';
import { Task } from '@/models/tasks.model';

const props = defineProps({
  list: {
    type: Array as PropType<Tracking[]>,
    default: () => [],
  },
  groupped: {
    type: Boolean,
    default: true,
  },
})
const { t, d, n } = useI18n();

// table data
const tableHeaders: UiTableHeaderCell[] = [
  {
    key: 'task',
    title: t('tracking.fields.task'),
  },
  {
    key: 'date',
    title: t('tracking.fields.date'),
    width: '170',
  },
  {
    key: 'amount',
    title: t('tracking.fields.hoursShort'),
    width: '100',
  },
  {
    key: 'rate',
    title: t('tracking.fields.rate'),
    width: '130',
    sortable: false,
  },
  {
    key: 'subtotal',
    title: t('tracking.fields.subtotal'),
    width: '130',
    sortable: false,
  },
  {
    key: 'note',
    title: t('tracking.fields.note'),
    sortable: false,
  },
];
const tableSort = ref<TableSortItem<Tracking>[]>([{ key: 'date', order: 'desc' }]);
const tableData = computed(() => {
  return props.list.map(tracking => {
    const rate = tracking.rateVersion;
    const isHourlyRate = rate && rate.ratePlan.type === RateType.HOURLY;
    const subtotal = isHourlyRate ? rate.amount * tracking.amount : 0;
    const currencyOptions = {
      key: 'currency',
      ...(!!rate && {currency: rate.ratePlan.currency.id}),
    };
    return {
      id: tracking.id,
      task: tracking.task,
      rate,
      isHourlyRate,
      rateFormatted: isHourlyRate
        ? n(rate.amount, currencyOptions)
        : '-',
      date: d(tracking.date),
      amount: tracking.amount,
      subtotal,
      subtotalFormatted: isHourlyRate
        ? n(rate.amount * tracking.amount, currencyOptions)
        : '-',
      note: tracking.note ?? '',
    }
  });
});
const tableSummary = computed(() => {
  return tableData.value.reduce((acc, item) => {
    acc.amount += item.amount;
    if (item.rate && item.subtotal) {
      if (!(item.rate.ratePlan.currency.id in acc.money)) {
        acc.money[item.rate.ratePlan.currency.id] = 0;
      }
      acc.money[item.rate.ratePlan.currency.id] += item.subtotal;
    }
    return acc;
  }, { amount: 0, money: {} as { [key: string]: number }});
});
const grouppedTableHeaders: UiTableHeaderCell[] = [
  {
    key: 'task',
    title: t('tracking.fields.task'),
  },
  {
    key: 'amount',
    title: t('tracking.fields.hoursShort'),
    width: '100',
  },
  {
    key: 'rate',
    title: t('tracking.fields.rate'),
    width: '130',
    sortable: false,
  },
  {
    key: 'subtotal',
    title: t('tracking.fields.subtotal'),
    width: '130',
    sortable: false,
  },
  {
    key: 'note',
    title: t('tracking.fields.note'),
    sortable: false,
  },
  {
    key: 'data-table-expand',
    title: '',
  },
];
type GrouppedTableRowInternal = GrouppedTableRow<Task, RateVersion, typeof tableData.value>;
const grouppedTableData = computed(() => {
  return tableData.value.reduce((acc, item) => {
    const key = `${item.task.id}-${item.rate.id}`;
    if (!acc.has(key)) {
      acc.set(key, {
        task: item.task,
        key,
        rate: item.rate,
        rateFormatted: item.rateFormatted,
        amount: 0,
        subtotal: 0,
        subtotalFormatted: item.isHourlyRate ? '' : '-',
        tracking: [],
      });
    }
    const current = acc.get(key) as GrouppedTableRowInternal;
    current.tracking.push(item);
    current.amount += item.amount;
    if (item.rate && item.isHourlyRate) {
      const currencyOptions = {
        key: 'currency',
        ...(item.rate && { currency: item.rate.ratePlan.currency.id }),
      };
      current.subtotal += item.subtotal;
      current.subtotalFormatted = n(current.subtotal, currencyOptions);
    }
    return acc;
  }, new Map<string, GrouppedTableRowInternal>());
});
const expanded = ref([]);
defineExpose({ summary: tableSummary.value });
</script>

<template>
  <div class="tracking-table">
    <v-data-table
      v-if="groupped"
      v-model:expanded="expanded"
      :headers="grouppedTableHeaders"
      :items="Array.from(grouppedTableData.values())"
      item-value="key"
      fixed-header
      show-expand
      class="tracking-table__table">
      <template #item="{ item, internalItem, isExpanded, toggleExpand }">
        <tr class="tracking-table__row" :class="{ expanded: isExpanded(internalItem) }">
          <td>{{ item.task.code + ' ' + item.task.title }}</td>
          <td>{{ item.amount }}</td>
          <td>{{ item.rateFormatted }}</td>
          <td>{{ item.subtotalFormatted }}</td>
          <td></td>
          <td>
            <v-btn variant="flat"
              :icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              @click="toggleExpand(internalItem)" />
          </td>
        </tr>
      </template>
      <template v-slot:expanded-row="{ item }">
        <tr v-for="tracking in item.tracking" :key="tracking.id" class="tracking-table__row internal">
          <td class="pl-8">{{ tracking.date }}</td>
          <td>{{ tracking.amount }}</td>
          <td>{{ tracking.rateFormatted }}</td>
          <td>{{ tracking.subtotalFormatted }}</td>
          <td colspan="2">{{ tracking.note }}</td>
        </tr>
      </template>
    </v-data-table>
    <v-data-table
      v-else
      v-model:sort-by="tableSort"
      :headers="tableHeaders"
      :items="tableData"
      fixed-header>
      <template #item="{ item }">
        <tr>
          <td>{{ item.task.title }}</td>
          <td>{{ item.date }}</td>
          <td>{{ item.amount }}</td>
          <td>{{ item.rateFormatted }}</td>
          <td>{{ item.subtotalFormatted }}</td>
          <td>{{ item.note }}</td>
        </tr>
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