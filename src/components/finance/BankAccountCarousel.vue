<script setup lang="ts">
import BankAccountCard from '@/components/finance/BankAccountCard.vue';
import BankAccountCreateUpdate from './BankAccountCreateUpdate.vue';
import { BankAccount } from '@/models/bankAccount.model';
import { UiAlert } from '@/models/ui.model';
import { useBankAccountsStore } from '@/store/bankAccounts';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BankAccountDetail from './BankAccountDetail.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import SwiperNavigation from '../SwiperNavigation.vue';
import useError from '@/composables/useError';
import useCreateUpdate from '@/composables/useCreateUpdate';

const bankAccountsStore = useBankAccountsStore();
const list = computed(() => bankAccountsStore.list);
const isLoading = computed(() => bankAccountsStore.isLoading);
const loadingError = ref<UiAlert | null>(null);
const { t } = useI18n();
async function fetchList() {
  bankAccountsStore.fetchList()
    .catch(e => loadingError.value = useError(e, t));
}
onMounted(async () => {
  if (!list.value.length && !isLoading.value) await fetchList();
})

const {
  isSending,
  sendingError,
  creationIsOpen,
  entityToEdit,
  openCreation,
  openEdition,
  create,
  update,
  cancel,
} = useCreateUpdate({
  store: bankAccountsStore,
  onError: (e) => useError(e, t),
});

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
        <BankAccountCard :item="item" @open="openDetails(item)" @edit="openEdition(item)" />
      </SwiperSlide>
      <SwiperSlide key="new-account" class="bank-account-carousel__item">
        <BankAccountCard @add="openCreation" />
      </SwiperSlide>
    </Swiper>
    <v-dialog v-model="creationIsOpen" width="90vw" max-width="1280">
      <template v-if="!sendingError">
        <BankAccountCreateUpdate
          :bank-account="entityToEdit"
          @cancel="cancel"
          @submit="(e) => !!entityToEdit ? update(e) : create(e)" />
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
      <BankAccountDetail v-if="itemDetailed" :item="itemDetailed" @edit="openEdition" />
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