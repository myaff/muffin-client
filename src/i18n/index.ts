import { createI18n } from 'vue-i18n';
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
      maximumFractionDigits: 0,
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

export const availableLocales = ['ru', 'en'] as const;
export type AvailableLocales = typeof availableLocales[number];

export default createI18n({
  legacy: false,
  locale: 'ru',
  fallbackLocale: 'en',
  messages,
  numberFormats,
  pluralRules: {
    ru: ruPluralization,
  },
});