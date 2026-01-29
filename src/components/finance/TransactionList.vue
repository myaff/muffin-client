<script setup lang="ts">
import useCreateUpdate from '@/composables/useCreateUpdate';
import useError from '@/composables/useError';
import { Transaction, TransactionCreate, TransactionType, TransactionUpdate } from '@/models/transaction.model';
import { UiAlert } from '@/models/ui.model';
import { useTransactionsStore } from '@/store/transactions';
import { computed, onMounted, PropType, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import TransactionCreateUpdate from '@/components/finance/TransactionCreateUpdate.vue';
import useDelete from '@/composables/useDelete';
import DeletionDialog from '../DeletionDialog.vue';
import useListStore from '@/composables/useListStore';
import { FetchListParams, FilterParams, SortParams } from '@/models/common.model';

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
const transactionsStore = useTransactionsStore();
const {
  list,
  isLoading,
  fetchList,
  paginationQuery,
  pagesCount,
  setPage,
} = useListStore(transactionsStore.service, { page: props.page, pageSize: props.pageSize });
const requestParams = computed<FetchListParams>(() => ({
  ...props.filter,
  ...props.sort,
  ...paginationQuery.value,
}))
const { t, n, d } = useI18n();
const listMapped = computed(() => {
  return list.value.map(item => {
    const isExpense = item.type === TransactionType.EXPENSE;
    return {
      ...item,
      title: item.categories?.length
        ? item.categories.map(c => c.name).join(', ')
        : t('transactionCategory.uncategorized'),
      subtitle: `${d(item.date, 'short')}, ${item.bankAccount.name}`,
      shownAmount: isExpense ? item.amount * -1 : item.amount,
      color: isExpense ? 'red' : 'green',
    }
  });
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
} = useCreateUpdate<Transaction, TransactionCreate, TransactionUpdate>({
  store: transactionsStore,
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
  store: transactionsStore,
  onError: (e) => useError(e, t),
});
transactionsStore.$onAction(({ after }) => {
  after(() => fetchListInternal(requestParams.value));
})

defineExpose({ openCreation });
</script>

<template>
  <div class="transaction-list pb-4">
    <v-list v-if="listMapped.length">
      <v-list-item v-for="item in listMapped" :key="item.id">
        <v-list-item-title>
          {{ item.title }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ item.subtitle }}
        </v-list-item-subtitle>
        <template #append>
          <p class="text-h6" :class="`text-${item.color}`">
            {{ n(item.shownAmount, { key: 'currency', currency: item.bankAccount.currency.id }) }}
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
            color="red-darken-1"
            :disabled="isDeleting"
            :loading="isDeleting && entityToDelete === item.id"
            @click="openDeletion(item.id)" />
        </template>
      </v-list-item>
    </v-list>
    <v-alert v-else variant="text" max-width="640">
      <p class="text-body-1 text-medium-emphasis">
        {{ t('transaction.empty') }}
      </p>
      <v-btn color="primary" size="large" class="mt-6" @click="openCreation">
        {{ t('transaction.create') }}
      </v-btn>
    </v-alert>
    <v-pagination v-if="pagesCount > 1" :length="pagesCount" @update:model-value="setPage" />
    <v-dialog v-model="creationIsOpen" width="90vw" max-width="640">
      <template v-if="!sendingError">
        <TransactionCreateUpdate
          :transaction="entityToEdit"
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