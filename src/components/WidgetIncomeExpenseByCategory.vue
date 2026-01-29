<script setup lang="ts">
import useListStore from '@/composables/useListStore';
import { TransactionType } from '@/models/transaction.model';
import { useTransactionsStore } from '@/store/transactions';
import { addMonths, format } from 'date-fns';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  ChartOptions,
 } from 'chart.js'
import useFinanceHealthChart from '@/composables/useFinanceHealthChart';
import colors from 'vuetify/util/colors';
import { useTheme } from 'vuetify';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);
const TOP = 5;

const { t, d, n } = useI18n();
const FORMAT = 'yyyy-MM-dd';
const transactionsStore = useTransactionsStore();
const today = new Date();
const filterData = computed(() => {
  return {
    dateFrom: format(addMonths(today, -1), FORMAT),
    dateTo: format(today, FORMAT),
  };
})
const {
  list,
  isLoading,
  fetchList,
  paginationQuery,
} = useListStore(transactionsStore.service, { page: 1, pageSize: 500 });
const fetchParams = computed(() => ({
  ...filterData.value,
  ...paginationQuery.value,
}));
const uncategorized = {
  id: -1,
  name: t('transactionCategory.uncategorized'),
  income: true,
  expense: true,
  createdAt: today.toISOString(),
  updatedAt: today.toISOString(),
};
const listMapped = computed(() => {
  return list.value.map(item => {
    const isExpense = item.type === TransactionType.EXPENSE;
    return {
      ...item,
      categories: item.categories?.length
        ? item.categories
        : [uncategorized],
      shownAmount: isExpense ? item.amount * -1 : item.amount,
      color: isExpense ? 'error' : 'success',
    }
  });
});
const currencies = computed(() => {
  return Array.from(list.value.reduce((acc, item) => {
    acc.add(item.bankAccount.currency.id);
    return acc;
  }, new Set<string>()));
});
const currency = ref('RUB');
watch(currencies, value => {
  if (value?.length) currency.value = value.at(0) as string;
});
const built = computed(() => useFinanceHealthChart(listMapped.value, currency.value, TOP));
const totalValues = computed(() => {
  return [
    built.value.totals.totalIncome,
    built.value.totals.totalExpense,
    Math.abs(built.value.totals.net),
  ]
})
const theme = useTheme();
const ticksColor = computed(() => theme.name.value === 'dark'
  ? colors.shades.white
  : colors.grey.darken2);
const summaryData = computed(() => ({
  labels: [
    t('finance.income'),
    t('finance.outcome'),
    t('finance.net'),
  ],
  datasets: [
    {
      data: totalValues.value,
      backgroundColor: [
        colors.green.base,
        colors.red.base,
        built.value.totals.net >= 0
          ? colors.green.accent4
          : colors.red.accent4,
      ],
      borderWidth: 0,
      borderRadius: 6,
      barThickness: 30,
    },
  ],
}));
const categorizedData = computed(() => ({
  labels: built.value.labels,
  datasets: [
    {
      data: built.value.values,
      backgroundColor: [
        colors.red.darken4,
        colors.red.darken3,
        colors.red.darken2,
        colors.red.darken1,
        colors.red.lighten1,
        colors.red.lighten2,
      ],
      borderWidth: 0,
      borderRadius: 6,
      barThickness: 20,
    },
  ],
}));
function getChartOptions(labels: string[], values: number[], net = false): ChartOptions<'bar'> {
  return {
    responsive: true,
    indexAxis: 'y',
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        max: built.value.maxX,
        display: false,
        grid: { display: false },
        ticks: {
          color: ticksColor.value,
          font: { size: 16 },
        },
      },
      y: {
        display: true,
        grid: { display: false },
        ticks: {
          color: ticksColor.value,
          font: { size: 16 },
        },
      },
      yR: {
        position: 'right',
        grid: { display: false, drawOnChartArea: false },
        border: { display: false },
        type: 'category',
        labels: labels,
        ticks: {
          mirror: false,
          font: { size: 16, weight: 'bold' },
          color: ticksColor.value,
          callback: (_tickValue: any, index: number) => {
            const v = values.at(index) ?? 0;
            if (net && index === 2) {
              const res = built.value.totals.net < 0 ? v * -1 : v;
              return n(res, { key: 'currency', currency: currency.value });
            }
            return n(v, { key: 'currency', currency: currency.value });
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';

            if (label) {
              label += ': ';
            }
            if (context.parsed.x !== null) {
              label += n(context.parsed.x, { key: 'currency', currency: currency.value });
            }
            return label;
          },
        },
      },
    },
  } as const;
}
onMounted(async () => {
  await fetchList(fetchParams.value);
})
transactionsStore.$onAction(({ after }) => {
  after(() => fetchList(fetchParams.value));
})
</script>

<template>
  <v-card class="widget-income-expense-category h-100">
    <v-card-title>
      Доход vs Расход
    </v-card-title>
    <v-card-subtitle>
      {{ `${d(filterData.dateFrom, 'short')} - ${d(filterData.dateTo, 'short')}` }}
    </v-card-subtitle>
    <v-card-item>
      <Bar
        v-if="!isLoading"
        :data="summaryData"
        :options="getChartOptions(summaryData.labels, totalValues, true)" />
    </v-card-item>
    <v-card-title>
      Топ расходных категорий
    </v-card-title>
    <v-card-item>
      <Bar
        v-if="!isLoading"
        :data="categorizedData"
        :options="getChartOptions(categorizedData.labels, built.values)" />
    </v-card-item>
  </v-card>
</template>