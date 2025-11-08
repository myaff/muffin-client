<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
const { t, locale, availableLocales } = useI18n();
const locales = computed(() => availableLocales.map(item => ({
  value: item,
  title: t(`locale.${item}`)
})));
</script>

<template>
  <v-app>
    <div class="lang-select">
      <v-select v-model="locale" :items="locales" variant="plain" />
    </div>
    <v-container class="my-auto">
      <v-sheet rounded max-width="600" class="ma-auto py-10 px-12">
        <RouterView />
      </v-sheet>
    </v-container>
  </v-app>
</template>

<style lang="scss" scoped>
.lang-select {
  position: absolute;
  top: 20px;
  right: 40px;
}
</style>