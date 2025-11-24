<script setup lang="ts">
import { reactive, computed, onMounted, PropType, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useProjectsStore } from '@/store/projects';
import { useAppStore } from '@/store/app';
import { StatusGroupColor } from '@/models/status.model';
import { Task, TaskCreate, TaskPriority } from '@/models/tasks.model';
import usePriority from '@/composables/usePriority';
import { isNumber } from 'lodash-es';

const props = defineProps({
  task: {
    type: Object as PropType<Task | null>,
    default: null,
  },
})
const { t } = useI18n();
const projectsStrore = useProjectsStore();
const appStore = useAppStore();
const projects = computed(() => projectsStrore.list);
const statuses = computed(() => appStore.statuses);
const defaultStatus = computed(() => {
  if (!statuses.value.length) return null;
  return statuses.value.find(item => item?.default)
    ?? statuses.value.at(0)})
const { priorities } = usePriority(t);
onMounted(() => {
  if (!projects.value.length) projectsStrore.fetchList();
  if (!statuses.value.length) appStore.fetchStatuses();
});
// form
const formInitialData = {
  title: props.task?.title ?? '',
  code: props.task?.code ?? '',
  url: props.task?.url ?? '',
  priority: props.task?.priority ?? TaskPriority.MEDIUM,
  startDate: props.task?.startDate ?? null,
  endDate: props.task?.endDate ?? null,
  project: props.task?.project ?? null,
  status: props.task?.status ?? defaultStatus.value ?? null,
  description: props.task?.description ?? '',
  active: props.task?.active ?? true,
};
const formData = reactive({ ...formInitialData });
const estimate = reactive({
  min: props.task?.estimate?.min ?? null,
  max: props.task?.estimate?.max ?? null,
})
watch(defaultStatus, value => {
  if (value && !formInitialData.status) formInitialData.status = value;
  if (value && !formData.status) formData.status = value;
})
const rules = {
  title: { required },
  code: { required },
  project: { required },
  status: { required },
};
const $v = useVuelidate(rules, formData);
const emits = defineEmits(['submit', 'cancel']);
const submit = async () => {
  const isValid = await $v.value.$validate();
  if (isValid) {
    const payload = { ...formData } as Partial<TaskCreate>;
    if (isNumber(estimate.min) || isNumber(estimate.max)) {
      payload.estimate = {
        min: isNumber(estimate.min) ? estimate.min : estimate.max,
        max: isNumber(estimate.max) ? estimate.max : estimate.min,
      }
    }
    emits('submit', payload);
  }
}
const cancel = () => {
  emits('cancel');
}
</script>

<template>
  <v-card :title="task ? t('tasks.update') : t('tasks.create')">
    <v-card-item>
      <v-form @keyup.enter="submit">
        <v-textarea
          v-model="formData.title"
          class="mb-4"
          :label="t('tasks.fields.title')"
          :error-messages="$v.title.$errors.map(e => e.$message as string)"
          rows="1"
          auto-grow
          @blur="$v.title.$touch" />
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="formData.url"
              type="text"
              class="mb-4"
              hide-details
              :label="t('tasks.fields.url')" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="formData.code"
              type="text"
              class="mb-4"
              hide-details
              :label="t('tasks.fields.code')"
              :error-messages="$v.code.$errors.map(e => e.$message as string)"
              @blur="$v.code.$touch" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="8">
            <v-textarea
              v-model="formData.description"
              class="mb-5"
              :label="t('tasks.fields.description')"
              rows="5"
              hide-details
              auto-grow />
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.startDate"
                    type="date"
                    hide-details
                    :label="t('date.startDate')" />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.endDate"
                    type="date"
                    hide-details
                    :label="t('date.endDate' )" />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="estimate.min"
                    type="number"
                    hide-details>
                    <template #prepend-inner>
                      <span class="text-medium-emphasis text-no-wrap mr-2">
                        {{ t('estimation.title') }},
                        {{ t('estimation.min') }}
                      </span>
                    </template>
                    <template #append-inner>
                      <span class="text-medium-emphasis text-no-wrap mr-2">
                        {{ t('tracking.hoursWtd', Number(estimate.min)) }}
                      </span>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="estimate.max"
                    type="number"
                    hide-details>
                    <template #prepend-inner>
                      <span class="text-medium-emphasis text-no-wrap mr-2">
                        {{ t('estimation.title') }}
                        {{ t('estimation.max') }}
                      </span>
                    </template>
                    <template #append-inner>
                      <span class="text-medium-emphasis text-no-wrap mr-2">
                        {{ t('tracking.hoursWtd', Number(estimate.max)) }}
                      </span>
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-if="projects.length"
              v-model="formData.project"
              :items="projects"
              :label="t('tasks.fields.project')"
              item-title="title"
              item-value="id"
              :error-messages="$v.project.$errors.map(e => e.$message as string)"
              @blur="$v.project.$touch" />
            <v-select
              v-model="formData.status"
              :items="statuses"
              item-title="title"
              item-value="id"
              :item-props="item => ({ ...item, title: item.title.toUpperCase() })"
              :error-messages="$v.status.$errors.map(e => e.$message as string)"
              @blur="$v.status.$touch">
              <template #prepend-inner>
                <span class="text-medium-emphasis">
                  {{ t('tasks.fields.status') }}:
                </span>
              </template>
              <template #selection="{ item }">
                <v-chip :color="StatusGroupColor[item.raw.group]" density="comfortable">
                  {{ item.title }}
                </v-chip>
              </template>
              <template #item="{ props, item }">
                <v-list-item v-bind="{...props, title: ''}">
                  <v-chip :color="StatusGroupColor[item.raw.group]" density="comfortable">
                    {{ item.title }}
                  </v-chip>
                </v-list-item>
              </template>
            </v-select>
            <v-select
              v-model="formData.priority"
              :items="priorities"
              item-title="title"
              item-value="value"
              :item-props="item => ({ ...item, title: item.title.toUpperCase() })">
              <template #prepend-inner>
                <span class="text-medium-emphasis">
                  {{ t('tasks.fields.priority') }}:
                </span>
              </template>
              <template #selection="{ item }">
                <v-chip :prepend-icon="item.raw.icon" :color="item.raw.color">
                  {{ item.title }}
                </v-chip>
              </template>
              <template #item="{ props, item }">
                <v-list-item v-bind="{...props, title: ''}">
                  <v-chip :prepend-icon="item.raw.icon" :color="item.raw.color" density="comfortable">
                    {{ item.title }}
                  </v-chip>
                </v-list-item>
              </template>
            </v-select>
            <v-switch
              v-model="formData.active"
              :label="formData.active ? t('tasks.active') : t('tasks.notActive')"
              :color="formData.active ? 'success' : 'default'" />
          </v-col>
        </v-row>
      </v-form>
    </v-card-item>
    <v-card-actions class="px-6 pb-6">
      <v-spacer />
      <v-btn @click="cancel">{{ t('btn.cancel') }}</v-btn>
      <v-btn color="primary" variant="flat" @click="submit">{{ t('btn.submit') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>