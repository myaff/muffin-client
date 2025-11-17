<script setup lang="ts">
import { useAppStore } from '@/store/app';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';

const { t } = useI18n();
const appStore = useAppStore();
// form
const formInitialData = {
  name: '',
};
const formData = reactive(formInitialData);
const rules = {
  name: { required },
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
  <v-card :title="t('clients.create')">
    <v-card-item>
      <v-form @keyup.enter="submit">
        <v-text-field
          v-model="formData.name"
          type="text"
          class="mb-4"
          :label="t('clients.fields.name')"
          :error-messages="$v.name.$errors.map(e => e.$message as string)"
          @blur="$v.name.$touch" />
      </v-form>
    </v-card-item>
    <v-card-actions class="px-6 pb-6">
      <v-spacer />
      <v-btn @click="cancel">{{ t('btn.cancel') }}</v-btn>
      <v-btn color="primary" variant="flat" @click="submit">{{ t('btn.submit') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>