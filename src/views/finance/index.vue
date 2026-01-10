<script setup lang="ts">
import BankAccountCarousel from '@/components/finance/BankAccountCarousel.vue';
import WidgetLastTransactions from '@/components/WidgetLastTransactions.vue';
</script>

<template>
  <div class="page w-100">
    <bank-account-carousel />
    <v-row class="mt-8">
      <v-col cols="12" md="6">
        <widget-last-transactions />
      </v-col>
      <v-col cols="12" md="6"></v-col>
    </v-row>
  </div>
</template>