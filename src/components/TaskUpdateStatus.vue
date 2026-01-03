<script setup lang="ts">
import { reactive, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { Status, StatusGroup, StatusGroupColor } from '@/models/status.model';
import { Task } from '@/models/tasks.model';

const props = defineProps({
  task: {
    type: Object as PropType<Task>,
    required: true,
  },
  list: {
    type: Object as PropType<{ [key in StatusGroup]?: { title: string; statuses: Status[] } }>,
    default: () => ({}),
  },
})
const { t } = useI18n();
// form
const formInitialData = {
  task: props.task,
  status: props.task.status.id,
};
const formData = reactive(formInitialData);
const rules = {
  status: { required },
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
  <v-card :title="t('tasks.updateStatus')">
    <v-card-item>
      <v-form @keyup.enter="submit">
        <v-radio-group
          v-model="formData.status"
          :error-messages="$v.status.$errors.map(e => e.$message as string)"
          @blur="$v.status.$touch">
          <v-row>
            <v-col
              v-for="(column, group) in list"
              :key="group"
              :cols="12 / Object.keys(list).length">
              <v-chip :color="StatusGroupColor[group]" class="mb-3">
                {{ column!.title }}
              </v-chip>
              <v-radio
                v-for="item in column!.statuses"
                :key="item.id"
                :label="item.title"
                :value="item.id"
                :color="StatusGroupColor[item.group]" />
            </v-col>
          </v-row>

        </v-radio-group>
      </v-form>
    </v-card-item>
    <v-card-actions class="px-6 pb-6">
      <v-spacer />
      <v-btn @click="cancel">
        {{ t('btn.cancel') }}
      </v-btn>
      <v-btn color="primary" variant="flat" @click="submit">
        {{ t('btn.submit') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>