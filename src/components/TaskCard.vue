<script setup lang="ts">
import { Task } from '@/models/tasks.model';
import { PropType } from 'vue';

const props = defineProps({
  task: {
    type: Object as PropType<Task>,
    required: true,
  },
})
const emits = defineEmits(['dragstart', 'dragend', 'click']);
</script>

<template>
  <v-card
    color="grey-darken-3"
    draggable="true"
    @click="emits('click')"
    @dragstart="emits('dragstart')"
    @dragend="emits('dragend')">
    <v-card-item>
      <div class="text-h6">
        {{ task.code + ' ' + task.title }}
      </div>
      <div class="text-subtitle text-medium-emphasis mt-2">
        {{ task.project.title }}
      </div>
    </v-card-item>
    <v-card-actions v-if="$slots.actions">
      <slot name="actions" />
    </v-card-actions>
  </v-card>
</template>