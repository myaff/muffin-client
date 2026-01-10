<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: '',
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['update:model-value', 'confirm', 'cancel']);
const { t } = useI18n();
const cancel = () => {
  emits('cancel');
  emits('update:model-value', false);
}
const confirm = () => {
  emits('confirm');
  emits('update:model-value', false);
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    width="90vw"
    max-width="320"
    @update:model-value="e=> emits('update:model-value', e)">
    <v-card :title="title || t('deletion.title')">
      <v-card-item>
        <p class="text-body-1">
          <slot>{{ title || t('deletion.text') }}</slot>
        </p>
      </v-card-item>
      <v-card-actions>
        <v-btn color="error" variant="flat" :text="t('btn.ok')" @click="confirm" />
        <v-btn color="surface-variant" variant="outlined" :text="t('btn.cancel')" @click="cancel" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>