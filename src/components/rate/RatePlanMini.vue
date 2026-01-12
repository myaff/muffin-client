<script setup lang="ts">
import { getRateVersionByDate } from '@/helpers/rate.helper';
import { RatePlanFull, RateType, RateVersion } from '@/models/rates.model';
import { PropType, computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import RatePlanDetail from './RatePlanDetail.vue';

const props = defineProps({
  item: {
    type: Object as PropType<RatePlanFull>,
    required: true,
  },
})
const { t, n, d } = useI18n();
const currentVersion = computed(() => getRateVersionByDate(props.item, new Date()));
const currencyOptions = computed(() => ({
  key: 'currency',
  currency: props.item.currency.id,
}));
const getVersionTitle = (version: Pick<RateVersion, 'amount' | 'recurringCount'>) => {
  const sum = n(version.amount, currencyOptions.value);
  const units = props.item.type === RateType.RECURRING
    ? t(`rates.recurringUnit.${props.item.recurringUnit}.count`, version.recurringCount)
    : '';
  const per = t(`rates.types.${props.item.type}.per`, units);
  return sum + ' ' + per;
}
const getVersionDates = (version: Pick<RateVersion, 'startDate' | 'endDate'>) => {
  const from = d(version.startDate, 'short');
  const to = version?.endDate ? d(version.endDate, 'short') : '...';
  return `${from} — ${to}`;
}
// detail
const detailIsOpen = ref(false);
const openDetails = () => {
  detailIsOpen.value = true;
}
const closeDetails = () => {
  detailIsOpen.value = false;
}
</script>

<template>
  <v-card class="rate-plan-mini" variant="outlined" @click="openDetails">
    <v-card-item>
      <p class="text-body-1 text-medium-emphasis">
        {{ t('rates.applied') }}
      </p>
      <div class="d-sm-flex justify-space-between align-baseline ga-4">
        <p class="text-h6">
          {{ item.name }}
        </p>
        <p v-if="currentVersion" class="text-h6 flex-0-0">
          {{ getVersionTitle(currentVersion) }}
        </p>
      </div>
      <p v-if="currentVersion" class="text-body-1 text-medium-emphasis">
        {{ getVersionDates(currentVersion) }}
      </p>
    </v-card-item>
    <v-dialog v-model="detailIsOpen" width="90vw" max-width="680">
      <rate-plan-detail :item="item" />
      <v-btn v-if="detailIsOpen"
        icon="mdi-close"
        variant="plain"
        class="close-dialog"
        @click="closeDetails" />
    </v-dialog>
  </v-card>
</template>