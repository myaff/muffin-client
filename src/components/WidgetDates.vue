<script setup lang="ts">
import { BaseContentEntity, Deliverable } from '@/models/common.model';
import { computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
const props = defineProps({
  entity: {
    type: Object as PropType<BaseContentEntity & Partial<Deliverable>>,
    required: true,
  },
  titleWidth: {
    type: [String, Number],
    default: 150,
  },
  mobileCollapse: {
    type: Boolean,
    default: false,
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
  <v-table
    class="widget-dates text-left text-body-1 text-valign-top"
    :class="{'d-block d-sm-table': mobileCollapse}">
    <tr
      v-for="item in list"
      :key="item.key"
      class="widget-dates__row"
      :class="{'d-block d-sm-table-row': mobileCollapse}">
      <th
        class="pa-1 font-weight-regular text-medium-emphasis"
        scope="row"
        :width="titleWidth"
        :class="{'d-block d-sm-table-cell': mobileCollapse}">
        {{ item.title }}
      </th>
      <td
        class="pa-1"
        :class="{'d-block d-sm-table-cell': mobileCollapse}">
        {{ item.value }}
      </td>
    </tr>
  </v-table>
</template>