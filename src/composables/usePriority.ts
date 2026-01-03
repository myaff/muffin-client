import { TaskPriority } from "@/models/tasks.model";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

export default function usePriority(t: ReturnType<typeof useI18n>['t']) {
  const configMap = new Map([
    [TaskPriority.HIGHEST, { color: 'red', icon: 'mdi-chevron-double-up' }],
    [TaskPriority.HIGH, { color: 'red', icon: 'mdi-chevron-up' }],
    [TaskPriority.MEDIUM, { color: 'orange', icon: 'mdi-equal' }],
    [TaskPriority.LOW, { color: 'blue', icon: 'mdi-chevron-down' }],
    [TaskPriority.LOWEST, { color: 'blue', icon: 'mdi-chevron-double-down' }],
  ])
  const priorities = computed(() => {
    return Object.values(TaskPriority)
      .filter(key => typeof key === 'number')
      .map(key => {
        const config = configMap.get(key)
          ?? {
            color: 'orange',
            icon: 'mdi-equal',
          };
        return {
          value: key,
          title: t(`priority.${TaskPriority[key]}`),
          ...config,
        };
      });
  })

  return { priorities };
}