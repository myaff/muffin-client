<script setup lang="ts">
import { RateType, RateVersion } from '@/models/rates.model';
import { Tracking, TrackingCreate, TrackingUpdate } from '@/models/tracking.model';
import { UiAlert, UiTableHeaderCell } from '@/models/ui.model';
import { PropType, computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTasksStore } from '@/store/tasks';
import { Task } from '@/models/tasks.model';
import { endOfDay, endOfMonth, formatISO, startOfDay, startOfMonth } from 'date-fns';
import { useTrackingStore } from '@/store/tracking';
import useError from '@/composables/useError';
import TrackingSummary from '@/components/tracking/TrackingSummary.vue';
import { getRateVersionByDate } from '@/helpers/rate.helper';

const { t, d, n } = useI18n();
const props = defineProps({
  date: {
    type: Date,
    required: true,
  },
  tracking: {
    type: Array as PropType<Tracking[]>,
    default: () => [] as Tracking[],
  },
  total: {
    type: Number,
    default: 0,
  },
});
const emits = defineEmits(['save', 'cancel']);
const tasksStore = useTasksStore();
const trackingStore = useTrackingStore();
const tasks = computed(() => tasksStore.list);
const tasksMap = computed(() => {
  return tasks.value.reduce((acc, task) => {
    acc.set(task.id, task);
    return acc;
  }, new Map<number, Task>());
})
const filter = computed(() => ({
  dateFrom: startOfDay(startOfMonth(props.date)),
  dateTo: endOfDay(endOfMonth(props.date)),
}));
interface Updatable {
  editing: boolean,
  edited: boolean;
  amount: number;
  note: string;
}
interface Creatable extends Updatable {
  task: number | null;
  rateVersion: RateVersion | null;
}
type TrackingUpdatable = Tracking & { model: Updatable };
type TrackingCreatable = Omit<TrackingCreate, 'date'> & { task: Task | null; model: Creatable };
const createInitialData = computed<Creatable>(() => ({
  task: null,
  note: '',
  amount: 0,
  editing: true,
  edited: false,
  rateVersion: null as RateVersion | null,
}));
const updatableFormData = ref<TrackingUpdatable[]>(props.tracking.map(item => createUpdatable(item)));
watch(() => props.tracking, value => {
  updatableFormData.value = value.map(item => createUpdatable(item));
});
const createdFormData = ref([] as TrackingCreatable[]);
const tableHeaders: UiTableHeaderCell[] = [
  {
    key: 'task',
    title: t('tracking.fields.task'),
    sortable: false,
    width: '250',
  },
  {
    key: 'amount',
    title: t('tracking.fields.hoursShort'),
    width: '100',
    sortable: false,
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
    key: 'actions',
    sortable: false,
    width: '128',
    align: 'end',
  },
];
const tableData = computed(() => {
  return [
    ...updatableFormData.value.map((tracking, index) => getTableRow(tracking, index)),
    ...createdFormData.value.map((tracking, index) => getTableRow(tracking, index, true)),
  ];
});
const tableTotal = computed(() => {
  return tableData.value.reduce((acc, row) => {
    acc.amount += row.data.model.amount;
    if (row.rate?.ratePlan.type === RateType.HOURLY) {
      if (!(acc.money[row.rate.ratePlan.currency.id])) acc.money[row.rate.ratePlan.currency.id] = 0;
      acc.money[row.rate.ratePlan.currency.id] += row.data.model.amount * row.rate.amount;
    }
    return acc;
  }, { amount: 0, money: {} as { [key: string]: number } });
})
function createUpdatable(tracking: Tracking): TrackingUpdatable {
  return {
    ...tracking,
    model: {
      editing: false,
      edited: false,
      amount: tracking.amount,
      note: tracking.note || '',
    },
  };
}
interface TableRow {
  isNew: boolean;
  rate: RateVersion | null;
  rateFormatted: string;
  subtotal: string;
  index: number;
  data: TrackingCreatable | TrackingUpdatable;
}
function getTableRow(tracking: TrackingCreatable | TrackingUpdatable, index: number, isNew = false): TableRow {
  const task = isNew
    ? tasksMap.value.get((tracking.model as Creatable).task as number) || null
    : (tracking as TrackingUpdatable).task as Task;
  let rate: RateVersion | null = null;
  if (isNew && task) {
    // rate = getRateByDate(task.project.rates ?? [], props.date)
    const version = getRateVersionByDate(task.ratePlan, props.date);
    if (version) {
      rate = {
        ...version,
        ratePlan: { ...task.ratePlan },
      };
    }
  } else if (!isNew) rate = (tracking as Tracking).rateVersion;
  const isHourlyRate = !!rate && rate.ratePlan.type === RateType.HOURLY;
  const currencyOptions = {
    key: 'currency',
    ...(!!rate && {currency: rate.ratePlan.currency.id}),
  };
  let rateFormatted = '-';
  if (rate) {
    rateFormatted = isHourlyRate
      ? n(rate.amount, currencyOptions) + ' ' + t(`rates.types.${rate.ratePlan.type}.per`)
      : t(`rates.types.${rate.ratePlan.type}.title`);
  }
  return {
    isNew,
    index,
    rate: rate || null,
    rateFormatted,
    subtotal: isHourlyRate
      ? n(rate!.amount * tracking.model.amount, currencyOptions)
      : '-',
    data: isNew
      ? createdFormData.value[index]
      : updatableFormData.value[index],
  };
}
function addRecord() {
  createdFormData.value.push({
    task: null as unknown as Task,
    amount: createInitialData.value.amount,
    note: createInitialData.value.note,
    model: { ...createInitialData.value },
    mood: null,
    rateVersion: null as unknown as RateVersion,
  });
}
function commitChanges(item: TableRow) {
  console.log(item);
  if (item.isNew) {
    const itemData = item.data as TrackingCreatable;
    itemData.amount = itemData.model.amount;
    itemData.note = itemData.model.note;
    if (itemData.model.task && tasksMap.value.has(itemData.model.task)) {
      itemData.task = tasksMap.value.get(itemData.model.task) as Task;
      if (item.rate) itemData.rateVersion = item.rate;
      itemData.model.rateVersion = item.rate;
    }
  }
  item.data.model.edited = true;
  item.data.model.editing = false;
}
function cancelChanges(item: TableRow) {
  if (item.isNew && !item.data.amount && !item.data.task) {
    remove(item);
  } else {
    item.data.model.amount = item.data.amount;
    item.data.model.note = item.data.note || '';
    item.data.model.editing = false;
    item.data.model.edited = false;
  }
}
function remove(item: TableRow) {
  createdFormData.value.splice(item.index, 1);
}

const isSaving = ref(false);
const savingError = ref<UiAlert | null>(null);
const showError = ref(false);
function save() {
  const edited: TrackingUpdate[] = updatableFormData.value
    .filter(item => item.model.edited)
    .map(item => ({
      id: item.id,
      amount: item.model.amount,
      note: item.model.note,
    }));
  const created: TrackingCreate[] = createdFormData.value.map(item => ({
    task: item.task,
    date: formatISO(props.date),
    amount: item.model.amount,
    note: item.model.note,
    mood: item.mood,
    rateVersion: item.rateVersion,
  }));
  const reqs = [];
  if (edited.length) reqs.push(trackingStore.update(edited, false));
  if (created.length) reqs.push(trackingStore.create(created, false));
  if (reqs.length) {
    isSaving.value = true;
    Promise.allSettled(reqs)
      .then(res => {
        createdFormData.value = [];
        if (res.filter(item => item.status === 'rejected').length) {
          throw { message: t('tracking.saveManyError') };
        }
      })
      .catch(e => {
        savingError.value = useError(e, t);
        showError.value = true;
      })
      .finally(() => {
        trackingStore.fetchList(filter.value);
        isSaving.value = false;
        emits('save');
      });
  } else emits('cancel');
}
</script>

<template>
  <v-card class="tracking-calendar-day">
    <v-card-title class="py-4 text-upper-first">
      {{ d(date, 'medium') }}
    </v-card-title>
    <v-data-table
      :headers="tableHeaders"
      :items="tableData"
      fixed-header>
      <template #item="{ item }">
        <tr class="tracking-calendar-day__row" :class="{ edited: item.data.model.edited, added: item.isNew }">
          <td>
            <v-autocomplete
              v-if="item.isNew && item.data.model.editing"
              :items="tasks"
              v-model="(item.data.model as Creatable).task"
              :item-title="item => `${item.code} ${item.title}`"
              item-value="id"
              density="compact"
              hide-details
              @update:model-value="item.data.model.amount = 1" />
            <span v-else>
              {{ item.data.task.code + ' ' + item.data.task.title }}
            </span>
          </td>
          <td>
            <v-text-field
              v-if="item.data.model.editing"
              type="number"
              v-model.number="item.data.model.amount"
              min="0"
              :hide-details="true" density="compact" />
            <div v-else class="px-4 py-2">
              {{ item.data.model.amount }}
            </div>
          </td>
          <td>{{ item.rateFormatted }}</td>
          <td>{{ item.subtotal }}</td>
          <td>
            <v-text-field v-if="item.data.model.editing" v-model="item.data.model.note" :hide-details="true" density="compact" />
            <div v-else class="px-4 py-2">
              {{ item.data.model.note }}
            </div>
          </td>
          <td>
            <v-btn-group variant="plain">
              <template v-if="item.data.model.editing">
                <v-btn
                  color="success"
                  icon="mdi-check"
                  @click="commitChanges(item)" />
                <v-btn
                  color="error"
                  icon="mdi-close"
                  @click="cancelChanges(item)" />
              </template>
              <template v-else>
                <v-btn
                  icon="mdi-pencil"
                  @click="item.data.model.editing = true" />
                <v-btn
                  v-if="item.isNew"
                  color="error"
                  icon="mdi-delete"
                  @click="remove(item)" />
              </template>
            </v-btn-group>
          </td>
        </tr>
      </template>
      <template #bottom>
        <v-btn prepend-icon="mdi-plus" elevation="0" class="my-4" @click="addRecord()">
          {{ t('tracking.add') }}
        </v-btn>
      </template>
    </v-data-table>
    <v-alert
      v-if="savingError"
      v-model:model-value="showError"
      :title="savingError?.title"
      :text="savingError?.message"
      type="error"
      closable
      class="mx-4" />
    <v-card-actions class="pa-4">
      <tracking-summary
        class="text-h6" :amount="tableTotal.amount"
        :money="tableTotal.money" />
      <v-spacer />
      <v-btn size="large" variant="text" @click="emits('cancel')">
        {{ t('btn.cancel') }}
      </v-btn>
      <v-btn size="large" color="primary" variant="flat" :loading="isSaving" @click="save">
        {{ t('btn.save') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style lang="scss" scoped>
.tracking-calendar-day {
  &__row {
    &.edited {
      background: rgba(var(--v-theme-surface-bright), var(--v-hover-opacity));
    }
    &.added {
      background: rgba(var(--v-theme-warning), var(--v-hover-opacity));
    }
  }
}
</style>