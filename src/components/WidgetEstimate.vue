<script setup lang="ts">
import { Estimatable } from '@/models/common.model';
import { isNumber } from 'lodash-es';
import { computed } from 'vue';
import { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  entity: {
    type: Object as PropType<Estimatable>,
    required: true,
  },
})
const valueMin = computed(() => {
  return isNumber(props.entity?.estimate?.min)
  ? props.entity.estimate?.min
  : props.entity.estimate?.max;
});
const valueMax = computed(() => {
  return isNumber(props.entity.estimate?.max)
    ? props.entity.estimate.max
    : props.entity.estimate?.min;
});
const formatted = computed(() => {
  if (!isNumber(valueMin.value) && !isNumber(valueMax.value)) {
    return t('estimation.undefined');
  }
  if (valueMin.value === valueMax.value) {
    return t('tracking.hours', valueMax.value ?? 0);
  }
  return `${valueMin.value}&nbsp;&mdash;&nbsp;${t('tracking.hours', valueMax.value ?? 0)}`;
})
const { t } = useI18n();
</script>

<template>
  <div class="widget-estimate text-body-1 pa-1">
    <span class="text-medium-emphasis mr-2">
      {{ t('estimation.title') }}:
    </span>
    <span v-html="formatted"></span>
  </div>
</template>