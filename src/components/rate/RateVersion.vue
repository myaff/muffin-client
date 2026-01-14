<script setup lang="ts">
import { RateVersion } from '@/models/rates.model';
import { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  rateVersion: {
    type: Object as PropType<RateVersion>,
    required: true,
  },
})
const { t } = useI18n();
</script>

<template>
  <div class="rate-version">
    <div class="text-h5">
      {{ t('rates.item') }}
    </div>
    <div class="text-body-1">

    </div>
  </div>
</template>