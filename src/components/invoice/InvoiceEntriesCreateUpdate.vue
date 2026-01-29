<script setup lang="ts">
import { Client } from '@/models/clients.model';
import { InvoiceEntry, InvoiceEntryPreview } from '@/models/invoice.model';
import { UiTableHeaderCell } from '@/models/ui.model';
import { computed, PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';

const props = defineProps({
  client: {
    type: Object as PropType<Client>,
    default: null,
  },
  entries: {
    type: Map as PropType<Map<string, Omit<InvoiceEntry, 'invoice'>> | null>,
    default: null,
  },
  preview: {
    type: Map as PropType<Map<string, InvoiceEntryPreview>>,
    default: null,
  },
  total: {
    type: Number,
    default: 0,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['update:modelValue']);
const { t, n } = useI18n();
const currency = computed(() => props.client.country.currency.id);
const currencyOptions = computed(() => ({
  key: 'currency',
  currency: currency.value,
}));
const formData = defineModel<{ [key: string]: string }>('names', { default: () => ({}) });
const selected = defineModel('selected');
const expanded = ref<string[]>([]);
// table data
const tableHeaders: UiTableHeaderCell[] = [
  {
    key: 'data-table-select',
    maxWidth: '40',
    width: '40',
    align: 'center',
  },
  {
    key: 'task',
    title: t('tracking.fields.task'),
    sortable: false,
  },
  {
    key: 'amount',
    title: t('invoice.fields.countShort'),
    width: '80',
    align: 'center',
    sortable: false,
  },
  {
    key: 'unit',
    title: t('invoice.fields.unit'),
    sortable: false,
    width: '86',
    align: 'center',
  },
  {
    key: 'rate',
    title: t('invoice.fields.pricePerUnit'),
    maxWidth: '110',
    align: 'end',
    sortable: false,
  },
  {
    key: 'subtotal',
    title: t('invoice.subtotal'),
    maxWidth: '110',
    align: 'end',
    sortable: false,
  },
  {
    key: 'data-table-expand',
    title: '',
    maxWidth: '48',
    width: '48',
  },
];
const mergedEntries = computed(() => {
  if (!props.entries?.size) return Array.from(props.preview.values());
  return [
    ...Array.from(props.entries.values()),
    ...Array.from(props.preview.values()),
  ];
})
const { xs } = useDisplay();
</script>

<template>
  <div class="invoice-entries-create-update w-100 d-flex align-center justify-center">
    <v-data-table
      v-model:expanded="expanded"
      v-model="selected"
      :loading="isLoading"
      :headers="tableHeaders"
      :items="mergedEntries"
      item-value="key"
      show-select
      fixed-header
      hide-default-footer
      class="overlow-y-auto scrollbar-thin"
      :style="{ maxHeight: xs ? 'unset' : '520px' }">
      <template #item="{ item, internalItem, isExpanded, toggleExpand, isSelected }">
        <tr
          class="tracking-table__row text-body-1"
          :class="{
            expanded: isExpanded(internalItem),
            'text-medium-emphasis': !isSelected(internalItem),
            'text-decoration-line-through': !isSelected(internalItem),
          }">
          <td class="px-2">
            <v-checkbox-btn v-model="selected" :value="item.key" />
          </td>
          <td>
            <v-textarea
              v-model="formData[item.key]"
              :variant="isSelected(internalItem) ? 'filled' : 'solo'"
              single-line
              rows="1"
              flat
              density="comfortable"
              auto-grow
              hide-details
              bg-color="surface"
              :readonly="!isSelected(internalItem)"
              :rules="[(value) => value.length > 2]"
              :append-inner-icon="isSelected(internalItem) ? 'mdi-pencil' : ''"
              glow />
          </td>
          <td class="text-center">{{ item.count }}</td>
          <td class="text-center">
            {{ t(`invoice.units.${item.unit}`) }}
          </td>
          <td class="text-right">
            {{ n(item.pricePerUnit, currencyOptions) }}
          </td>
          <td class="text-right">
            {{ n(item.total, currencyOptions) }}
          </td>
          <td class="px-2">
            <v-btn variant="flat"
              :icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              @click="toggleExpand(internalItem)" />
          </td>
        </tr>
      </template>
      <template #expanded-row="{ item }">
        <tr v-for="tracking in item.tracking" :key="tracking.id" class="tracking-table__row internal">
          <td></td>
          <td>{{ tracking.date }}</td>
          <td class="text-center">
            {{ tracking.amount }}
          </td>
          <td class="text-center">
            {{ t(`invoice.units.${item.unit}`) }}
          </td>
          <td class="text-right">
            {{ n(item.pricePerUnit, currencyOptions) }}
          </td>
          <td class="text-right">
            {{ n(item.pricePerUnit * tracking.amount, currencyOptions) }}
          </td>
          <td></td>
        </tr>
      </template>
      <template v-if="!xs" #tfoot>
        <tr class="position-sticky bottom-0 bg-surface">
          <td colspan="6" class="text-h5 py-5 border-t-sm text-right">
            <span class="mr-3">{{ t('invoice.total') }}:</span>
            {{ n(total, currencyOptions) }}
          </td>
          <td class="py-3 border-t-sm"></td>
        </tr>
      </template>
      <template v-if="xs" #bottom>
        <div class="text-h5 py-3 border-t-sm text-left px-2 py-5">
          <span class="mr-3">{{ t('invoice.total') }}:</span>
          {{ n(total, currencyOptions) }}
        </div>
      </template>
    </v-data-table>
  </div>
</template>