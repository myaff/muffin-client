<script setup lang="ts">
import { Bank } from '@/models/bank.model';
import { computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  bank: {
    type: Object as PropType<Bank>,
    required: true,
  },
})
const { t } = useI18n();
const shownAddress = computed(() => {
  return props.bank?.branchAddress
    || props.bank?.operationalAddress
    || props.bank.registeredAddress;
})
</script>

<template>
  <div class="widget-bank">
    <p class="text-h6">
      {{ bank.name }}
    </p>
    <p class="text-body-1 text-medium-emphasis">
      {{ t('bank.fields.bic') }}: {{ bank.bic11 }}
    </p>
    <p class="text-body-1">
      <span class="noto-emoji">
        {{ bank.country.emoji }}
      </span>
      {{ shownAddress }}
    </p>
  </div>
</template>