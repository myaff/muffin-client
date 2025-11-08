<script setup lang="ts">
import { RateDetail } from '@/models/rates.model';
import { isBefore } from 'date-fns';
import { PropType, computed } from 'vue';
import { useI18n } from 'vue-i18n';
const { t, n, d } = useI18n();
const props = defineProps({
  rates: {
    type: Array as PropType<RateDetail[]>,
    default: () => [],
  },
  enableAdd: {
    type: Boolean,
    default: false,
  },
});
defineEmits(['add']);
const list = computed(() => {
  return props.rates.toReversed().map((rate, i) => {
    return {
      ...rate,
      currencyOptions: { key: 'currency', currency: rate.currency.id },
      dates: `${d(rate.dateFrom)} - ${rate.dateTo ? d(rate.dateTo) : '...'}`,
      isCurrent: i === 0 && (!rate.dateTo || isBefore(new Date(), new Date(rate.dateTo)))
    };
  })
})
</script>

<template>
  <div class="rates">
    <p class="text-h5 mb-6">{{ t('rates.items') }}</p>
    <template v-if="enableAdd">
      <v-btn
        icon="mdi-plus"
        color="primary"
        size="small"
        @click="$emit('add')" />
      <span class="text-body-1 text-medium-emphasis ml-4">
        {{ t('btn.add') }}
      </span>
    </template>
    <v-timeline v-if="list.length" side="end" density="compact" class="pl-1">
      <v-timeline-item
        v-for="rate in list"
        :key="rate.id"
        :dot-color="rate.isCurrent ? 'success' : undefined"
        size="small">
        <div class="text-h6">
          {{ n(rate.value, { key: 'currency', currency: rate.currency.id }) }}
          <span class="text-caption text-medium-emphasis">
            {{ t(`rates.types.${rate.type}.per`) }}
          </span>
        </div>
        <p class="text-body-1 text-medium-emphasis">
          {{ rate.dates }}
        </p>
      </v-timeline-item>
    </v-timeline>
    <p v-else class="text-body-1 text-medium-emphasis">
      {{ t('rates.empty') }}
    </p>
  </div>
</template>