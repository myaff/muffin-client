<script setup lang="ts">

import InvoiceList from '@/components/invoice/InvoiceList.vue';
import { FilterParams } from '@/models/common.model';
import { ref } from 'vue';
const PAGE_SIZE = 20;
const filter = ref<FilterParams>({});

const listRef = ref<InstanceType<typeof InvoiceList> | null>(null);
const add = () => {
  if (listRef.value) listRef.value.openCreation();
}
const updateFilter = (value: FilterParams) => {
  filter.value = value;
}
</script>

<template>
  <div class="page w-100">
    <InvoiceList
      ref="listRef"
      :page-size="PAGE_SIZE"
      :filter="filter" />
    <v-fab
      icon="mdi-plus"
      app
      location="right bottom"
      color="primary"
      size="x-large"
      @click="add" />
  </div>
</template>