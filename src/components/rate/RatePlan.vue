<script setup lang="ts">
import { getRateVersionByDate } from '@/helpers/rate.helper';
import { RatePlanFull, RateType, RateVersion } from '@/models/rates.model';
import { isBefore } from 'date-fns';
import { PropType, computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  item: {
    type: Object as PropType<RatePlanFull>,
    required: true,
  },
})
const { t, n, d } = useI18n();
const currentVersion = computed(() => getRateVersionByDate(props.item, new Date()));
const otherVersions = computed(() => {
  if (!currentVersion.value) return props.item.versions;
  return props.item.versions
    .filter(version => version.id !== currentVersion.value?.id)
    .sort(sortVersions);
})
function sortVersions(a: Pick<RateVersion, 'startDate'>, b: Pick<RateVersion, 'startDate'>) {
  if (isBefore(new Date(a.startDate), new Date(b.startDate))) return 1;
  if (isBefore(new Date(b.startDate), new Date(a.startDate))) return -1;
  return 0;
}
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
const open = ref<string[]>([]);
</script>

<template>
  <v-card class="rate-plan">
    <v-card-title>{{ item.name }}</v-card-title>
    <v-card-subtitle>
      {{ t(`rates.types.${props.item.type}.title`) }}
    </v-card-subtitle>
    <v-card-item>
      <v-list>
        <v-list-item
          v-if="currentVersion"
          :key="currentVersion.id"
          :title="getVersionTitle(currentVersion)"
          :subtitle="getVersionDates(currentVersion)" />
        <v-list-group v-if="otherVersions.length" value="other">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              title="Other"
            ></v-list-item>
          </template>
          <v-list-item
            v-for="version in otherVersions"
            :key="version.id"
            :title="getVersionTitle(version)"
            :subtitle="getVersionDates(version)" />
        </v-list-group>
      </v-list>
    </v-card-item>
  </v-card>
</template>