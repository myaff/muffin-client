<script setup lang="ts">
import { BankAccount } from '@/models/bankAccount.model';
import { computed, onMounted, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import WidgetBank from '@/components/finance/WidgetBank.vue';
import { useBankAccountsStore } from '@/store/bankAccounts';
import WidgetLastTransactions from '../WidgetLastTransactions.vue';

const props = defineProps({
  item: {
    type: Object as PropType<BankAccount>,
    required: true,
  },
})
const bankAccountsStore = useBankAccountsStore();
const emits = defineEmits(['edit']);
const { t, n } = useI18n();
const details = computed(() => bankAccountsStore.detailsMap.get(props.item.id));
const final = computed(() => {
  return details.value ?? props.item;
})
onMounted(async () => await bankAccountsStore.getDetail(props.item.id))
</script>

<template>
  <v-card>
    <v-card-item>
      <v-row class="align-center pr-8">
        <v-col cols="12" md="7">
          <div class="d-flex align-center">
            <h1 class="text-h4">{{ final.name }}</h1>
            <v-btn icon="mdi-pencil" class="ml-3" @click="emits('edit', item)" />
          </div>
          <p class="text-body-1 text-medium-emphasis">
            {{ final.currency.id + ' - ' + final.currency.name }}
          </p>
        </v-col>
        <v-col cols="12" md="5">
          <div class="text-h5 text-sm-h4 text-md-right">
            {{ n(final.balance, { key: 'currency', currency: final.currency.id }) }}
          </div>
        </v-col>
      </v-row>
    </v-card-item>
    <v-card-item>
      <v-row>
        <v-col cols="12" md="6">
          <widget-bank v-if="final?.bank" :bank="final.bank" />
        </v-col>
        <v-col cols="12" md="6">
          <widget-last-transactions :filter="{ bankAccountId: final.id }" />
        </v-col>
      </v-row>
    </v-card-item>
  </v-card>
</template>