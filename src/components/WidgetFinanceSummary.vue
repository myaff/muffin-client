<script setup lang="ts">
import { useBankAccountsStore } from '@/store/bankAccounts';
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const bankAccountsStore = useBankAccountsStore();
const list = computed(() => bankAccountsStore.list);
const summary = computed(() => {
  return list.value.reduce((acc, item) => {
    acc.set(item.currency.id, (acc.get(item.currency.id) ?? 0) + item.balance);
    return acc;
  }, new Map<string, number>());
})
const { n } = useI18n();
onMounted(() => {
  if (!bankAccountsStore.isLoading) bankAccountsStore.fetchList();
})
</script>

<template>
  <v-card>
    <v-list>
      <v-list-item v-for="[currency, sum] in summary" :key="currency">
        <p class="text-h4">
          {{ n(sum, { key: 'currency', currency }) }}
        </p>
      </v-list-item>
    </v-list>
  </v-card>
</template>