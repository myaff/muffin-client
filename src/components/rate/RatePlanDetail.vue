<script setup lang="ts">
import { RatePlanFull, RateScope, RateType, RateVersion } from '@/models/rates.model';
import { PropType, computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import RatesTimeline from '@/components/rate/RatesTimeline.vue';
import { WidgetInfoItem } from '@/models/ui.model';
import WidgetInfo from '../WidgetInfo.vue';
import WidgetDates from '../WidgetDates.vue';
import { useDisplay } from 'vuetify';

const props = defineProps({
  item: {
    type: Object as PropType<RatePlanFull>,
    required: true,
  },
})
const { t } = useI18n();
const info = computed(() => {
  const arr: WidgetInfoItem[] = [{
    title: t('rates.fields.type'),
    value: t(`rates.types.${props.item.type}.title`),
  }];
  if (props.item.type === RateType.RECURRING) {
    arr.push({
      title: t('rates.fields.recurringUnit'),
      value: t(`rates.recurringUnits.${props.item.recurringUnit}.title`),
    })
  }
  arr.push({
    title: t('rates.fields.scope'),
    value: t(`rates.scope.${props.item.scope}`),
  });
  if (props.item?.client) {
    arr.push({
      title: t('rates.fields.client'),
      value: props.item.client.name,
    });
  }
  if (props.item?.project) {
    arr.push({
      title: t('rates.fields.project'),
      value: props.item.project.title,
    });
  }
  arr.push({
    title: t('rates.fields.currency'),
    value: `${props.item.currency.symbol} - ${props.item.currency.name}`,
  })
  return arr;
})
const { xs } = useDisplay();
</script>

<template>
  <v-card class="rate-plan">
    <v-card-item>
      <div class="d-flex flex-wrap ga-4 justify-space-between">
        <div class="flex-1-1">
          <p class="text-h6 text-sm-h5">
            {{ item.name }}
          </p>
          <widget-info :list="info" title-width="180" mobile-collapse class="mt-5" />
          <widget-dates :entity="item" :title-width="xs ? 130 : 180" />
        </div>
        <div class="flex-0-0">
          <rates-timeline :item="item" enable-add />
        </div>
      </div>
    </v-card-item>
  </v-card>
</template>