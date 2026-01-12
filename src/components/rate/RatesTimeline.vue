<script setup lang="ts">
import useCreateUpdate from '@/composables/useCreateUpdate';
import useError from '@/composables/useError';
import { RatePlanFull, RateType, RateVersion, RateVersionCreate, RateVersionUpdate } from '@/models/rates.model';
import { useRatesStore } from '@/store/rates';
import { isBefore } from 'date-fns';
import { PropType, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import RateVersionCreateUpdate from './RateVersionCreateUpdate.vue';
const { t, n, d } = useI18n();
const props = defineProps({
  item: {
    type: Object as PropType<RatePlanFull>,
    required: true,
  },
  enableAdd: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['add']);
const ratesStore = useRatesStore();
function sortVersions(a: Pick<RateVersion, 'startDate'>, b: Pick<RateVersion, 'startDate'>) {
  if (isBefore(new Date(a.startDate), new Date(b.startDate))) return 1;
  if (isBefore(new Date(b.startDate), new Date(a.startDate))) return -1;
  return 0;
}
const currencyOptions = computed(() => ({
  key: 'currency',
  currency: props.item.currency.id,
}));
const getVersionSum = (version: Pick<RateVersion, 'amount' | 'recurringCount'>) => {
  const sum = n(version.amount, currencyOptions.value);
  const units = props.item.type === RateType.RECURRING
    ? t(`rates.recurringUnit.${props.item.recurringUnit}.count`, version.recurringCount)
    : '';
  const per = t(`rates.types.${props.item.type}.per`, units);
  return { sum, per };
}
const getVersionDates = (version: Pick<RateVersion, 'startDate' | 'endDate'>) => {
  const from = d(version.startDate, 'short');
  const to = version?.endDate ? d(version.endDate, 'short') : '...';
  return `${from} — ${to}`;
}
const getExtraLine = (version: Pick<RateVersion, 'overageHourly' | 'includedHours'>) => {
  const included = version?.includedHours
    ? t('rates.included') + ' ' + t('dates.hours', version.includedHours)
    : '';
  const overage = version.overageHourly
    ? `${t('rates.overage')} ${n(version.overageHourly, currencyOptions.value)} ${t('rates.types.hourly.per')}`
    : '';
  return [included, overage].filter(i => !!i).join(', ');
}
const list = computed(() => {
  return props.item.versions.sort(sortVersions).map((version, i) => {
    return {
      ...version,
      ...getVersionSum(version),
      dates: getVersionDates(version),
      extraLine: getExtraLine(version),
      isCurrent: i === 0 && (!version.endDate || isBefore(new Date(), new Date(version.endDate)))
    };
  })
})
const versionStore = {
  create: (formData: RateVersionCreate) => ratesStore.service.createVersion(props.item.id, formData),
  update: (id: number, formData: RateVersionUpdate) => ratesStore.service.updateVersion(props.item.id, id, formData),
}
const {
  isSending,
  sendingError,
  creationIsOpen,
  entityToEdit,
  create,
  update,
  cancel,
  openCreation,
  openEdition,
} = useCreateUpdate({
  store: versionStore,
  onError: (e) => useError(e, t),
  onCreate: ratesStore.fetchList,
  onUpdate: ratesStore.fetchList,
});
</script>

<template>
  <div class="rates-timeline">
    <template v-if="enableAdd">
      <v-btn
        icon="mdi-plus"
        color="primary"
        size="small"
        @click="openCreation" />
      <span class="text-body-1 text-medium-emphasis ml-4">
        {{ t('btn.add') }}
      </span>
    </template>
    <v-timeline v-if="list.length" side="end" density="compact" class="pl-1">
      <v-timeline-item
        v-for="version in list"
        :key="version.id"
        :dot-color="version.isCurrent ? 'success' : undefined"
        size="small">
        <div class="rates-timeline__item-heading d-flex justify-space-between align-end ga-4">
          <p class="text-h6">
            {{ version.sum }}
            <span class="text-caption text-medium-emphasis">
              {{ version.per }}
            </span>
          </p>
          <div v-if="version.editable || version.deletable" class="rates-timeline__item-actions flex-0-0 d-flex ga-2">
            <v-btn
              :disabled="!version.editable"
              icon="mdi-pencil"
              variant="plain"
              size="small"
              density="comfortable"
              @click="openEdition({...version, ratePlan: item})" />
            <v-btn
              :disabled="!version.deletable"
              icon="mdi-trash-can"
              color="error"
              variant="plain"
              size="small"
              density="comfortable" />
          </div>
        </div>
        <p class="text-body-1 text-medium-emphasis">
          {{ version.dates }}
        </p>
        <p v-if="version.extraLine" class="text-body-1 text-medium-emphasis">
          {{ version.extraLine }}
        </p>
      </v-timeline-item>
    </v-timeline>
    <p v-else class="text-body-1 text-medium-emphasis">
      {{ t('rates.empty') }}
    </p>
    <v-dialog v-model="creationIsOpen" width="90vw" max-width="480">
      <template v-if="!sendingError">
        <rate-version-create-update
          :rate-plan="item"
          :version="entityToEdit ?? undefined"
          @cancel="cancel"
          @submit="e => entityToEdit ? update(e) : create(e)" />
        <v-overlay v-model="isSending" contained class="align-center justify-center">
          <v-progress-circular indeterminate />
        </v-overlay>
      </template>
      <v-alert v-else :title="sendingError?.title" :text="sendingError?.message" type="error" />
      <v-btn
        v-if="creationIsOpen && !isSending"
        icon="mdi-close"
        class="close-dialog"
        variant="plain"
        @click="cancel" />
    </v-dialog>
  </div>
</template>