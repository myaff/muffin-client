/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import createVuetify from './vuetify'
import pinia from '../store'
import router from '../router'

// Locales
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n';
import { useI18n } from 'vue-i18n';
import i18n from '../i18n';

// Dates
import DateFnsAdapter from '@date-io/date-fns';
import enUS from 'date-fns/locale/en-US';
import ru from 'date-fns/locale/ru';

const vuetify = createVuetify({
  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n }),
  },
  date: {
    adapter: DateFnsAdapter,
    locale: {
      en: enUS,
      ru: ru,
    },
  },
});

// Types
import type { App } from 'vue'

export function registerPlugins (app: App) {
  app
    .use(i18n)
    .use(vuetify)
    .use(router)
    .use(pinia)
}
