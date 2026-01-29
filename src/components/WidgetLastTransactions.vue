<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import TransactionList from '@/components/finance/TransactionList.vue';
import { PropType, ref } from 'vue';
import { FilterParams } from '@/models/common.model';
const props = defineProps({
  page: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  filter: {
    type: Object as PropType<FilterParams>,
    default: () => ({}),
  },
})
const isEmptyList = ref(true);
const { t } = useI18n();
const onListUpdate = (len: number) => {
  isEmptyList.value = len === 0;
}
const listRef = ref<InstanceType<typeof TransactionList> | null>(null);
const add = () => {
  if (listRef.value) listRef.value.openCreation();
}
</script>

<template>
  <v-card :title="t('transaction.last')" class="h-100">
    <template v-if="!isEmptyList" #append>
      <v-btn icon="mdi-plus" flat @click="add" />
    </template>
    <TransactionList
      ref="listRef"
      :page="page"
      :page-size="pageSize"
      :filter="filter"
      @update:length="onListUpdate" />
  </v-card>
</template>