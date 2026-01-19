<script setup lang="ts">
import { UiAlert } from '@/models/ui.model';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import TrackingCreateForm from '@/components/tracking/TrackingCreateMultiple.vue';
import TrackingSummary from '@/components/tracking/TrackingSummary.vue';
import { useTrackingStore } from '@/store/tracking';
import { TrackingCreate, TrackingFilter } from '@/models/tracking.model';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { useProjectsStore } from '@/store/projects';
import { useClientsStore } from '@/store/clients';
import useListStore from '@/composables/useListStore';
import useError from '@/composables/useError';
import { Client } from '@/models/clients.model';
import TrackingTable from '@/components/tracking/TrackingTable.vue';

const FORMAT = 'yyyy-MM-dd';
const { t } = useI18n();
const trackingStore = useTrackingStore();
const loadingError = ref<UiAlert | null>(null);
const {
  list,
  isLoading,
  fetchList: fetchListInternal,
  page,
  pageSize,
  pagesCount,
  totalCount,
  paginationQuery,
  hasPrev,
  hasNext,
  setPage,
} = useListStore(trackingStore.service);

// projects
const projectsStore = useProjectsStore();
const projects = computed(() => projectsStore.list);

// clients
const clientsStore = useClientsStore();
const clients = computed(() => clientsStore.list);

// filter
const filter = ref({
  dateFrom: format(startOfMonth(new Date()), FORMAT),
  dateTo: format(endOfMonth(new Date()), FORMAT),
  project: [] as number[],
  client: null as Client['id'] | null,
});
const query = computed(() => ({
  dateFrom: filter.value.dateFrom,
  dateTo: filter.value.dateTo,
  ...(!!filter.value.client && { client: filter.value.client }),
  ...(!!filter.value.project.length && { project: filter.value.project }),
  ...paginationQuery.value,
}));
const showExtraFilter = ref(false);
const hasExtraFilter = computed(() => filter.value.client || filter.value.project?.length);

const setFilter = (data: Partial<TrackingFilter>) => {
  if (data?.dateFrom) filter.value.dateFrom = format(new Date(data.dateFrom), FORMAT);
  if (data?.dateTo) filter.value.dateTo = format(new Date(data.dateTo), FORMAT);
  if (data?.project) filter.value.project = data.project;
  if (data?.client) filter.value.client = data.client;
  fetchList();
}

const fetchList = () => {
  return fetchListInternal(query.value)
    .catch(e => loadingError.value = useError(e, t));
}
if (!list.value.length && !isLoading.value) fetchList();

// table data
const trackingTableCmp = ref<InstanceType<typeof TrackingTable>>();
const tableSummary = computed(() => {
  return trackingTableCmp.value?.summary;
});
const showGroupped = ref(true);

// creation
const isSending = ref(false);
const sendingError = ref<UiAlert | null>(null);
const creationIsOpen = ref(false);
const create = (formData: TrackingCreate | TrackingCreate[]) => {
  isSending.value = true;
  trackingStore.create(formData)
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
                <v-icon name="mdi-filter-variant"></v-icon>
              </v-badge>
              <v-icon v-else name="mdi-filter-variant"></v-icon>
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
            @update:model-value="value => setFilter({ dateFrom: value })" />
        </v-col>
        <v-col cols="2">
          <v-text-field
            type="date"
            hide-details
            :model-value="filter.dateTo"
            :prefix="t('form.dateTo.prefix')"
            variant="underlined"
            @update:model-value="value => setFilter({ dateTo: value })" />
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
            v-if="tableSummary"
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
      <tracking-table ref="trackingTableCmp" :list="list" :groupped="showGroupped" />
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