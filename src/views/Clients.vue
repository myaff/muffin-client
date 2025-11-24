<script setup lang="ts">
import { Client, ClientUpdate, type ClientCreate } from '@/models/clients.model';
import { UiAlert } from '@/models/ui.model';
import { watchEffect, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import ClientCreateUpdateForm from '@/components/ClientCreateUpdate.vue';
import { useClientsStore } from '@/store/clients';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
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
const clientToEdit = ref<Client | null>(null);
const create = (formData: ClientCreate) => {
  isSending.value = true;
  clientsStore.create(formData)
    .catch(e => sendingError.value = getErrorOrDefault(e))
    .finally(() => {
      isSending.value = false;
      creationIsOpen.value = false;
    });
}
const update = (formData: ClientUpdate) => {
  if (!clientToEdit.value) return;
  isSending.value = true;
  clientsStore.update(clientToEdit.value.id, formData)
    .then(() => fetchList())
    .catch(e => sendingError.value = getErrorOrDefault(e))
    .finally(() => {
      isSending.value = false;
      creationIsOpen.value = false;
      clientToEdit.value = null;
    })
}
const cancel = () => {
  creationIsOpen.value = false;
  if (clientToEdit.value) clientToEdit.value = null;
}
watch(creationIsOpen, value => {
  if (!value) cancel();
})
const getErrorOrDefault = (e: any) => {
  return {
    title: e?.title ?? t('error.unknown.title'),
    message: e?.message || e?.errorMessage || t('error.unknown.message'),
  };
}

const detailIsOpen = ref(false);
if (route.params?.id) detailIsOpen.value = true;
watch(detailIsOpen, value => {
  if (!value) router.push({ name: 'clients' });
});
watch(route, async value => {
  detailIsOpen.value = !!value.params.id;
});
function openDetail(item: Client) {
  router.push({
    name: 'client',
    params: { id: item.id },
  });
  detailIsOpen.value = true;
}
const onClientEdit = (client: Client) => {
  clientToEdit.value = client;
  creationIsOpen.value = true;
}
</script>

<template>
  <div class="page w-100 align-center justify-center">
    <v-row v-if="!isLoading && list.length">
      <v-col v-for="item in list" :key="item.id" cols="4">
        <v-card :title="item.name" @click="openDetail(item)" />
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
    <v-dialog v-model="creationIsOpen" width="90vw" max-width="1280">
      <template v-if="!sendingError">
        <client-create-update-form
          :client="clientToEdit"
          @cancel="cancel"
          @submit="e => !!clientToEdit ? update(e) : create(e)" />
        <v-overlay v-model="isSending" contained class="align-center justify-center">
          <v-progress-circular indeterminate />
        </v-overlay>
      </template>
      <v-alert v-else :title="sendingError?.title" :text="sendingError?.message" type="error" />
    </v-dialog>
    <v-dialog v-model="detailIsOpen" width="90vw" max-width="1280">
      <router-view @edit="onClientEdit" />
      <v-btn v-if="detailIsOpen"
        icon="mdi-close"
        variant="plain"
        class="close-dialog"
        @click="detailIsOpen = false" />
    </v-dialog>
  </div>
</template>
