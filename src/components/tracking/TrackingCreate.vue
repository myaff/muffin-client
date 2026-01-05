<script setup lang="ts">
import { onMounted, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useTasksStore } from '@/store/tasks';
import { Task } from '@/models/tasks.model';

const { t } = useI18n();
const tasksStore = useTasksStore();
const tasks = computed(() => tasksStore.list);
onMounted(() => {
  if (!tasks.value.length) tasksStore.fetchList();
});
// form
const formInitialData = {
  task: null as Task | null,
  date: new Date().toISOString(),
  note: '',
  amount: 0,
};
const formData = reactive(formInitialData);
const rules = {
  task: { required },
  amount: { required },
  date: { required },
};
const $v = useVuelidate(rules, formData);
const emits = defineEmits(['submit', 'cancel']);
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
        <v-autocomplete
          v-model="formData.task"
          :items="tasks"
          :label="t('tracking.fields.task')"
          item-value="id"
          :item-title="item => `${item.code} ${item.title}`"
          :error-messages="$v.task.$errors.map(e => e.$message as string)"
          class="mb-4"
          @blur="$v.task.$touch" />
        <v-text-field
          v-model="formData.amount"
          type="number"
          hide-spin-buttons
          :label="t('tracking.fields.hours')"
          :error-messages="$v.amount.$errors.map(e => e.$message as string)"
          class="mb-4"
          @blur="$v.amount.$touch" />
        <v-text-field
          v-model="formData.date"
          type="date"
          :label="t('tracking.fields.date')"
          :error-messages="$v.date.$errors.map(e => e.$message as string)"
          class="mb-4"
          @blur="$v.date.$touch" />
        <v-text-field
          v-model="formData.note"
          type="text"
          class="mb-4"
          :label="t('tracking.fields.note')" />
      </v-form>
    </v-card-item>
    <v-card-actions class="px-6 pb-6">
      <v-spacer />
      <v-btn @click="cancel">{{ t('btn.cancel') }}</v-btn>
      <v-btn color="primary" variant="flat" @click="submit">{{ t('btn.submit') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>