<script setup lang="ts">
import BankAccountCard from '@/components/finance/BankAccountCard.vue';
import BankAccountCreateUpdate from './BankAccountCreateUpdate.vue';
import { BankAccount, BankAccountCreate, BankAccountUpdate } from '@/models/bankAccount.model';
import { UiAlert } from '@/models/ui.model';
import { useBankAccountsStore } from '@/store/bankAccounts';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BankAccountDetail from './BankAccountDetail.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import SwiperNavigation from '../SwiperNavigation.vue';

const bankAccountsStore = useBankAccountsStore();
const list = computed(() => bankAccountsStore.list);
const isLoading = computed(() => bankAccountsStore.isLoading);
const loadingError = ref<UiAlert | null>(null);
const { t } = useI18n();
async function fetchList() {
  bankAccountsStore.fetchList()
    .catch(e => loadingError.value = getErrorOrDefault(e));
}
if (!list.value.length && !isLoading.value) fetchList();
// creation
const isSending = ref(false);
const sendingError = ref<UiAlert | null>(null);
const creationIsOpen = ref(false);
const bankAccountToEdit = ref<BankAccount | null>(null);
const create = (formData: BankAccountCreate) => {
  isSending.value = true;
  bankAccountsStore.create(formData)
    .catch(e => sendingError.value = getErrorOrDefault(e))
    .finally(() => creationIsOpen.value = false);
}
const update = (formData: BankAccountUpdate) => {
  if (!bankAccountToEdit.value) return;
  isSending.value = true;
  bankAccountsStore.update(bankAccountToEdit.value.id, formData)
    .catch(e => sendingError.value = getErrorOrDefault(e))
    .finally(() => {
      isSending.value = false;
      creationIsOpen.value = false;
      bankAccountToEdit.value = null;
    })
}
const cancel = () => {
  creationIsOpen.value = false;
  if (bankAccountToEdit.value) bankAccountToEdit.value = null;
}
const getErrorOrDefault = (e: any) => {
  return {
    title: e?.title ?? t('error.unknown.title'),
    message: e?.message || e?.errorMessage || t('error.unknown.message'),
  };
}
function onAdd() {
  creationIsOpen.value = true;
}
function onEdit(bankAccount: BankAccount) {
  bankAccountToEdit.value = bankAccount;
  creationIsOpen.value = true;
}
watch(creationIsOpen, value => {
  if (!value) cancel();
})

const detailIsOpen = ref(false);
const itemDetailed = ref<BankAccount | null>(null);
function openDetails(item: BankAccount) {
  itemDetailed.value = item;
  detailIsOpen.value = true;
}
function closeDetails() {
  detailIsOpen.value = false;
  itemDetailed.value = null;
}
watch(detailIsOpen, value => {
  if (!value) closeDetails();
})
</script>

<template>
  <div class="bank-account-carousel">
    <Swiper
      slides-per-view="auto"
      :space-between="12">
      <template #container-start>
        <div class="bank-accounts-carousel__heading mb-6 d-flex align-center justify-space-between">
          <h1 class="text-h5 text-sm-h4">
            {{ t('bankAccount.items') }}
          </h1>
          <SwiperNavigation />
        </div>
      </template>
      <SwiperSlide v-for="item in list" :key="item.id" class="bank-account-carousel__item">
        <BankAccountCard :item="item" @open="openDetails(item)" @edit="onEdit(item)" />
      </SwiperSlide>
      <SwiperSlide key="new-account" class="bank-account-carousel__item">
        <BankAccountCard @add="onAdd" />
      </SwiperSlide>
    </Swiper>
    <v-dialog v-model="creationIsOpen" width="90vw" max-width="1280">
      <template v-if="!sendingError">
        <BankAccountCreateUpdate
          :bank-account="bankAccountToEdit"
          @cancel="cancel"
          @submit="(e: BankAccountCreate) => !!bankAccountToEdit ? update(e) : create(e)" />
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
        @click="creationIsOpen = false" />
    </v-dialog>
    <v-dialog v-model="detailIsOpen" width="90vw" max-width="1280">
      <BankAccountDetail v-if="itemDetailed" :item="itemDetailed" @edit="onEdit" />
      <v-btn v-if="detailIsOpen"
        icon="mdi-close"
        variant="plain"
        class="close-dialog"
        @click="closeDetails" />
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
.bank-account-carousel {
  &__item {
    width: 280px;
  }
}
</style>