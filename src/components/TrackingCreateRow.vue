<script setup lang="ts">
import { reactive, PropType, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { Task } from '@/models/tasks.model';
interface FormData {
  task: Task | null;
  date: string | null;
  note: string | null;
  hours: number | null;
}
const { t } = useI18n();
const props = defineProps({
  tasks: {
    type: Array as PropType<Task[]>,
    default: () => [],
  },
  modelValue: {
    type: Object as PropType<FormData>,
    required: true,
  },
  showTask: {
    type: Boolean,
    default: true,
  },
  showDate: {
    type: Boolean,
    default: true,
  },
});
const emits = defineEmits(['change']);
const formData = reactive({...props.modelValue});
const rules = {
  task: { required },
  hours: { required },
  date: { required },
};
const $v = useVuelidate(rules, formData);
const onBlur = (fieldName: keyof FormData) => {
  if (fieldName in $v.value) $v.value[fieldName].$touch();
  emits('change', formData);
}
</script>

<template>
  <v-row>
    <v-col v-if="showTask">
      <v-autocomplete
        v-model="formData.task"
        :items="tasks"
        :label="t('tracking.fields.task')"
        item-value="id"
        :item-title="item => `${item.code} ${item.title}`"
        :error-messages="$v.task.$errors.map(e => e.$message as string)"
        @blur="onBlur('task')" />
    </v-col>
    <v-col>
      <v-text-field
        v-model="formData.hours"
        type="number"
        hide-spin-buttons
        :label="t('tracking.fields.hours')"
        :error-messages="$v.hours.$errors.map(e => e.$message as string)"
        @blur="onBlur('hours')" />
    </v-col>
    <v-col v-if="showDate">
      <v-text-field
        v-model="formData.date"
        type="date"
        :label="t('tracking.fields.date')"
        :error-messages="$v.date.$errors.map(e => e.$message as string)"
        @blur="onBlur('date')" />
    </v-col>
    <v-col>
      <v-text-field
        v-model="formData.note"
        type="text"
        :label="t('tracking.fields.note')"
        @blur="onBlur('note')" />
    </v-col>
    <v-col v-if="$slots.actions" cols="auto" class="mt-2">
      <slot name="actions" />
    </v-col>
  </v-row>
</template>