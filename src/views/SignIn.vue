<script setup lang="ts">
import { reactive, ref, Ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, email, minLength } from '@vuelidate/validators';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';
import { UiAlert } from '@/models/ui.model';
import { watch } from 'vue';
const { t, te } = useI18n();

const userStore = useUserStore();
const router = useRouter();
const initialState = {
  email: 'tost@tost.tost',
  password: 'IamTostTost',
}
const rules = {
  email: { required, email },
  password: { required, minLength: minLength(8) },
}
const formData = reactive({ ...initialState });
const $v = useVuelidate(rules, formData);
const isLoading = ref(false);
const resError: Ref<UiAlert | null> = ref(null);
const showError = ref(false);
watch(resError, value => (showError.value = !!value));
const submit = async () => {
  const isValid = await $v.value.$validate();
  if (!isValid) return;
  isLoading.value = true;
  userStore.signIn(formData)
    .then(() => {
      router.push({ name: 'home' });
    })
    .catch((error: UiAlert) => {
      resError.value = {
        title: te(`error.${error.title}`) ? t(`error.${error.title}.title`) : t('error.unknown.title'),
        message: te(`error.${error.title}`) ? t(`error.${error.title}.message`) : t('error.unknown.message')
      }
    })
    .finally(() => (isLoading.value = false));
}
</script>

<template>
  <div class="view view-signin text-center">
    <div class="text-h3 mb-8">{{ t('signin.title') }}</div>
    <p class="text-center text-body-1 mb-8">
      {{ t('signin.alternate.text') }}
      <router-link :to="{ name: 'signup' }" class="mx-2">
        {{ t('signin.alternate.btn') }}
      </router-link>
    </p>
    <v-form class="text-left" @keyup.enter="submit">
      <v-text-field
        v-model="formData.email"
        :label="t('form.email.label')"
        required
        :error-messages="$v.email.$errors.map(e => e.$message as string)"
        type="email"
        class="mb-4"
        @blur="$v.email.$touch" />
      <v-text-field 
        v-model="formData.password"
        :label="t('form.password.label')"
        required
        :error-messages="$v.password.$errors.map(e => e.$message as string)"
        type="password"
        class="mb-4"
        @blur="$v.password.$touch" />
    </v-form>
    <v-btn
      size="x-large" 
      color="primary"
      :loading="isLoading"
      @click="submit">
      {{ t('btn.submit') }}
    </v-btn>
    <v-bottom-sheet v-model="showError" inset>
      <v-alert :title="resError?.title" type="error">
        {{ resError?.message }}
      </v-alert>
    </v-bottom-sheet>
  </div>
</template>