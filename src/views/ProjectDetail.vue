<script setup lang="ts">
import { Project, ProjectDetail } from '@/models/projects.model';
import { RateCreate, RateType } from '@/models/rates.model';
import { UiAlert } from '@/models/ui.model';
import { useProjectsStore } from '@/store/projects';
import { isBefore } from 'date-fns';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import RateCreateForm from '@/components/RateCreate.vue';
import RateAddForm from '@/components/RateAddForm.vue';
import RatesTimeline from '@/components/RatesTimeline.vue';
import { useRatesStore } from '@/store/rates';
import useError from '@/composables/useError';
import { StatusGroup, StatusGroupColor } from '@/models/status.model';
import { Tracking } from '@/models/tracking.model';

const { d, n, t } = useI18n();
const route = useRoute();
const projectsStore = useProjectsStore();
const project = ref<ProjectDetail | null>(null);
const isLoading = ref(false);

const dates = computed<Date[]>(() => {
  return (project.value?.tracking || []).reduce((rng, tracking) => {
    const trackingDate = new Date(tracking.date);
    if (!rng[0] || isBefore(trackingDate, rng[0])) rng[0] = trackingDate;
    if (!rng[1] || isBefore(rng[1], trackingDate)) rng[1] = trackingDate;
    return rng;
  }, [null, null] as [Date | null, Date | null]) as Date[];
});
const datesFormattedForTitle = computed(() => {
  if (!project.value || !project.value.tracking?.length) return t('projects.notStarted');
  return [
    d(dates.value[0]),
    project.value.active ? '...' : d(dates.value[1])
  ].join(' - ');
});
const datesFormattedForTracking = computed(() => {
  if (!project.value || !project.value.tracking?.length) return '';
  return dates.value.map(date => d(date)).join(' - ');
})
const projectCurrency = computed(() => project.value?.rates?.length ? project.value?.rates.at(0)?.currency.id : undefined);
const projectRateType = computed(() => project.value?.rates?.length ? project.value?.rates.at(0)?.type : undefined);
interface TasksSummary {
  total: number;
  active: number;
  groups: { [key: string]: number };
}
const tasksSummary = computed(() => {
  return (project.value?.tasks || []).reduce((acc, task) => {
    acc.total += 1;
    if (task.active) acc.active += 1;
    if (!(task.status.group in acc.groups)) acc.groups[task.status.group as string] = 0;
    acc.groups[task.status.group] += 1;
    return acc;
  }, { total: 0, active: 0, groups: {} } as TasksSummary);
});
interface MoneySumItem {
  value: number;
  formatted: string;
}
interface TrackingSummary {
  hours: number;
  money: { [key: string]: MoneySumItem },
  unrated: Tracking[];
}
const trackingSummary = computed(() => {
  return (project.value?.tracking || []).reduce((acc, tracking) => {
    acc.hours += tracking.hours;
    if (!tracking.rate) acc.unrated.push(tracking);
    const isHourlyRate = tracking.rate && tracking.rate.type === RateType.HOURLY;
    if (isHourlyRate) {
      const currency = tracking.rate.currency.id;
      if (!acc.money[currency]) {
        acc.money[currency] = { value: 0, formatted: '-' };
      }
      const current = acc.money[currency] as MoneySumItem;
      current.value += tracking.hours * tracking.rate.value;
      if (current.value) {
        current.formatted = n(current.value, { key: 'currency', currency });
      }
    }
    return acc;
  }, { hours: 0, money: {}, unrated: [] } as TrackingSummary);
});
const trackingSummaryFormatted = computed(() => {
  const hours = t('tracking.hours', { n: trackingSummary.value.hours });
  const money = Object.keys(trackingSummary.value.money)
    .map(currency => trackingSummary.value.money[currency].formatted)
    .join(' + ');
  return [hours, money].filter(item => !!item).join(', ');
})

function fetch(id: string | number) {
  isLoading.value = true;
  const preparedId = typeof id === 'string' ? parseInt(id) : id;
  projectsStore.fetchDetail(preparedId)
    .then(data => project.value = data)
    .finally(() => isLoading.value = false);
}
if (route.params?.id) fetch(route.params.id as string);

// rates
const ratesStore = useRatesStore();
const addingIsSending = ref(false);
const addingIsOpen = ref(false);
const addingError = ref<UiAlert | null>(null);
const addRates = (rates: number[]) => {
  addingIsSending.value = true;
  const currentProject = project.value as Project;
  projectsStore
    .update(currentProject.id, { rates: rates.map(id => ({ id })) })
    .then(() => {
      fetch(currentProject.id);
      addingIsOpen.value = false;
    })
    .catch(e => addingError.value = useError(e, t))
    .finally(() => {
      addingIsSending.value = false;
    });
}
const openAdding = () => {
  addingError.value = null;
  addingIsOpen.value = true;
  creationIsOpen.value = false;
}
// rate creation
const creationIsSending = ref(false);
const creationError = ref<UiAlert | null>(null);
const creationIsOpen = ref(false);
const createRate = (formData: RateCreate) => {
  creationIsSending.value = true;
  const currentProject = project.value as Project;
  ratesStore
    .create({ ...formData, projects: [{ id: currentProject.id }] })
    .then(() => {
      fetch(currentProject.id);
      creationIsOpen.value = false;
    })
    .catch(e => creationError.value = useError(e, t))
    .finally(() => creationIsSending.value = false);
}
const openCreation = () => {
  creationError.value = null;
  creationIsOpen.value = true;
  addingIsOpen.value = false;
}
</script>

<template>
  <v-card class="project-detail" :loading="isLoading">
    <template v-if="project">
      <v-card-title class="text-h4 py-4">
        <a v-if="project.url" :href="project.url" class="text-high-emphasis text-decoration-none" target="_blank">
          <v-icon size="30" class="mr-2">mdi-open-in-new</v-icon>
          {{ project.title }}
        </a>
        <template v-else>
          {{ project.title }}
        </template>
      </v-card-title>
      <v-card-subtitle>
        {{ `${project.client.orgform.shortName} ${project.client.name}` }}
        <v-chip :color="project.active ? 'success' : 'error'" class="ml-4">
          {{ t(`projects.${ project.active ? 'active' : 'notActive' }`) }}
        </v-chip>
        <span class="text-body-2 text-medium-emphasis ml-4">
          {{ datesFormattedForTitle }}
        </span>
      </v-card-subtitle>
      <div class="project-detail__content px-4 pt-8">
        <rates-timeline
          :rates="project.rates"
          enable-add
          class="project-detail__rates float-end ml-10"
          @add="openAdding" />
        <div class="project-detail__summary">
          <p class="text-h5">{{ t('summary.title') }}</p>
          <div class="project-detail__tasks mt-4">
            <p class="text-h6">
              {{ t('tasks.items') }}
              <v-chip
                v-for="(value, group) in tasksSummary.groups"
                :key="group"
                :color="StatusGroupColor[group as StatusGroup]"
                class="ml-4">
                {{ t(`tasks.statusGroups.${group}`) + ': ' + value }}
              </v-chip>
            </p>
            <p class="text-body-1 text-medium-emphasis mt-2">
              {{ t('summary.totalVariant') + ': ' + tasksSummary?.total }}
            </p>
            <p v-if="tasksSummary.total > 0" class="text-body-1 text-medium-emphasis mt-2">
              {{ t('summary.active') + ': ' + tasksSummary?.active }}
            </p>
          </div>
          <div class="project-detail__tracking mt-4 pb-4">
            <p class="text-h6 mt-2">
              {{ t('tracking.title') }}
              <span v-if="datesFormattedForTracking" class="text-body-1 text-medium-emphasis ml-4">
                {{ datesFormattedForTracking }}
              </span>
            </p>
            <p class="text-body-1 text-medium-emphasis mt-2">
              {{ t('summary.total') + ': ' + trackingSummaryFormatted }}
            </p>
          </div>
        </div>
      </div>
      <v-alert
        v-if="trackingSummary.unrated.length"
        icon="mdi-alert-circle"
        type="error"
        :title="t('error.unrated.title')">
        <p v-for="tracking in trackingSummary.unrated"
          :key="tracking.id"
          class="text-body-1">
          {{ `${d(tracking.date)} ${tracking.task.title} - ${t('tracking.hours', { n: tracking.hours })}` }}
        </p>
      </v-alert>
    </template>
    <v-overlay v-model="isLoading" contained class="align-center justify-center">
      <v-progress-circular indeterminate />
    </v-overlay>
    <v-dialog v-model="addingIsOpen" width="640">
      <template v-if="!addingError">
        <rate-add-form
          :currency="projectCurrency"
          :type="projectRateType"
          :values="(project?.rates || []).map(rate => rate.id)"
          @cancel="addingIsOpen = false"
          @create="openCreation"
          @submit="addRates" />
      </template>
      <v-alert v-else :title="addingError?.title" :text="addingError?.message" type="error" />
    </v-dialog>
    <v-dialog v-model="creationIsOpen" width="640">
      <template v-if="!creationError">
        <rate-create-form
          :currency="projectCurrency"
          :type="projectRateType"
          lock-currency
          lock-type
          @cancel="creationIsOpen = false"
          @submit="createRate" />
        <v-overlay v-model="creationIsSending" contained class="align-center justify-center">
          <v-progress-circular indeterminate />
        </v-overlay>
      </template>
      <v-alert v-else :title="creationError?.title" :text="creationError?.message" type="error" />
    </v-dialog>
  </v-card>
</template>

<style lang="scss" scoped>
.project-detail {
  &__rates {
    min-width: 250px;
  }
  &__summary {
    max-width: calc(100% - 250px - 40px);
  }
}
</style>