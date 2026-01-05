<script setup lang="ts">
import { BankAccount } from '@/models/bankAccount.model';
import { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  item: {
    type: Object as PropType<BankAccount>,
    default: null,
  },
})
const emits = defineEmits(['edit', 'add', 'open']);
const { n } = useI18n();
</script>

<template>
  <v-card min-height="140" class="bank-account-card" @click="item ? emits('open', item) : emits('add')">
    <template v-if="item">
      <v-card-item :title="item.name" :subtitle="item.bank?.name ?? ''">
        <template #append>
          <v-btn icon="mdi-cog" size="40" variant="plain" @click.stop="emits('edit', item)" />
        </template>
      </v-card-item>
      <v-card-item>
        <div class="text-h4">
          {{ n(item.balance, { key: 'currency', currency: item.currency.id }) }}
        </div>
      </v-card-item>
    </template>
    <div v-else class="position-absolute d-flex w-100 h-100 align-center justify-center">
      <v-icon icon="mdi-plus" class="ma-auto" size="40" />
    </div>
  </v-card>
</template>