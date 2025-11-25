<script setup lang="ts">
import { reactive, ref, watchEffect, computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useRatesStore } from '@/store/rates';
import { useClientsStore } from '@/store/clients';
import { UiAlert } from '@/models/ui.model';
import { RateCreate } from '@/models/rates.model';
import RateCreateForm from './RateCreate.vue';
import useError from '@/composables/useError';
import useRate from '@/composables/useRate';
import { Project, ProjectCreate } from '@/models/projects.model';
import { isNumber } from 'lodash-es';
import { TaskPriority } from '@/models/tasks.model';
import usePriority from '@/composables/usePriority';

const props = defineProps({
  project: {
    type: Object as PropType<Project | null>,
    default: null,
  },
})
const emits = defineEmits(['submit', 'cancel']);
const { t, n, d } = useI18n();
const ratesStore = useRatesStore();
const clientsStore = useClientsStore();
const rates = computed(() => ratesStore.list);
const clients = computed(() => clientsStore.list);
watchEffect(() => {
  if (!rates.value.length) ratesStore.fetchList();
  if (!clients.value.length) clientsStore.fetchList();
});
// form
const formInitialData = {
  title: props.project?.title ?? '',
  url: props.project?.url ?? '',
  client: props.project?.client ?? null,
  rates: [],
  code: props.project?.code ?? '',
  description: props.project?.description ?? '',
  active: props.project?.active ?? true,
  priority: props.project?.priority ?? TaskPriority.MEDIUM,
  startDate: props.project?.startDate ?? null,
  endDate: props.project?.endDate ?? null,
};
const estimate = reactive({
  min: props.project?.estimate?.min ?? null,
  max: props.project?.estimate?.max ?? null,
})

const formData = reactive(formInitialData);
const rules = {
  title: { required },
  client: { required },
  code: { required },
};
const $v = useVuelidate(rules, formData);
const submit = async () => {
  const isValid = await $v.value.$validate();
  if (isValid) {
    const payload = { ...formData } as Partial<ProjectCreate>;
    if (isNumber(estimate.min) || isNumber(estimate.max)) {
      payload.estimate = {
        min: isNumber(estimate.min) ? estimate.min : estimate.max,
        max: isNumber(estimate.max) ? estimate.max : estimate.min,
      }
    }
    emits('submit', payload);
  }
}
const cancel = () => {
  emits('cancel');
}

// rate creation
const isSending = ref(false);
const sendingError = ref<UiAlert | null>(null);
const creationIsOpen = ref(false);
const create = (formData: RateCreate) => {
  isSending.value = true;
  ratesStore.create(formData)
    .catch(e => sendingError.value = useError(e, t))
    .finally(() => {
      creationIsOpen.value = false;
      isSending.value = false;
    });
}
const close = () => {
  creationIsOpen.value = false;
}
const { formatRateForSelect } = useRate({ t, n, d });
const { priorities } = usePriority(t);
</script>

<template>
  <v-card :title="project ? t('projects.update') : t('projects.create')">
    <v-card-item>
      <v-form @keyup.enter="submit">
        <v-textarea
          v-model="formData.title"
          class="mb-4"
          :label="t('projects.fields.title')"
          :error-messages="$v.title.$errors.map(e => e.$message as string)"
          rows="1"
          auto-grow
          @blur="$v.title.$touch" />
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="formData.url"
              type="text"
              hide-details
              class="mb-4"
              :label="t('projects.fields.url')" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="formData.code"
              type="text"
              class="mb-4"
              hide-details
              :label="t('projects.fields.code')"
              :error-messages="$v.code.$errors.map(e => e.$message as string)"
              @blur="$v.code.$touch" />
          </v-col>
        </v-row>
          <v-row>
          <v-col cols="12" md="8">
            <v-textarea
              v-model="formData.description"
              class="mb-5"
              :label="t('projects.fields.description')"
              rows="5"
              hide-details
              auto-grow />
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.startDate"
                    type="date"
                    hide-details
                    :label="t('date.startDate')" />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.endDate"
                    type="date"
                    hide-details
                    :label="t('date.endDate' )" />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="estimate.min"
                    type="number"
                    hide-details>
                    <template #prepend-inner>
                      <span class="text-medium-emphasis text-no-wrap mr-2">
                        {{ t('estimation.title') }},
                        {{ t('estimation.min') }}
                      </span>
                    </template>
                    <template #append-inner>
                      <span class="text-medium-emphasis text-no-wrap mr-2">
                        {{ t('tracking.hoursWtd', Number(estimate.min)) }}
                      </span>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="estimate.max"
                    type="number"
                    hide-details>
                    <template #prepend-inner>
                      <span class="text-medium-emphasis text-no-wrap mr-2">
                        {{ t('estimation.title') }}
                        {{ t('estimation.max') }}
                      </span>
                    </template>
                    <template #append-inner>
                      <span class="text-medium-emphasis text-no-wrap mr-2">
                        {{ t('tracking.hoursWtd', Number(estimate.max)) }}
                      </span>
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-if="clients.length"
              v-model="formData.client"
              :items="clients"
              :label="t('projects.fields.client')"
              item-title="name"
              item-value="id"
              :error-messages="$v.client.$errors.map(e => e.$message as string)"
              @blur="$v.client.$touch" />
            <v-select
              v-model="formData.rates"
              :items="rates"
              :label="t('projects.fields.rate')"
              :item-props="item => formatRateForSelect(item)"
              item-value="id"
              multiple>
              <template #append>
                <v-btn elevation="0" variant="plain" icon="mdi-plus" @click="creationIsOpen = true" />
              </template>
            </v-select>
            <v-dialog v-model="creationIsOpen" width="640">
              <template v-if="!sendingError">
                <rate-create-form @cancel="close" @submit="create" />
                <v-overlay v-model="isSending" contained class="align-center justify-center">
                  <v-progress-circular indeterminate />
                </v-overlay>
              </template>
              <v-alert v-else :title="sendingError?.title" :text="sendingError?.message" type="error" />
            </v-dialog>
            <v-select
              v-model="formData.priority"
              :items="priorities"
              item-title="title"
              item-value="value"
              :item-props="item => ({ ...item, title: item.title.toUpperCase() })">
              <template #prepend-inner>
                <span class="text-medium-emphasis">
                  {{ t('projects.fields.priority') }}:
                </span>
              </template>
              <template #selection="{ item }">
                <v-chip :prepend-icon="item.raw.icon" :color="item.raw.color">
                  {{ item.title }}
                </v-chip>
              </template>
              <template #item="{ props, item }">
                <v-list-item v-bind="{...props, title: ''}">
                  <v-chip :prepend-icon="item.raw.icon" :color="item.raw.color" density="comfortable">
                    {{ item.title }}
                  </v-chip>
                </v-list-item>
              </template>
            </v-select>
            <v-switch
              v-model="formData.active"
              :label="formData.active ? t('projects.active') : t('projects.notActive')"
              :color="formData.active ? 'success' : 'default'" />
          </v-col>
        </v-row>
      </v-form>
    </v-card-item>
    <v-card-actions class="px-6 pb-6">
      <v-spacer />
      <v-btn @click="cancel">
        {{ t('btn.cancel') }}
      </v-btn>
      <v-btn color="primary" variant="flat" @click="submit">
        {{ t('btn.submit') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>