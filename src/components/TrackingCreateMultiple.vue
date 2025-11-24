<script setup lang="ts">
import { onMounted, reactive, computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { useTasksStore } from '@/store/tasks';
import { Task } from '@/models/tasks.model';
import TrackingCreateRow from './TrackingCreateRow.vue';

const props = defineProps({
  task: {
    type: Object as PropType<Task>,
    default: null,
  },
  showTask: {
    type: Boolean,
    default: true,
  },
  date: {
    type: Date,
    default: () => new Date(),
  },
  showDate: {
    type: Boolean,
    default: true,
  },
  showActions: {
    type: Boolean,
    default: true,
  },
})

const { t } = useI18n();
const tasksStore = useTasksStore();
const tasks = computed(() => tasksStore.list);
onMounted(() => {
  if (!tasks.value.length) tasksStore.fetchList();
});
// form
const formInitialData = computed(() => ({
  task: props.task,
  date: props.date.toISOString(),
  note: '',
  amount: null as number | null,
}));
const formData = reactive([{...formInitialData.value}]);
const onRowChange = async (data: typeof formInitialData.value, i: number) => {
  formData[i] = data;
  const isValid = await $v.value.$validate();
  if (isValid) emits('update', formData);
}
const addColumn = () => {
  formData.push({...formInitialData.value});
  emits('add', formData);
}
const removeColumn = (i: number) => {
  formData.splice(i, 1);
  emits('remove', formData);
}
const $v = useVuelidate();

const emits = defineEmits(['submit', 'cancel', 'update', 'add', 'remove']);
const submit = async () => {
  const isValid = await $v.value.$validate();
  if (isValid) emits('submit', formData);
}
const cancel = () => {
  emits('cancel');
}
</script>

<template>
  <v-card :title="t('tracking.create')">
    <v-card-item>
      <v-form @keyup.enter="submit">
        <tracking-create-row
          v-for="(set, i) in formData"
          :key="i"
          :tasks="tasks"
          :model-value="set"
          :show-date="showDate"
          :show-task="showTask"
          @change="data => onRowChange(data, i)">
          <template #actions>
            <v-btn v-if="i === formData.length - 1" icon="mdi-plus" variant="plain" size="small" @click="addColumn" />
            <v-btn v-else icon="mdi-delete" color="error" variant="plain" size="small" @click="removeColumn(i)" />
          </template>
        </tracking-create-row>
      </v-form>
    </v-card-item>
    <v-card-actions v-if="showActions" class="px-6 pb-6">
      <v-spacer />
      <v-btn @click="cancel">{{ t('btn.cancel') }}</v-btn>
      <v-btn color="primary" variant="flat" @click="submit">{{ t('btn.submit') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>