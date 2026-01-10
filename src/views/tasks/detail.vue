<script setup lang="ts">
import { TaskDetail, TaskUpdate } from '@/models/tasks.model';
import { useAppStore } from '@/store/app';
import { useTasksStore } from '@/store/tasks';
import { isBefore } from 'date-fns';
import { computed, Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { StatusGroupColor } from '@/models/status.model';
import TaskDetailTracking from '@/components/task/TaskDetailTracking.vue';
import { RatePlan, RatePlanWithVersions } from '@/models/rates.model';
import WidgetDates from '@/components/WidgetDates.vue';
import { getQueryParamValue } from '@/helpers/url.helper';
import { isNumber } from 'lodash-es';
import WidgetEstimate from '@/components/WidgetEstimate.vue';

const emits = defineEmits(['edit']);
const { d, t } = useI18n();
const route = useRoute();
const tasksStore = useTasksStore();
const appStore = useAppStore();
const preparedId = computed(() => Number.parseInt(getQueryParamValue(route.params?.id ?? '')));
const task = computed(() => tasksStore.detailsMap.get(preparedId.value));
const statuses = computed(() => appStore.statuses);
const isLoading = ref(false);
function fetch(id: number, silent = false) {
  if (!silent) isLoading.value = true;
  tasksStore.getDetail(id)
    .finally(() => isLoading.value = false);
}
if (isNumber(preparedId.value)) fetch(preparedId.value);

const dates = computed<Date[]>(() => {
  return (task.value?.tracking || []).reduce((rng, tracking) => {
    const trackingDate = new Date(tracking.date);
    if (!rng[0] || isBefore(trackingDate, rng[0])) rng[0] = trackingDate;
    if (!rng[1] || isBefore(rng[1], trackingDate)) rng[1] = trackingDate;
    return rng;
  }, [null, null] as [Date | null, Date | null]) as Date[];
});
const datesFormattedForTitle = computed(() => {
  if (!task.value || !task.value.tracking?.length) return t('tasks.notStarted');
  return [
    d(dates.value[0]),
    task.value.active ? '...' : d(dates.value[1])
  ].join(' - ');
});

const taskTracking = computed(() => {
  const ratePlan = task.value?.ratePlan
    ? { ...task.value.ratePlan } as RatePlan & Partial<Pick<RatePlanWithVersions, 'versions'>>
    : null;
  if (!ratePlan) return task.value?.tracking;
  delete ratePlan.versions;
  return task.value?.tracking.map(trackRecord => ({
    ...trackRecord,
    rateVersion: { ...trackRecord.rateVersion, ratePlan },
  }));
})

// update
const isStatusUpdating = ref(false);
const updateStatus = (statusId: number) => {
  if (!task.value) return;
  const currentTask = task.value as TaskDetail;
  isStatusUpdating.value = true;
  tasksStore.update(currentTask.id, { status: { id: statusId } })
    .then(() => fetch(currentTask.id))
    .finally(() => isStatusUpdating.value = false);
}
const updateTask = (taskId: TaskDetail['id'], payload: TaskUpdate) => {
  return tasksStore.update(taskId, payload)
    .then(() => fetch(taskId));
}
type TaskFormData = Pick<TaskDetail, 'title' | 'description'>;
const taskInitial: TaskFormData = {
  title: '',
  description: '',
}
const formData: Ref<TaskFormData> = ref({...taskInitial});
watch(task, value => {
  if (value) {
    formData.value.title = value.title;
    formData.value.description = value.description;
  }
})
const descriptionEditable = ref(false);
const descriptionChanged = computed(() => {
  if (!task.value) return false;
  return task.value.description !== formData.value.description;
})

function onDescriptionBlur() {
  descriptionEditable.value = descriptionChanged.value;
}

function saveDescription() {
  if (!task.value) return;
  updateTask(task.value.id, { description: formData.value.description })
    .then(() => descriptionEditable.value = false);
}
</script>

<template>
  <v-card class="task-detail" :loading="isLoading">
    <template v-if="task">
      <v-card-item>
        <v-row>
          <v-col>
            <p class="text-body-1 pr-12">
              <router-link
                :to="{ name: 'project', params: { id: task.project.id } }"
                class="text-high-emphasis text-decoration-none">
                {{ task.project.title }}
              </router-link>
              <span class="mx-2">/</span>
              <component :is="task?.url ? 'a' : 'span'" :href="task?.url ?? undefined" class="text-high-emphasis text-decoration-none" :target="task?.url ? '_blank' : undefined">
                {{ task.code }}
              </component>
            </p>
            <h1 class="text-h4 mt-3">
              {{ task.title }}
            </h1>
          </v-col>
        </v-row>
      </v-card-item>

      <v-card-subtitle class="d-flex align-center ga-4">

        <v-chip :color="task.active ? 'success' : 'error'">
          {{ t(`tasks.${ task.active ? 'active' : 'notActive' }`) }}
        </v-chip>
        <span class="text-body-2 text-high-emphasis">
          {{ datesFormattedForTitle }}
        </span>
        <v-btn prepend-icon="mdi-pencil" class="ml-auto" @click="emits('edit', task)">
          {{ t('btn.edit') }}
        </v-btn>
      </v-card-subtitle>
      <v-card-item class="mt-4 pb-6">
        <v-row>
          <v-col>
            <v-textarea
              v-model="formData.description"
              :placeholder="t('tasks.fields.description')"
              :persistent-placeholder="!descriptionEditable"
              :readonly="!descriptionEditable"
              :single-line="!descriptionEditable"
              rows="2"
              variant="solo-filled"
              flat
              auto-grow
              :class="{ readonly: !descriptionEditable }"
              @blur="onDescriptionBlur">
              <template #append-inner>
                <v-btn
                  v-if="!descriptionEditable"
                  icon="mdi-pencil"
                  variant="plain"
                  @click="descriptionEditable = true" />
                <v-btn
                  v-if="descriptionChanged"
                  icon="mdi-content-save"
                  variant="plain"
                  color="primary"
                  @click="saveDescription" />
              </template>
            </v-textarea>
            <TaskDetailTracking :tracking="taskTracking" />
          </v-col>
          <v-col cols="4">
            <v-select
              v-if="statuses.length"
              :model-value="task.status.id"
              :items="statuses"
              item-title="title"
              item-value="id"
              :bg-color="StatusGroupColor[task.status.group]"
              variant="solo"
              density="compact"
              flat
              hide-details
              :item-props="item => ({ ...item, title: item.title.toUpperCase() })"
              @update:model-value="updateStatus">
              <template #item="{ props, item }">
                <v-list-item v-bind="{...props, title: ''}">
                  <v-chip :color="StatusGroupColor[item.raw.group]">
                    {{ item.title }}
                  </v-chip>
                </v-list-item>
              </template>
            </v-select>
            <WidgetDates :entity="task" class="mt-3" />
            <WidgetEstimate v-if="task?.estimate" :entity="task" />
          </v-col>
        </v-row>
      </v-card-item>
    </template>
  </v-card>
</template>