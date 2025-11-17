<script setup lang="ts">
import { reactive, ref, watchEffect, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useRatesStore } from '@/store/rates';
import { useClientsStore } from '@/store/clients';
import { UiAlert } from '@/models/ui.model';
import { RateCreate } from '@/models/rates.model';
import RateCreateForm from './RateCreate.vue';
import useError from '@/composables/useError';
import useRate from '@/composables/useRate';

const { t, n, d } = useI18n();
const ratesStore = useRatesStore();
const clientsStore = useClientsStore();
const rates = computed(() => ratesStore.list);
const clients = computed(() => clientsStore.list);
watchEffect(() => {
  if (!rates.value.length) ratesStore.fetchList();
  if (!clients.value.length) clientsStore.fetchList();
});
// form
const formInitialData = {
  title: '',
  url: '',
  client: null,
  rates: [],
};
const formData = reactive(formInitialData);
const rules = {
  title: { required },
  client: { required },
};
const $v = useVuelidate(rules, formData);
const emits = defineEmits(['submit', 'cancel']);
const submit = async () => {
  const isValid = await $v.value.$validate();
  if (isValid) {
    emits('submit', {
      title: formData.title,
      url: formData.url,
      client: formData.client,
      rates: formData.rates.map(rate => ({ id: rate })),
    });
  }
}
const cancel = () => {
  emits('cancel');
}

// rate creation
const isSending = ref(false);
const sendingError = ref<UiAlert | null>(null);
const creationIsOpen = ref(false);
const create = (formData: RateCreate) => {
  isSending.value = true;
  ratesStore.create(formData)
    .catch(e => sendingError.value = useError(e, t))
    .finally(() => {
      creationIsOpen.value = false;
      isSending.value = false;
    });
}
const close = () => {
  creationIsOpen.value = false;
}
const { formatRateForSelect } = useRate({ t, n, d });
</script>

<template>
  <v-card :title="t('projects.create')">
    <v-card-item>
      <v-form @keyup.enter="submit">
        <v-text-field
          v-model="formData.title"
          type="text"
          class="mb-4"
          :label="t('projects.fields.title')"
          :error-messages="$v.title.$errors.map(e => e.$message as string)"
          @blur="$v.title.$touch" />
        <v-text-field
          v-model="formData.url"
          type="text"
          class="mb-4"
          :label="t('projects.fields.url')" />
        <v-select
          v-if="clients.length"
          v-model="formData.client"
          :items="clients"
          :label="t('projects.fields.client')"
          item-title="name"
          item-value="id"
          :error-messages="$v.client.$errors.map(e => e.$message as string)"
          @blur="$v.client.$touch" />
        <v-select
          v-model="formData.rates"
          :items="rates"
          :label="t('projects.fields.rate')"
          :item-props="item => formatRateForSelect(item)"
          item-value="id"
          multiple>
          <template #append>
            <v-btn elevation="0" variant="plain" icon="mdi-plus" @click="creationIsOpen = true" />
          </template>
        </v-select>
        <v-dialog v-model="creationIsOpen" width="640">
          <template v-if="!sendingError">
            <rate-create-form @cancel="close" @submit="create" />
            <v-overlay v-model="isSending" contained class="align-center justify-center">
              <v-progress-circular indeterminate />
            </v-overlay>
          </template>
          <v-alert v-else :title="sendingError?.title" :text="sendingError?.message" type="error" />
        </v-dialog>
      </v-form>
    </v-card-item>
    <v-card-actions class="px-6 pb-6">
      <v-spacer />
      <v-btn @click="cancel">{{ t('btn.cancel') }}</v-btn>
      <v-btn color="primary" variant="flat" @click="submit">{{ t('btn.submit') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>