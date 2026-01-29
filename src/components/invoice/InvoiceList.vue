<script setup lang="ts">
import useCreateUpdate from '@/composables/useCreateUpdate';
import useError from '@/composables/useError';
import { UiAlert, UiTableHeaderCell } from '@/models/ui.model';
import { computed, PropType, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import useDelete from '@/composables/useDelete';
import DeletionDialog from '../DeletionDialog.vue';
import useListStore from '@/composables/useListStore';
import { FetchListParams, FilterParams, SortParams } from '@/models/common.model';
import { useInvoicesStore } from '@/store/invoices';
import { Invoice, InvoiceCreate, InvoiceStatus, InvoiceUpdate } from '@/models/invoice.model';
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
  page,
  totalCount,
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

// table
const tableHeaders: UiTableHeaderCell[] = [
  {
    key: 'client',
    title: t('clients.item'),
  },
  {
    key: 'total',
    title: t('invoice.sum'),
    width: '160',
    align: 'end',
  },
  {
    key: 'range',
    title: t('date.range'),
    width: '200',
  },
  {
    key: 'issuedDate',
    title: t('invoice.fields.issuedDateShort'),
    width: '100',
  },
  {
    key: 'dueDate',
    title: t('invoice.fields.dueDateShort'),
    width: '150',
  },
  {
    key: 'paidDate',
    title: t('invoice.fields.paidDateShort'),
    width: '100',
  },
  {
    key: 'status',
    title: t('invoice.fields.status'),
    align: 'center',
  },
  {
    key: 'actions',
    sortable: false,
    width: '120',
  },
];

// status
const statuses = Object.values(InvoiceStatus).map(key => ({
  title: t(`invoice.status.${key}`),
  value: key,
}));
const statusColor = {
  [InvoiceStatus.DRAFT]: 'default',
  [InvoiceStatus.SENT]: 'warning',
  [InvoiceStatus.PARTLY_PAID]: 'light-green',
  [InvoiceStatus.PAID]: 'success',
};
const updateStatus = (value: InvoiceStatus) => {
  console.log('updateStatus', value);
}
</script>

<template>
  <div class="transaction-list pb-4">
    <v-data-table-server
      :headers="tableHeaders"
      :items="list"
      :items-length="totalCount"
      :loading="isLoading">
      <template #item="{ item }">
        <tr>
          <td>{{ item.client.name }}</td>
          <td class="text-right">
            {{ n(item.total, { key: 'currency', currency: item.currency.id }) }}
          </td>
          <td>
            {{ d(item.startDate, 'short') + ' - ' + d(item.endDate, 'short') }}
          </td>
          <td>
            {{ d(item.issuedDate, 'short') }}
          </td>
          <td>
            {{ d(item.dueDate, 'short') }}
          </td>
          <td>
            {{ item.paidDate ? d(item.paidDate, 'short') : '-' }}
          </td>
          <td>
            <v-select
              v-if="statuses.length"
              :model-value="item.status"
              :items="statuses"
              item-title="title"
              item-value="value"
              :bg-color="statusColor[item.status]"
              variant="solo"
              density="compact"
              flat
              hide-details
              :item-props="item => ({ ...item, title: item.title.toUpperCase() })"
              @update:model-value="updateStatus">
              <template #selection="{ item }">
                <v-chip :color="statusColor[item.value as InvoiceStatus]">
                  {{ item.title }}
                </v-chip>
              </template>
              <template #item="{ props, item }">
                <v-list-item v-bind="{...props, title: ''}">
                  <v-chip :color="statusColor[item.value as InvoiceStatus]">
                    {{ item.title }}
                  </v-chip>
                </v-list-item>
              </template>
            </v-select>
          </td>
          <td>
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="plain"
              @click="openEdition(item)" />
            <v-btn
              icon="mdi-trash-can-outline"
              size="small"
              class="ml-1"
              variant="plain"
              color="error"
              :disabled="isDeleting || item.status !== InvoiceStatus.DRAFT"
              :loading="isDeleting && entityToDelete === item.id"
              @click="openDeletion(item.id)" />
          </td>
        </tr>
      </template>
    </v-data-table-server>
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