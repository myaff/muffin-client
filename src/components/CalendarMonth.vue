<script lang="ts" setup>
import { computed, type PropType } from 'vue';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, subMonths, addMonths, isToday, isWeekend, getWeek, getDate, eachMonthOfInterval, startOfYear, endOfYear, setMonth, setYear, startOfMonth, endOfMonth } from 'date-fns';
interface DayView {
  date: Date,
  isCurrentMonth: boolean;
  isPrevMonth: boolean;
  isNextMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

const props = defineProps({
  modelValue: {
    type: Date,
    default: () => new Date(),
  },
  weekStartsOn: {
    type: Number as PropType<0 | 1 | 2 | 3 | 4 | 5 | 6>,
    default: 1, // Monday
  },
})

const emits = defineEmits(['day-click', 'update:model-value']);
const onDayClick = (day: DayView) => {
  emits('day-click', day);
}
const month = computed(() => format(props.modelValue, 'MMMM'));
const year = computed(() => format(props.modelValue, 'yyyy'));
const weekDays = eachDayOfInterval({
  start: startOfWeek(props.modelValue, { weekStartsOn: props.weekStartsOn }),
  end: endOfWeek(props.modelValue, { weekStartsOn: props.weekStartsOn })
}).map((date, i) => ({ id: i, name: format(date, 'EEEE') }));
const monthStart = computed(() => startOfMonth(props.modelValue));
const monthEnd = computed(() => endOfMonth(props.modelValue));
const weeks = computed(() => {
  const days = eachDayOfInterval({
    start: startOfWeek(monthStart.value, { weekStartsOn: props.weekStartsOn }),
    end: endOfWeek(monthEnd.value, { weekStartsOn: props.weekStartsOn })
  });
  return days.reduce((acc, day) => {
    const week = getWeek(day, { weekStartsOn: props.weekStartsOn });
    if (!acc[week]) acc[week] = [];
    const isCurMonth = isSameMonth(props.modelValue, day);
    acc[week].push({
      date: day,
      isCurrentMonth: isCurMonth,
      isPrevMonth: !isCurMonth && isSameMonth(subMonths(props.modelValue, 1), day),
      isNextMonth: !isCurMonth && isSameMonth(addMonths(props.modelValue, 1), day),
      isToday: isToday(day),
      isWeekend: isWeekend(day),
    });
    return acc;
  }, {} as { [key: number]: DayView[] })
})
const months = computed(() => {
  return eachMonthOfInterval({
    start: startOfYear(props.modelValue),
    end: endOfYear(props.modelValue),
  }).map(date => ({
    index: format(date, 'M'),
    name: format(date, 'MMMM')
  }));
})
function setNextMonth() {
  emits('update:model-value', addMonths(props.modelValue, 1));
}
function setPrevMonth() {
  emits('update:model-value', addMonths(props.modelValue, -1));
}
function setToday() {
  emits('update:model-value', new Date());
}
function setMonthValue(value: string) {
  emits('update:model-value', setMonth(props.modelValue, Number.parseInt(value) - 1));
}
function setYearValue(value: string) {
  emits('update:model-value', setYear(props.modelValue, Number.parseInt(value)));
}
</script>

<template>
  <div class="calendar-month">
    <div class="calendar-month__head">
      <v-row align="center">
        <v-col cols="6" class="calendar-month__head-controls">
          <v-btn icon="mdi-chevron-left" variant="plain" @click="setPrevMonth" />
          <v-btn icon="mdi-chevron-right" variant="plain" @click="setNextMonth" />
          <v-btn variant="plain" @click="setToday">Today</v-btn>
          <v-select
            :model-value="month"
            :items="months"
            item-title="name"
            item-value="index"
            variant="underlined"
            class="calendar-month__head-month ml-4"
            @update:model-value="setMonthValue" />
          <v-text-field
            :model-value="year"
            type="number"
            variant="underlined"
            class="calendar-month__head-year ml-4"
            @update:model-value="setYearValue" />
        </v-col>
        <v-spacer />
        <v-col cols="auto">
          <slot name="headerEnd" />
        </v-col>
      </v-row>
    </div>
    <table class="calendar-month__table">
      <thead>
        <tr class="calendar-month__table-row calendar-month__table-row--head">
          <th v-for="day in weekDays" :key="day.id" class="calendar-month__table-cell calendar-month__table-cell--head text-button">
            {{ day.name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(week, key) in weeks" :key="key" class="calendar-month__table-row">
          <td v-for="day in week" :key="day.date.toISOString()" :class="{
            ['prev-month']: day.isPrevMonth,
            ['cur-month']: day.isCurrentMonth,
            ['next-month']: day.isNextMonth,
            today: day.isToday,
            weekend: day.isWeekend
          }" class="calendar-month__table-cell calendar-day" @click="onDayClick(day)">
            <div class="calendar-day__day text-h5">
              {{ getDate(day.date) }}
            </div>
            <div class="calendar-day__content">
              <slot name="date-cell" :day="day" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.calendar-month {
  &__head {
    &-controls {
      display: flex;
      align-items: center;
    }
    &-year {
      max-width: 70px;
    }
    &-month {
      max-width: 200px;
    }
  }
  &__table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;

    &-cell {
      padding: 0.75rem 1rem;
      border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
      text-align: right;
      cursor: pointer;

      &:hover {
        background: rgba(var(--v-theme-surface-bright), var(--v-hover-opacity));
      }

      &--head {
        position: sticky;
        top: 0;
        text-align: center;
      }
    }
  }
}
.calendar-day {
  &.prev-month,
  &.next-month {
    opacity: 0.3;
  }
  &.weekend {
    color: rgb(var(--v-theme-error));
  }
  &.today {
    color: rgb(var(--v-theme-primary-darken-1));
  }
  &__content {
    margin-top: 0.5em;
    min-height: 2rem;
  }
}
</style>