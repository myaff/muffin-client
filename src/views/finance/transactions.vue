<script setup lang="ts">
import TransactionList from '@/components/finance/TransactionList.vue';
import TransactionsFilter from '@/components/finance/TransactionsFilter.vue';
import { FilterParams } from '@/models/common.model';
import { ref } from 'vue';
const PAGE_SIZE = 20;
const filter = ref<FilterParams>({});

const listRef = ref<InstanceType<typeof TransactionList> | null>(null);
const add = () => {
  if (listRef.value) listRef.value.openCreation();
}
const updateFilter = (value: FilterParams) => {
  filter.value = value;
}
</script>

<template>
  <div class="page w-100">
    <v-row>
      <v-col cols="12" md="4">
        <TransactionsFilter @update="updateFilter" />
      </v-col>
      <v-col cols="12" md="8">
        <TransactionList
          ref="listRef"
          :page-size="PAGE_SIZE"
          :filter="filter" />
      </v-col>
    </v-row>
    <v-fab
      icon="mdi-plus"
      app
      location="right bottom"
      color="primary"
      size="x-large"
      @click="add" />
  </div>
</template>