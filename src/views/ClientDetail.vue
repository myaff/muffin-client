<script setup lang="ts">
import WidgetDates from '@/components/WidgetDates.vue';
import WidgetInfo from '@/components/WidgetInfo.vue';
import { getQueryParamValue } from '@/helpers/url.helper';
import { Client, ClientUpdate } from '@/models/clients.model';
import { WidgetInfoItem } from '@/models/ui.model';
import { useAppStore } from '@/store/app';
import { useClientsStore } from '@/store/clients';
import { isNumber } from 'lodash-es';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const emits = defineEmits(['edit']);
const { t, locale } = useI18n();
const route = useRoute();
const appStore = useAppStore();
const clientsStore = useClientsStore();
const preparedId = computed(() => Number.parseInt(getQueryParamValue(route.params?.id ?? '')));
const client = computed(() => clientsStore.detailsMap.get(preparedId.value));
const isLoading = ref(false);
function fetch(id: number, silent = false) {
  if (!silent) isLoading.value = true;
  clientsStore.getDetail(id)
    .finally(() => isLoading.value = false);
}
if (isNumber(preparedId.value)) fetch(preparedId.value);
const country = computed(() => {
  if (!client.value?.country) return null;
  const title = locale.value === 'ru' && client.value.country.nameRu
    ? client.value.country.nameRu
    : client.value.country.name;
  return { ...client.value.country, title };
})
const formattedAddress = computed(() => {
  if (!client.value) return '';
  const parts: string[] = [];
  if (client.value?.zipCode) parts.push(client.value.zipCode.toString());
  if (client.value.region) parts.push(client.value.region);
  if (client.value.city) parts.push(client.value.city);
  if (client.value.streetAddress) parts.push(client.value.streetAddress);
  return parts.join(', ');
})
const website = computed(() => {
  if (!client.value?.website) return null;
  return new URL(client.value.website);
})
const active = ref(client.value?.active ?? true);
const activeIsUpdating = ref(false);
watch(client, value => {
  if (value) active.value = value.active;
})
function update(id: Client['id'], payload: ClientUpdate) {
  return clientsStore.update(id, payload);
}
function updateActive() {
  if (!client.value) return;
  activeIsUpdating.value = true;
  update(client.value.id, { active: active.value })
    .finally(() => activeIsUpdating.value = false);
}
const infoList = computed(() => {
  const list: WidgetInfoItem[] = [];
  if (!client.value) return list;
  if (formattedAddress.value) {
    list.push({
      title: t('clients.fields.streetAddress'),
      value: formattedAddress.value,
    })
  }
  if (client.value?.taxId) {
    list.push({
      title: t('clients.fields.taxId'),
      value: client.value.taxId,
    });
  }
  if (client.value?.phone) {
    list.push({
      title: t('clients.fields.phone'),
      value: client.value.phone,
    })
  }
  if (client.value?.email) {
    list.push({
      title: t('clients.fields.email'),
      value: client.value.email,
      href: `mailto:${client.value.email}`,
    })
  }
  if (website.value) {
    list.push({
      title: t('clients.fields.website'),
      value: website.value.host,
      href: website.value.href,
    });
  }
  return list;
})
</script>

<template>
  <v-card class="client-detail" :loading="isLoading">
    <template v-if="client">
      <v-card-item>
        <v-row>
          <v-col>
            <p v-if="client?.fullName" class="text-body-1 pr-12">
              {{ client.fullName }}
            </p>
            <h1 class="text-h4 mt-3">
              {{ client.name }}
            </h1>
          </v-col>
        </v-row>
      </v-card-item>
      <v-card-item>
        <v-btn prepend-icon="mdi-pencil" class="ml-auto" @click="emits('edit', client)">
          {{ t('btn.edit') }}
        </v-btn>
      </v-card-item>
      <v-card-item v-if="country">
        <template v-if="country?.emoji" #prepend>
          <span class="noto-emoji">
            {{ country.emoji }}
          </span>
        </template>
        {{ country.title }}
      </v-card-item>
      <v-card-item>
        <v-row>
          <v-col cols="12" md="8">
            <WidgetInfo :list="infoList" />
          </v-col>
          <v-col cols="12" md="4">
            <WidgetDates :entity="client" />
            <v-switch
              v-model="active"
              :label="active ? t('clients.fields.active') : t('clients.fields.notActive')"
              :color="active ? 'success' : 'default'"
              @update:model-value="updateActive" />
          </v-col>
        </v-row>
      </v-card-item>
    </template>
  </v-card>
</template>