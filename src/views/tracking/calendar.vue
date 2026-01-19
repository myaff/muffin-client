<script setup lang="ts">
import { UiAlert } from '@/models/ui.model';
import { ref, computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import TrackingCreateForm from '@/components/tracking/TrackingCreateMultiple.vue';
import CalendarMonth from '@/components/CalendarMonth.vue';
import CalendarTrackingRecord from '@/components/tracking/CalendarTrackingRecord.vue';
import TrackingCalendarDay from '@/components/tracking/TrackingCalendarDay.vue';
import TrackingSummary from '@/components/tracking/TrackingSummary.vue';
import { useTrackingStore } from '@/store/tracking';
import { TrackingCreate, TrackingDay, TrackingDayDto  } from '@/models/tracking.model';
import { endOfMonth, format, isValid, parseISO, startOfMonth } from 'date-fns';
import { useRoute, useRouter } from 'vue-router';
import useError from '@/composables/useError';
import { RateType } from '@/models/rates.model';
import { getQueryParamValue, getQueryParamBoolean } from '@/helpers/url.helper';
import { FetchListParams } from '@/models/common.model';

const DATE_FORMAT = 'yyyy-MM-dd';
const Q_OPENED = 'opened';
const Q_DATE = 'date';
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const trackingStore = useTrackingStore();
const loadingError = ref<UiAlert | null>(null);

// calendar
const dayIsOpen = ref(getQueryParamBoolean(route.query[Q_OPENED]));
const dateFromQuery = computed(() => {
  const dateStr = getQueryParamValue(route.query[Q_DATE]);
  if (!dateStr) return null;
  const parsed = parseISO(dateStr);
  return isValid(parsed) ? parsed : null;
});
const calendarValue = ref(dateFromQuery.value ?? new Date());
const calendarData = ref<Map<string, TrackingDayDto>>(new Map());
const openedDay = computed(() => {
  const date = dayIsOpen.value && calendarValue.value
    ? new Date(calendarValue.value)
    : new Date();
  const data = calendarData.value.get(format(date, DATE_FORMAT))
  return {
    date,
    tracking: data?.tracking ?? [],
    total: data?.total ?? 0,
  };
});
const calendarSummary = computed(() => {
  return Array.from(calendarData.value)
    .map(([_date, trackingDay]) => trackingDay)
    .reduce((acc, trackingDay) => {
      acc.amount += trackingDay.total;
      trackingDay.tracking.forEach(tracking => {
        const rate = tracking.rateVersion;
        if (!rate || rate.ratePlan.type !== RateType.HOURLY) return;
        if (!(rate.ratePlan.currency.id in acc.money)) {
          acc.money[rate.ratePlan.currency.id] = 0;
        }
        acc.money[rate.ratePlan.currency.id] += rate.amount * tracking.amount;
      });
      return acc;
    }, { amount: 0, money: {} as { [key: string]: 0 } });
});

const onDayClick = (date: Date) => {
  calendarValue.value = date;
  dayIsOpen.value = true;
  updateRoute();
}
// data fetching
const filter = reactive({
  dateFrom: format(startOfMonth(calendarValue.value), DATE_FORMAT),
  dateTo: format(endOfMonth(calendarValue.value), DATE_FORMAT),
});
function setFilter(date: Date) {
  filter.dateFrom = format(startOfMonth(date), DATE_FORMAT);
  filter.dateTo = format(endOfMonth(calendarValue.value), DATE_FORMAT);
}
watch(calendarValue, value => {
  updateRoute();
  setFilter(value);
  fetchCalendar(filter);
}, { flush: 'post' });
watch(dayIsOpen, value => {
  if (!value) updateRoute();
});
const fetchCalendar = (filter: FetchListParams) => {
  return trackingStore.fetchCalendar(filter)
    .then(data => {
      if (data) calendarData.value = new Map(Object.entries(data));
      else calendarData.value.clear();
    })
    .catch(e => loadingError.value = useError(e, t));
}
fetchCalendar(filter);
function updateRoute() {
  router.replace({
    ...route,
    query: {
      ...route.query,
      [Q_DATE]: format(calendarValue.value, DATE_FORMAT),
      [Q_OPENED]: dayIsOpen.value ? 'true' : undefined,
    },
  });
}

// creation
const isSending = ref(false);
const sendingError = ref<UiAlert | null>(null);
const creationIsOpen = ref(false);
const create = (formData: TrackingCreate | TrackingCreate[]) => {
  isSending.value = true;
  trackingStore.create(formData, false)
    .then(() => fetchCalendar(filter))
    .catch(e => sendingError.value = useError(e, t))
    .finally(() => {
      creationIsOpen.value = false;
      isSending.value = false;
    });
}
const cancel = () => {
  creationIsOpen.value = false;
}
</script>

<template>
  <div class="page w-100 align-center justify-center">
    <v-card>
      <calendar-month
        v-model="calendarValue"
        @day-click="day => onDayClick(day.date)">
        <template #headerEnd>
          <tracking-summary
            :amount="calendarSummary.amount"
            :money="calendarSummary.money"
            class="text-h5" />
        </template>
        <template #date-cell="{ day }">
          <calendar-tracking-record
            v-if="calendarData.has(format(day.date, DATE_FORMAT))"
            :record="(calendarData.get(format(day.date, DATE_FORMAT)) as TrackingDay)"
            :is-holiday="day.isWeekend" />
        </template>
      </calendar-month>
      <v-btn icon="mdi-plus" size="x-large" color="primary" class="add-btn" @click="creationIsOpen = true" />
    </v-card>
    <v-dialog v-model="creationIsOpen" width="960">
      <template v-if="!sendingError">
        <tracking-create-form @cancel="cancel" @submit="create" />
        <v-overlay v-model="isSending" contained class="align-center justify-center">
          <v-progress-circular indeterminate />
        </v-overlay>
      </template>
      <v-alert v-else :title="sendingError?.title" :text="sendingError?.message" type="error" />
    </v-dialog>
    <v-dialog v-model="dayIsOpen" width="960">
      <tracking-calendar-day
        :date="openedDay.date"
        :tracking="openedDay.tracking"
        :total="openedDay.total"
        @save="dayIsOpen = false"
        @cancel="dayIsOpen = false" />
    </v-dialog>
  </div>
</template>