<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ServerErrors, useVuelidate } from '@vuelidate/core';
import { required, email, minLength } from '@vuelidate/validators';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';
import { ResponseError } from '@/models/common.model';
import { AvailableLocales } from '@/i18n';
import { useAppStore } from '@/store/app';
import { computed } from 'vue';
const { t, te, locale } = useI18n();
const appStore = useAppStore();
const userStore = useUserStore();
const router = useRouter();
const currencies = computed(() => appStore.currencies);
const initialState = {
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  password: '',
  currency: userStore.user.currency.id,
}
const rules = {
  firstName: { required },
  lastName: { required },
  email: { required, email },
  password: { required, minLength: minLength(8) },
  currency: { required },
}
const formData = reactive({ ...initialState });
const externalValidationResults = ref<ServerErrors>({});
const $v = useVuelidate(rules, formData, { $externalResults: externalValidationResults });
if (!currencies.value.length) appStore.fetchCurrencies();
const isLoading = ref(false);
const submit = async () => {
  const isValid = await $v.value.$validate();
  if (!isValid) return;
  isLoading.value = true;
  userStore.signUp({
    ...formData,
    currency: { id: formData.currency },
    lang: locale.value as AvailableLocales,
  })
    .then(() => {
      router.push({ name: 'home' });
    })
    .catch((e: ResponseError) => {
      if (e.errors) {
        externalValidationResults.value = e.errors.reduce((acc, error) => {
          const errors = Object.keys(error.error).reduce((arr, key) => {
            if (te(`errors.${key}`)) arr.push(t(`errors.${key}`));
            else arr.push(error.error[key]);
            return arr;
          }, [] as string []);
          acc[error.property] = errors;
          return acc;
        }, {} as { [key: string]: string[] });
      }
    })
    .finally(() => (isLoading.value = false));
}
</script>

<template>
  <div class="view view-signup text-center">
    <div class="text-h3 mb-8">{{ t('signup.title') }}</div>
    <p class="text-center text-body-1 mb-8">
      {{ t('signup.alternate.text') }}
      <router-link :to="{ name: 'signin' }" class="mx-2">
        {{ t('signup.alternate.btn') }}
      </router-link>
    </p>
    <v-form class="text-left" @keyup.enter="submit">
      <v-text-field
        v-model="$v.firstName.$model"
        :label="t('form.firstName.label')"
        required
        :error-messages="$v.firstName.$errors.map(e => e.$message as string)"
        type="text"
        name="firstName"
        class="mb-4" />
      <v-text-field
        v-model="formData.middleName"
        :label="t('form.middleName.label')"
        type="text"
        name="middleName"
        class="mb-4" />
        <v-text-field
        v-model="$v.lastName.$model"
        :label="t('form.lastName.label')"
        required
        :error-messages="$v.lastName.$errors.map(e => e.$message as string)"
        type="text"
        name="lastName"
        class="mb-4" />
      <v-text-field
        v-model="$v.email.$model"
        :label="t('form.email.label')"
        required
        :error-messages="$v.email.$errors.map(e => e.$message as string)"
        type="email"
        name="email"
        class="mb-4" />
      <v-text-field 
        v-model="$v.password.$model"
        :label="t('form.password.label')"
        required
        :error-messages="$v.password.$errors.map(e => e.$message as string)"
        type="password"
        name="password"
        class="mb-4" />
      <v-combobox
        v-model="$v.currency.$model"
        :items="currencies"
        :label="t('signup.currency')"
        item-value="id"
        item-title="id"
        required
        :error-messages="$v.currency.$errors.map(e => e.$message as string)" />
    </v-form>
    <v-btn
      size="x-large" 
      color="primary"
      :loading="isLoading"
      @click="submit">
      {{ t('btn.submit') }}
    </v-btn>
  </div>
</template>