import { Task, TaskCreate, TaskDetail, TaskUpdate } from "@/models/tasks.model";
import { TaskService } from "@/services/tasks.service";
import { defineStore } from "pinia";
import { onMounted, watch } from "vue";
import { useUserStore } from "./user";
import useListStore from "@/composables/useListStore";
import useEntityStore from "@/composables/useEntityStore";

export const useTasksStore = defineStore('tasks', () => {
  const service = new TaskService();
  const userStore = useUserStore();
  const { list, isLoading, fetchList } = useListStore<Task>(service);
  const {
    detailsMap,
    getDetail,
    create,
    update,
  } = useEntityStore<Task, TaskCreate, TaskUpdate, TaskDetail>(service, fetchList);

  watch(() => userStore.accessToken, value => {
    if (!value) {
      list.value = [];
      detailsMap.value.clear();
    }
  })

  onMounted(() => {
    if (!list.value.length && !isLoading.value) fetchList();
  })

  return {
    list,
    detailsMap,
    isLoading,
    fetchList,
    getDetail,
    create,
    update,
  };
});