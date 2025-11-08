<script setup lang="ts">
import { PropType, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, n } = useI18n();
const props = defineProps({
  hours: {
    type: Number,
    default: 0,
  },
  money: {
    type: Object as PropType<{ [key: string]: number }>,
    default: () => {},
  }
});
const moneyStr = computed(() => {
  return Object.keys(props.money)
    .map(key => n(props.money[key], { key: 'currency', currency: key }))
    .join(' + ')
});
</script>

<template>
  <div class="tracking-summary d-flex">
    <div class="mr-4">
      {{ t('tracking.total') }}:
    </div>
    <div class="px-4">
      {{ t('tracking.hours', { n: hours }) + (moneyStr ? ', ' : '') }}
    </div>
    <div v-if="moneyStr" class="px-4">
      {{ moneyStr }}
    </div>
  </div>
</template>