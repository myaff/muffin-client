<script setup lang="ts">
import useCreateUpdate from '@/composables/useCreateUpdate';
import useError from '@/composables/useError';
import { UiAlert } from '@/models/ui.model';
import { computed, PropType, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import useDelete from '@/composables/useDelete';
import DeletionDialog from '../DeletionDialog.vue';
import useListStore from '@/composables/useListStore';
import { FetchListParams, FilterParams, SortParams } from '@/models/common.model';
import { useInvoicesStore } from '@/store/invoices';
import { Invoice, InvoiceCreate, InvoiceUpdate } from '@/models/invoice.model';
import InvoiceCreateUpdate from './InvoiceCreateUpdate.vue';

const props = defineProps({
  page: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  sort: {
    type: Object as PropType<SortParams>,
    default: () => ({ sortBy: 'date', order: 'desc' }),
  },
  filter: {
    type: Object as PropType<FilterParams>,
    default: () => ({}),
  },
})
const emits = defineEmits(['update:length']);
const invoicesStore = useInvoicesStore();
const {
  list,
  isLoading,
  fetchList,
  paginationQuery,
  pagesCount,
  setPage,
} = useListStore(invoicesStore.service, { page: props.page, pageSize: props.pageSize });
const requestParams = computed<FetchListParams>(() => ({
  ...props.filter,
  ...props.sort,
  ...paginationQuery.value,
}))
const { t, n, d } = useI18n();
const listMapped = computed(() => {
  return list.value;
});
watch(() => listMapped.value.length, value => {
  emits('update:length', value);
})
const loadingError = ref<UiAlert | null>(null);
async function fetchListInternal(params: FetchListParams) {
  fetchList(params)
    .catch(e => loadingError.value = useError(e, t));
}
watchEffect(async () => {
  await fetchListInternal(requestParams.value);
})
const {
  isSending,
  sendingError,
  creationIsOpen,
  entityToEdit,
  openCreation,
  openEdition,
  create,
  update,
  cancel,
} = useCreateUpdate<Invoice, InvoiceCreate, InvoiceUpdate>({
  store: invoicesStore,
  onError: (e) => useError(e, t),
});
const {
  isDeleting,
  entityToDelete,
  deletionIsOpen,
  openDeletion,
  doDelete,
  cancel: cancelDeletion,
} = useDelete({
  store: invoicesStore,
  onError: (e) => useError(e, t),
});
invoicesStore.$onAction(({ after }) => {
  after(() => fetchListInternal(requestParams.value));
})

defineExpose({ openCreation });
</script>

<template>
  <div class="transaction-list pb-4">
    <v-list v-if="listMapped.length">
      <v-list-item v-for="item in listMapped" :key="item.id">
        <v-list-item-title>
          {{ item.client.name }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ `${d(item.startDate, 'short')} - ${d(item.endDate, 'short')}` }}
        </v-list-item-subtitle>
        <template #append>
          <p class="text-h6">
            {{ n(item.total, { key: 'currency', currency: item.currency.id }) }}
          </p>
          <v-btn
            icon="mdi-pencil"
            size="small"
            class="ml-3"
            variant="plain"
            @click="openEdition(item)" />
          <v-btn
            icon="mdi-trash-can-outline"
            size="small"
            class="ml-1"
            variant="plain"
            color="error"
            :disabled="isDeleting"
            :loading="isDeleting && entityToDelete === item.id"
            @click="openDeletion(item.id)" />
        </template>
      </v-list-item>
    </v-list>
    <v-alert v-else variant="text" max-width="640">
      <p class="text-body-1 text-medium-emphasis">
        {{ t('invoice.empty') }}
      </p>
      <v-btn color="primary" size="large" class="mt-6" @click="openCreation">
        {{ t('invoice.create') }}
      </v-btn>
    </v-alert>
    <v-pagination v-if="pagesCount > 1" :length="pagesCount" @update:model-value="setPage" />
    <v-dialog v-model="creationIsOpen" width="90vw" max-width="1280">
      <template v-if="!sendingError">
        <InvoiceCreateUpdate
          :invoice="entityToEdit"
          @cancel="cancel"
          @submit="(e) => !!entityToEdit ? update(e) : create(e)" />
        <v-overlay v-model="isSending" contained class="align-center justify-center">
          <v-progress-circular indeterminate />
        </v-overlay>
      </template>
      <v-alert v-else :title="sendingError?.title" :text="sendingError?.message" type="error" />
      <v-btn
        v-if="creationIsOpen && !isSending"
        icon="mdi-close"
        class="close-dialog"
        variant="plain"
        @click="cancel" />
    </v-dialog>
    <DeletionDialog
      v-model="deletionIsOpen"
      @confirm="entityToDelete ? doDelete(entityToDelete) : undefined"
      @cancel="cancelDeletion" />
  </div>
</template>