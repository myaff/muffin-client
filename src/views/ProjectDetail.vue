<script setup lang="ts">
import { Project, ProjectUpdate, ProjectDetail } from '@/models/projects.model';
import { RateCreate, RateType } from '@/models/rates.model';
import { UiAlert } from '@/models/ui.model';
import { useProjectsStore } from '@/store/projects';
import { isBefore } from 'date-fns';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import RateCreateForm from '@/components/RateCreate.vue';
import RateAddForm from '@/components/RateAddForm.vue';
import { useRatesStore } from '@/store/rates';
import useError from '@/composables/useError';
import { StatusGroup, StatusGroupColor } from '@/models/status.model';
import { Tracking } from '@/models/tracking.model';
import { getQueryParamValue } from '@/helpers/url.helper';
import { isNumber } from 'lodash-es';
import WidgetDates from '@/components/WidgetDates.vue';
import WidgetEstimate from '@/components/WidgetEstimate.vue';

const emits = defineEmits(['edit']);
const { d, n, t } = useI18n();
const route = useRoute();
const projectsStore = useProjectsStore();
const preparedId = computed(() => Number.parseInt(getQueryParamValue(route.params.id)));
const project = computed(() => projectsStore.detailsMap.get(preparedId.value));
const isLoading = ref(false);
if (isNumber(preparedId.value)) fetch(preparedId.value);
const active = ref(project.value?.active ?? true);
const activeIsUpdating = ref(false);
watch(project, value => {
  if (value) active.value = value.active;
})
function update(id: Project['id'], payload: ProjectUpdate) {
  return projectsStore.update(id, payload);
}
function updateActive() {
  if (!project.value) return;
  activeIsUpdating.value = true;
  update(project.value.id, { active: active.value })
    .finally(() => activeIsUpdating.value = false);
}

const dates = computed<Date[]>(() => {
  return (project.value?.tracking || []).reduce((rng, tracking) => {
    const trackingDate = new Date(tracking.date);
    if (!rng[0] || isBefore(trackingDate, rng[0])) rng[0] = trackingDate;
    if (!rng[1] || isBefore(rng[1], trackingDate)) rng[1] = trackingDate;
    return rng;
  }, [null, null] as [Date | null, Date | null]) as Date[];
});
const datesFormattedForTracking = computed(() => {
  if (!project.value || !project.value.tracking?.length) return '';
  return dates.value.map(date => d(date)).join(' - ');
})
const projectCurrency = computed(() => project.value?.rates?.length ? project.value?.rates.at(0)?.currency.id : undefined);
const projectRateType = computed(() => project.value?.rates?.length ? project.value?.rates.at(0)?.type : undefined);
const projectTracking = computed(() => {
  if (!project.value) return [];
  return project.value.tasks.reduce((acc, task) => {
    if (task?.tracking?.length) acc.push(...task?.tracking);
    return acc;
  }, [] as (ProjectDetail['tasks'][number]['tracking'][number])[])
})
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
  amount: number;
  money: { [key: string]: MoneySumItem },
  unrated: Tracking[];
}
const trackingSummary = computed(() => {
  return projectTracking.value.reduce((acc, tracking) => {
    acc.amount += tracking.amount;
    if (!tracking.rateVersion) acc.unrated.push(tracking);
    const isHourlyRate = tracking.rateVersion && tracking.rateVersion.ratePlan.type === RateType.HOURLY;
    if (isHourlyRate) {
      const currency = tracking.rateVersion.ratePlan.currency.id;
      if (!acc.money[currency]) {
        acc.money[currency] = { value: 0, formatted: '-' };
      }
      const current = acc.money[currency] as MoneySumItem;
      current.value += tracking.amount * tracking.rateVersion.amount;
      if (current.value) {
        current.formatted = n(current.value, { key: 'currency', currency });
      }
    }
    return acc;
  }, { amount: 0, money: {}, unrated: [] } as TrackingSummary);
});
const trackingSummaryFormatted = computed(() => {
  const amount = t('tracking.hours', { n: trackingSummary.value.amount });
  const money = Object.keys(trackingSummary.value.money)
    .map(currency => trackingSummary.value.money[currency].formatted)
    .join(' + ');
  return [amount, money].filter(item => !!item).join(', ');
})

function fetch(id: number) {
  isLoading.value = true;
  projectsStore.getDetail(id)
    .finally(() => isLoading.value = false);
}

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
      <v-card-item>
        <v-row>
          <v-col>
            <p class="text-body-1 pr-12">
              <router-link
                :to="{ name: 'client', params: { id: project.client.id } }"
                class="text-high-emphasis text-decoration-none">
                {{ project.client.name }}
              </router-link>
              <span class="mx-2">/</span>
              <component :is="project?.url ? 'a' : 'span'" :href="project?.url ?? undefined" class="text-high-emphasis text-decoration-none" :target="project?.url ? '_blank' : undefined">
                {{ project.code }}
              </component>
            </p>
            <h1 class="text-h4 mt-3">
              {{ project.title }}
            </h1>
          </v-col>
        </v-row>
      </v-card-item>
      <v-card-item>
        <v-row>
          <v-col cols="12" md="8">
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
          </v-col>
          <v-col cols="12" md="4">
            <v-btn prepend-icon="mdi-pencil" class="ml-auto" @click="emits('edit', project)">
              {{ t('btn.edit') }}
            </v-btn>
            <WidgetDates :entity="project" />
            <WidgetEstimate :entity="project" />
            <v-switch
              v-model="active"
              :label="active ? t('projects.active') : t('projects.notActive')"
              :color="active ? 'success' : 'default'"
              @update:model-value="updateActive" />
          </v-col>
        </v-row>
      </v-card-item>
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