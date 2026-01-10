<script setup lang="ts">
import { useSwiper } from 'swiper/vue';
const props = defineProps({
  hideLocked: {
    type: Boolean,
    default: false,
  },
})
const swiper = useSwiper();
</script>

<template>
  <div v-if="!hideLocked || !swiper.isLocked" class="swiper-navigation">
    <v-btn
      icon="mdi-chevron-left"
      variant="plain"
      size="40"
      :disabled="swiper.isBeginning || swiper.isLocked"
      @click="swiper.slidePrev()" />
    <v-btn
      icon="mdi-chevron-right"
      variant="plain"
      size="40"
      :disabled="swiper.isEnd || swiper.isLocked"
      @click="swiper.slideNext()" />
  </div>
</template>