<script setup lang="ts">
import { useAppStore } from '@/store/app';
import { computed, PropType, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { Client } from '@/models/clients.model';

const props = defineProps({
  client: {
    type: Object as PropType<Client | null>,
    default: null,
  },
})
const { t, locale } = useI18n();
const appStore = useAppStore();
const countries = computed(() => {
  return appStore.countries.map(item => {
    let title = locale.value === 'ru' && item.nameRu
      ? item.nameRu
      : item.name;
    if (!title) title = item.name;
    return {
      ...item,
      title,
      subtitle: title === item.nameNative ? '' : item.nameNative,
    };
  })
});

// form
const formInitialData = {
  name: props.client?.name ?? '',
  fullName: props.client?.fullName ?? '',
  country: props.client?.country?.iso2 ?? '',
  region: props.client?.region ?? '',
  city: props.client?.city ?? '',
  streetAddress: props.client?.streetAddress ?? '',
  zipCode: props.client?.zipCode ?? null,
  taxId: props.client?.taxId ?? '',
  website: props.client?.website ?? '',
  phone: props.client?.phone ?? '',
  email: props.client?.email ?? '',
  active: props.client?.active ?? true,
};
const formData = reactive({ ...formInitialData });
const rules = {
  name: { required },
  country: { required },
};
const $v = useVuelidate(rules, formData);
const emits = defineEmits(['submit', 'cancel']);
const submit = async () => {
  const isValid = await $v.value.$validate();
  if (isValid) emits('submit', formData);
}
const cancel = () => {
  emits('cancel');
}
</script>

<template>
  <v-card :title="t('clients.create')">
    <v-card-item>
      <v-form @keyup.enter="submit">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.name"
              type="text"
              class="mb-4"
              :label="t('clients.fields.name')"
              :error-messages="$v.name.$errors.map(e => e.$message as string)" />
            <v-text-field
              v-model="formData.fullName"
              type="text"
              class="mb-4"
              :label="t('clients.fields.fullName')" />
            <v-text-field
              v-model="formData.taxId"
              type="text"
              class="mb-4"
              :label="t('clients.fields.taxId')" />
            <v-text-field
              v-model="formData.website"
              type="text"
              class="mb-4"
              :label="t('clients.fields.website')" />
            <v-text-field
              v-model="formData.phone"
              type="text"
              class="mb-4"
              :label="t('clients.fields.phone')" />
            <v-text-field
              v-model="formData.email"
              type="text"
              :label="t('clients.fields.email')" />
          </v-col>
          <v-col cols="12" md="6">
            <v-autocomplete
              v-if="countries.length"
              v-model="formData.country"
              :items="countries"
              :label="t('clients.fields.country')"
              item-title="title"
              item-value="iso2"
              :filter-keys="['id', 'raw.name', 'raw.nameRu', 'raw.nameNative', 'raw.iso3']"
              :error-messages="$v.country.$errors.map(e => e.$message as string)"
              class="mb-4">
              <template v-slot:item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :subtitle="item.raw.subtitle ?? ''"
                  :title="item.title">
                  <template #prepend>
                    <span class="noto-emoji mr-4">
                      {{ item.raw.emoji }}
                    </span>
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
            <v-text-field
              v-model="formData.region"
              type="text"
              class="mb-4"
              :label="t('clients.fields.region')" />
            <v-text-field
              v-model="formData.city"
              type="text"
              class="mb-4"
              :label="t('clients.fields.city')" />
            <v-text-field
              v-model="formData.streetAddress"
              type="text"
              class="mb-4"
              :label="t('clients.fields.streetAddress')" />
            <v-text-field
              v-model.number="formData.zipCode"
              type="text"
              class="mb-4"
              :label="t('clients.fields.zipCode')" />
            <v-switch
              v-model="formData.active"
              :label="formData.active ? t('clients.fields.active') : t('clients.fields.notActive')"
              :color="formData.active ? 'success' : 'default'" />
          </v-col>
        </v-row>
      </v-form>
    </v-card-item>
    <v-card-actions class="px-6 pb-6">
      <v-spacer />
      <v-btn @click="cancel">{{ t('btn.cancel') }}</v-btn>
      <v-btn color="primary" variant="flat" @click="submit">
        {{ t('btn.submit') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>