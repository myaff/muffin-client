<script setup lang="ts">
import { WidgetInfoItem } from '@/models/ui.model';
import { PropType } from 'vue';

const props = defineProps({
  list: {
    type: Array as PropType<WidgetInfoItem[]>,
    default: () => [],
  },
})
</script>

<template>
  <v-table class="widget-info text-left text-body-1">
    <tr v-for="(item, i) in list" :key="i" class="widget-dates__row">
      <th class="pa-1 font-weight-regular text-medium-emphasis" scope="row">
        {{ item.title }}
      </th>
      <td class="pa-1">
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