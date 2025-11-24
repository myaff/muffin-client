<script lang="ts" setup>
import { onMounted } from 'vue';
import { useAppStore } from './store/app';

const appStore = useAppStore();
onMounted(async () => {
  await Promise.all([
    appStore.fetchCountries(),
    appStore.fetchCurrencies(),
  ]);
})
</script>

<template>
  <router-view />
</template>

