<script setup lang="ts">
import { TaskDetail } from '@/models/tasks.model';
import { useAppStore } from '@/store/app';
import { useTasksStore } from '@/store/tasks';
import { isBefore } from 'date-fns';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { StatusGroupColor } from '@/models/status.model';
import TaskDetailTracking from '@/components/TaskDetailTracking.vue';
import RatesTimeline from '@/components/RatesTimeline.vue';

const { d, n, t } = useI18n();
const route = useRoute();
const tasksStore = useTasksStore();
const appStore = useAppStore();
const task = ref<TaskDetail | null>(null);
const statuses = computed(() => appStore.statuses);
const isLoading = ref(false);
function fetch(id: string | number) {
  isLoading.value = true;
  const preparedId = typeof id === 'string' ? parseInt(id) : id;
  tasksStore.fetchDetail(preparedId)
    .then(data => task.value = data)
    .finally(() => isLoading.value = false);
}
if (route.params?.id) fetch(route.params.id as string);

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
</script>

<template>
  <v-card class="task-detail" :loading="isLoading">
    <template v-if="task">
      <v-card-title class="text-h4 py-4 text-trunc-disable pr-12">
        <a v-if="task.url" :href="task.url" class="text-high-emphasis text-decoration-none" target="_blank">
          <v-icon size="30" class="mr-2">mdi-open-in-new</v-icon>
          {{ task.title }}
        </a>
        <template v-else>
          {{ task.title }}
        </template>
      </v-card-title>
      <v-card-subtitle class="d-flex align-center ga-4">
        <router-link
          :to="{ name: 'project', params: { id: task.project.id } }"
          class="text-high-emphasis text-decoration-none">
          {{ task.project.title }}
        </router-link>
        <v-chip :color="task.active ? 'success' : 'error'">
          {{ t(`tasks.${ task.active ? 'active' : 'notActive' }`) }}
        </v-chip>
        <span class="text-body-2 text-high-emphasis">
          {{ datesFormattedForTitle }}
        </span>
        <v-btn prepend-icon="mdi-pencil" class="ml-auto">{{ t('btn.edit') }}</v-btn>
      </v-card-subtitle>
      <v-card-item class="mt-4 pb-6">
        <v-row>
          <v-col>
            <TaskDetailTracking :tracking="task.tracking" />
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
            <rates-timeline :rates="task.rates" class="mt-8" />
          </v-col>
        </v-row>
      </v-card-item>
    </template>
  </v-card>
</template>