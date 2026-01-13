<script setup lang="ts">
import { Project, ProjectUpdate, ProjectDetail } from '@/models/projects.model';
import { RateScope, RateType } from '@/models/rates.model';
import { useProjectsStore } from '@/store/projects';
import { isBefore } from 'date-fns';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useRatesStore } from '@/store/rates';
import useError from '@/composables/useError';
import { StatusGroup, StatusGroupColor } from '@/models/status.model';
import { Tracking } from '@/models/tracking.model';
import { getQueryParamValue } from '@/helpers/url.helper';
import { isNumber } from 'lodash-es';
import WidgetDates from '@/components/WidgetDates.vue';
import WidgetEstimate from '@/components/WidgetEstimate.vue';
import RatePlanMini from '@/components/rate/RatePlanMini.vue';
import RatePlanCreateUpdate from '@/components/rate/RatePlanCreateUpdate.vue';
import { useDisplay } from 'vuetify';
import useCreateUpdate from '@/composables/useCreateUpdate';

const emits = defineEmits(['edit']);
const { d, n, t } = useI18n();
const { xs } = useDisplay();
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
const projectTracking = computed(() => {
  if (!project.value) return [];
  return project.value.tasks.reduce((acc, task) => {
    if (task?.tracking?.length) acc.push(...task.tracking);
    return acc;
  }, [] as (ProjectDetail['tasks'][number]['tracking'][number])[])
})
const dates = computed<Date[]>(() => {
  return projectTracking.value.reduce((rng, tracking) => {
    const trackingDate = new Date(tracking.date);
    if (!rng[0] || isBefore(trackingDate, rng[0])) rng[0] = trackingDate;
    if (!rng[1] || isBefore(rng[1], trackingDate)) rng[1] = trackingDate;
    return rng;
  }, [null, null] as [Date | null, Date | null]) as Date[];
});
const datesFormattedForTracking = computed(() => {
  if (!project.value || !projectTracking.value?.length) return '';
  return dates.value.map(date => d(date)).join(' - ');
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
const ratePlan = computed(() => {
  if (!project.value) return null;
  if (project.value?.ratePlan) return project.value.ratePlan;
  return ratesStore.getRateForProject(project.value);
})
const {
  isSending,
  sendingError,
  creationIsOpen,
  create,
  cancel,
  openCreation,
} = useCreateUpdate({
  store: ratesStore,
  onError: (e) => useError(e, t),
});
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
            <RatePlanMini v-if="ratePlan" :item="ratePlan" class="my-4" />
            <v-btn
              v-if="!project?.ratePlan"
              :text="`${t('rates.override')} ${t('projects.forItem')}`"
              class="mb-6 text-wrap"
              prepend-icon="mdi-currency-usd"
              variant="tonal"
              :size="xs ? 'large' : undefined"
              @click="openCreation" />
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
    <v-dialog v-model="creationIsOpen" width="90vw" max-width="500">
      <template v-if="!sendingError">
        <rate-plan-create-update
          :scope="RateScope.PROJECT"
          :project="project"
          @cancel="cancel"
          @submit="create" />
        <v-overlay v-model="isSending" contained class="align-center justify-center">
          <v-progress-circular indeterminate />
        </v-overlay>
      </template>
      <v-alert v-else :title="sendingError?.title" :text="sendingError?.message" type="error" />
      <v-btn
        v-if="creationIsOpen && !isSending"
        icon="mdi-close"
        class="close-dialog"
        variant="plain"
        @click="cancel" />
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