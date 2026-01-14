<script setup lang="ts">
import { WidgetInfoItem } from '@/models/ui.model';
import { PropType } from 'vue';

const props = defineProps({
  list: {
    type: Array as PropType<WidgetInfoItem[]>,
    default: () => [],
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
</script>

<template>
  <v-table
    class="widget-info text-left text-body-1"
    :class="{'d-block d-sm-table': mobileCollapse}">
    <tr
      v-for="(item, i) in list"
      :key="i"
      class="widget-dates__row"
      :class="{'d-block d-sm-table-row': mobileCollapse}">
      <th
        class="pa-1 font-weight-regular text-medium-emphasis text-valign-top"
        scope="row"
        :width="titleWidth"
        :class="{'d-block d-sm-table-cell': mobileCollapse}">
        {{ item.title }}
      </th>
      <td
        class="pa-1 text-valign-top"
        :class="{'d-block d-sm-table-cell': mobileCollapse}">
        <a v-if="item?.href" :href="item.href" target="_blank">
          {{ item.value }}
        </a>
        <span v-else>
          {{ item.value }}
        </span>
      </td>
    </tr>
  </v-table>
</template>