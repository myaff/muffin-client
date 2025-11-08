<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useProjectsStore } from '@/store/projects';
import { useAppStore } from '@/store/app';
import { StatusGroupColor } from '@/models/status.model';

const { t } = useI18n();
const projectsStrore = useProjectsStore();
const appStore = useAppStore();
const projects = computed(() => projectsStrore.list);
const statuses = computed(() => appStore.statuses);
onMounted(() => {
  if (!projects.value.length) projectsStrore.fetchList();
  if (!statuses.value.length) appStore.fetchStatuses();
});
// form
const formInitialData = {
  title: '',
  code: '',
  url: '',
  project: null,
  status: null as number | null,
};
const formData = reactive(formInitialData);
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
  if (isValid) emits('submit', formData);
}
const cancel = () => {
  emits('cancel');
}
</script>

<template>
  <v-card :title="t('tasks.create')">
    <v-card-item>
      <v-form @keyup.enter="submit">
        <v-text-field
          v-model="formData.title"
          type="text"
          class="mb-4"
          :label="t('tasks.fields.title')"
          :error-messages="$v.title.$errors.map(e => e.$message as string)"
          @blur="$v.title.$touch" />
        <v-text-field
          v-model="formData.code"
          type="text"
          class="mb-4"
          :label="t('tasks.fields.code')"
          :error-messages="$v.code.$errors.map(e => e.$message as string)"
          @blur="$v.code.$touch" />
        <v-text-field
          v-model="formData.url"
          type="text"
          class="mb-4"
          :label="t('tasks.fields.url')" />
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
          :label="t('tasks.fields.status')"
          item-title="title"
          item-value="id"
          :item-props="item => ({ ...item, title: item.title.toUpperCase() })"
          :error-messages="$v.status.$errors.map(e => e.$message as string)"
          @blur="$v.status.$touch">
          <template #selection="{ item }">
            <v-chip :color="StatusGroupColor[item.raw.group]">
              {{ item.title }}
            </v-chip>
          </template>
          <template #item="{ props, item }">
            <v-list-item v-bind="{...props, title: ''}">
              <v-chip :color="StatusGroupColor[item.raw.group]">
                {{ item.title }}
              </v-chip>
            </v-list-item>
          </template>
        </v-select>
      </v-form>
    </v-card-item>
    <v-card-actions class="px-6 pb-6">
      <v-spacer />
      <v-btn @click="cancel">{{ t('btn.cancel') }}</v-btn>
      <v-btn color="primary" variant="flat" @click="submit">{{ t('btn.submit') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>