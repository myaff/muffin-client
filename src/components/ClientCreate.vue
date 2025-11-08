<script setup lang="ts">
import { useAppStore } from '@/store/app';
import { reactive } from 'vue';
import { watchEffect } from 'vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { ClientType } from '@/models/clients.model';

const { t } = useI18n();
const appStore = useAppStore();
const orgforms = computed(() => appStore.orgforms);
watchEffect(() => {
  if (!orgforms.value.length) appStore.fetchOrgforms();
})
// form
const formInitialData = {
  name: '',
  type: ClientType.PERSON,
  orgform: null as string | number | null,
};
const formData = reactive(formInitialData);
const orgformsByType = computed(() => {
  return orgforms.value
    .filter(f => formData.type === ClientType.PERSON 
      ? f.id < 10000 || f.id >= 50000 
      : f.id >= 10000 && f.id < 50000);
})
watchEffect(() => {
  formData.orgform = formData.type === ClientType.PERSON ? 0 : null;
});
const rules = {
  name: { required },
  type: { required },
  orgform: { required },
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
        <v-radio-group
          v-model="formData.type"
          inline
          :label="t('clients.fields.type')">
          <v-radio
            v-for="item in Object.values(ClientType)"
            :key="item"
            :value="item"
            :label="t(`clients.type.${item}`)"
            class="mr-4" />
        </v-radio-group>
        <v-select
          v-if="orgforms.length"
          v-model="formData.orgform"
          :items="orgformsByType"
          :label="t('clients.fields.form')"
          item-title="name"
          item-value="id" />
      </v-form>
    </v-card-item>
    <v-card-actions class="px-6 pb-6">
      <v-spacer />
      <v-btn @click="cancel">{{ t('btn.cancel') }}</v-btn>
      <v-btn color="primary" variant="flat" @click="submit">{{ t('btn.submit') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>