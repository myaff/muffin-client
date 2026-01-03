<script setup lang="ts">
import { BaseContentEntity, Deliverable } from '@/models/common.model';
import { computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
const props = defineProps({
  entity: {
    type: Object as PropType<BaseContentEntity & Partial<Deliverable>>,
    required: true,
  },
})
const { t, d } = useI18n();
const list = computed(() => {
  const datesProps = ['startDate', 'endDate', 'createdAt', 'updatedAt'] as const;
  return datesProps
    .filter(key => key in props.entity)
    .map(key => ({
      key,
      title: t(`date.${key}`),
      value: props.entity[key]
        ? d(props.entity[key], 'shortTime')
        : t('date.undefined'),
    }));
})
</script>

<template>
  <v-table class="widget-dates text-left text-body-1">
    <tr v-for="item in list" :key="item.key" class="widget-dates__row">
      <th class="pa-1 font-weight-regular text-medium-emphasis" scope="row">
        {{ item.title }}
      </th>
      <td class="pa-1">
        {{ item.value }}
      </td>
    </tr>
  </v-table>
</template>