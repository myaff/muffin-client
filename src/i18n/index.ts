import { createI18n, DefineDateTimeFormat } from 'vue-i18n';
import { ru as vtfRu, en as vtfEn } from 'vuetify/locale';
import ru from './ru';
import en from './en';

const messages = {
  en: {
    $vuetify: {
      ...vtfEn,
    },
    ...en,
  },
  ru: {
    $vuetify: {
      ...vtfRu,
    },
    ...ru,
  },
};
const numberFormats = {
  ru: {
    currency: {
      style: 'currency' as const,
      currency: 'RUB' as const,
      currencyDisplay: 'symbol' as const,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  },
};
const ruPluralization = (choice: number, choicesLength: number) => {
  if (choice === 0) return 0;
  const teen = choice > 10 && choice < 20;
  const endsWithOne = choice % 10 === 1;
  if (!teen && endsWithOne) return 1;
  if (!teen && choice % 10 >= 2 && choice % 10 <= 4) return 2;
  return choicesLength < 4 ? 2 : 3
}

const dateTimeFormats: DefineDateTimeFormat = {
  short: { day: '2-digit', month: '2-digit', year: 'numeric' },
  medium: { day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'long' },
  shortTime: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' },
}

export const availableLocales = ['ru', 'en'] as const;
export type AvailableLocales = typeof availableLocales[number];

export default createI18n({
  legacy: false,
  locale: 'ru',
  fallbackLocale: 'en',
  messages,
  numberFormats,
  datetimeFormats: {
    ru: dateTimeFormats,
    en: dateTimeFormats,
  },
  pluralRules: {
    ru: ruPluralization,
  },
});