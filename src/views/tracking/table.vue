<script setup lang="ts">
import { UiAlert, UiTableHeaderCell } from '@/models/ui.model';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import TrackingCreateForm from '@/components/tracking/TrackingCreateMultiple.vue';
import TrackingSummary from '@/components/tracking/TrackingSummary.vue';
import { useTrackingStore } from '@/store/tracking';
import { Tracking, TrackingCreate, TrackingFilter } from '@/models/tracking.model';
import { format } from 'date-fns';
import { RateType, RateVersion } from '@/models/rates.model';
import { Task } from '@/models/tasks.model';
import { useProjectsStore } from '@/store/projects';
import { useClientsStore } from '@/store/clients';

const FORMAT = 'yyyy-MM-dd';
const { t, d, n } = useI18n();
const trackingStore = useTrackingStore();
const list = computed(() => trackingStore.list);
const isLoading = computed(() => trackingStore.isLoading);
const loadingError = ref<UiAlert | null>(null);

// projects
const projectsStore = useProjectsStore();
const projects = computed(() => projectsStore.list);

// clients
const clientsStore = useClientsStore();
const clients = computed(() => clientsStore.list);

// filter
const filter = computed(() => {
  return {
    dateFrom: format(trackingStore.filter.dateFrom, FORMAT),
    dateTo: format(trackingStore.filter.dateTo, FORMAT),
    client: trackingStore.filter.client,
    project: trackingStore.filter.project,
  }
});
const showExtraFilter = ref(false);
const hasExtraFilter = computed(() => filter.value.client || filter.value.project?.length);

const setFilter = (param: Partial<TrackingFilter>) => {
  trackingStore.setFilter(param);
  trackingStore.fetchList();
}

const fetchList = async () => {
  trackingStore.fetchList()
    .catch(e => loadingError.value = getErrorOrDefault(e));
}
if (!list.value.length && !isLoading.value) fetchList();

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
interface TableSortItem {
  key: keyof Tracking;
  order: boolean | 'asc' | 'desc';
}
const tableSort = ref<TableSortItem[]>([{ key: 'date', order: 'desc' }]);
const tableData = computed(() => {
  return list.value.map(tracking => {
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
interface GrouppedTableRow {
  task: Task,
  rate: RateVersion,
  key: string;
  rateFormatted: string;
  amount: number;
  subtotal: number;
  subtotalFormatted: string;
  tracking: typeof tableData.value;
}
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
    const current = acc.get(key) as GrouppedTableRow;
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
  }, new Map<string, GrouppedTableRow>());
});
const expanded = ref([]);
const showGroupped = ref(true);

// creation
const isSending = ref(false);
const sendingError = ref<UiAlert | null>(null);
const creationIsOpen = ref(false);
const create = (formData: TrackingCreate | TrackingCreate[]) => {
  isSending.value = true;
  trackingStore.create(formData)
    .catch(e => sendingError.value = getErrorOrDefault(e))
    .finally(() => {
      creationIsOpen.value = false;
      isSending.value = false;
    });
}
const cancel = () => {
  creationIsOpen.value = false;
}
const getErrorOrDefault = (e: any) => {
  return {
    title: e?.title ?? t('error.unknown.title'),
    message: e?.message || e?.errorMessage || t('error.unknown.message'),
  };
}
</script>

<template>
  <div class="page w-100 align-center justify-center pb-16">
    <div class="filter pb-8">
      <v-row>
        <v-col cols="auto" align-self="end">
          <v-btn-group size="small">
            <v-btn
              icon="mdi-filter-variant"
              variant="plain"
              slim
              @click="showExtraFilter = !showExtraFilter">
              <v-badge v-if="hasExtraFilter" dot color="error">
                <v-icon>mdi-filter-variant</v-icon>
              </v-badge>
              <v-icon v-else>mdi-filter-variant</v-icon>
            </v-btn>
          </v-btn-group>
        </v-col>
        <v-col cols="2">
          <v-text-field
            type="date"
            hide-details
            :model-value="filter.dateFrom"
            :prefix="t('form.dateFrom.prefix')"
            variant="underlined"
            @update:model-value="value => setFilter({ dateFrom: new Date(value) })" />
        </v-col>
        <v-col cols="2">
          <v-text-field
            type="date"
            hide-details
            :model-value="filter.dateTo"
            :prefix="t('form.dateTo.prefix')"
            variant="underlined"
            @update:model-value="value => setFilter({ dateTo: new Date(value) })" />
        </v-col>
        <v-col cols="auto">
          <v-checkbox
            v-model="showGroupped"
            hide-details
            :label="t('groupBy.task')" />
        </v-col>
        <v-spacer />
        <v-col cols="auto" align-self="center">
          <tracking-summary
            :amount="tableSummary.amount"
            :money="tableSummary.money"
            class="text-h5"/>
        </v-col>
      </v-row>
      <v-expand-transition>
        <v-row v-show="showExtraFilter">
          <v-col>
            <v-select
              :model-value="filter.client"
              :label="t('clients.item')"
              :items="clients"
              item-title="name"
              item-value="id"
              hide-details
              clearable
              variant="underlined"
              @update:model-value="value => setFilter({ client: value })" />
          </v-col>
          <v-col>
            <v-select
              :model-value="filter.project"
              :label="t('projects.items')"
              :items="projects"
              hide-details
              item-title="title"
              item-value="id"
              multiple
              clearable
              variant="underlined"
              @update:model-value="value => setFilter({ project: value })" />
          </v-col>
        </v-row>
      </v-expand-transition>
    </div>
    <v-card v-if="!isLoading && list.length">
      <v-data-table
        v-if="showGroupped"
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
      <v-btn icon="mdi-plus" size="x-large" color="primary" class="add-btn" @click="creationIsOpen = true" />
    </v-card>
    <v-layout v-else full-height class="align-center justify-center">
      <v-progress-circular v-if="isLoading" indeterminate />
      <v-alert v-else-if="loadingError" :title="loadingError?.title" :text="loadingError.message" type="error" max-width="640" />
      <v-empty-state v-else :title="t('tracking.empty')" max-width="640">
        <v-btn color="primary" size="large" class="mt-4" @click="creationIsOpen = true">
          {{ t('tracking.add') }}
        </v-btn>
      </v-empty-state>
    </v-layout>
    <v-dialog v-model="creationIsOpen" width="960">
      <template v-if="!sendingError">
        <tracking-create-form @cancel="cancel" @submit="create" />
        <v-overlay v-model="isSending" contained class="align-center justify-center">
          <v-progress-circular indeterminate />
        </v-overlay>
      </template>
      <v-alert v-else :title="sendingError?.title" :text="sendingError?.message" type="error" />
    </v-dialog>
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