import { computed } from "vue";
import { useI18n } from "vue-i18n";

export default function useActivity(t: ReturnType<typeof useI18n>['t']) {
  const activity = computed(() => {
    return [
      {
        key: 'active',
        title: t('activity.active'),
        value: true,
      },
      {
        key: 'all',
        title: t('activity.all'),
        value: null,
      },
      {
        key: 'notActive',
        title: t('activity.notActive'),
        value: false,
      }
    ]
  })

  return { activity };
}