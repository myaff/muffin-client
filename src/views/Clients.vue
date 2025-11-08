<script setup lang="ts">
import { type ClientCreate } from '@/models/clients.model';
import { UiAlert } from '@/models/ui.model';
import { watchEffect } from 'vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import ClientCreateForm from '@/components/ClientCreate.vue';
import { useClientsStore } from '@/store/clients';
import { computed } from 'vue';

const { t } = useI18n();
const route = useRoute();
const clientsStore = useClientsStore();
const list = computed(() => clientsStore.list);
const isLoading = ref(false);
const loadingError = ref<UiAlert | null>(null);

const fetchList = async () => {
  isLoading.value = true;
  clientsStore.fetchList()
    .catch(e => loadingError.value = getErrorOrDefault(e))
    .finally(() => isLoading.value = false);
}
watchEffect(() => {
  console.log(route);
  fetchList();
});

// creation
const isSending = ref(false);
const sendingError = ref<UiAlert | null>(null);
const creationIsOpen = ref(false);
const create = (formData: ClientCreate) => {
  isSending.value = true;
  clientsStore.create(formData)
    .catch(e => sendingError.value = getErrorOrDefault(e))
    .finally(() => creationIsOpen.value = false);
}
const cancel = () => {
  creationIsOpen.value = false;
}
const getErrorOrDefault = (e: any) => {
  return {
    title: e?.title ?? t('error.unknown.title'),
    message: e?.message || e?.errorMessage || t('error.unknown.message'),
  };
}
</script>

<template>
  <div class="page w-100 align-center justify-center">
    <v-row v-if="!isLoading && list.length">
      <v-col v-for="item in list" :key="item.id" cols="4">
        <v-card :title="item.name" />
      </v-col>
      <v-btn icon="mdi-plus" size="x-large" color="primary" class="add-btn" @click="creationIsOpen = true" />
    </v-row>
    <v-layout v-else full-height class="align-center justify-center">
      <v-progress-circular v-if="isLoading" indeterminate />
      <v-alert v-else-if="loadingError" :title="loadingError?.title" :text="loadingError.message" type="error" max-width="640" />
      <v-alert v-else :title="t('clients.empty')" max-width="640">
        <v-btn color="primary" size="large" class="mt-4" @click="creationIsOpen = true">
          {{ t('clients.add') }}
        </v-btn>
      </v-alert>
    </v-layout>
    <v-dialog v-model="creationIsOpen" width="640">
      <template v-if="!sendingError">
        <client-create-form @cancel="cancel" @submit="create" />
        <v-overlay v-model="isSending" contained class="align-center justify-center">
          <v-progress-circular indeterminate />
        </v-overlay>
      </template>
      <v-alert v-else :title="sendingError?.title" :text="sendingError?.message" type="error" />
    </v-dialog>
  </div>
</template>
