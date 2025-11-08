import { Task, TaskCreate, TaskUpdate } from "@/models/tasks.model";
import { TaskService } from "@/services/tasks.service";
import { defineStore } from "pinia";
import { onMounted, ref, watch } from "vue";
import { useUserStore } from "./user";

export const useTasksStore = defineStore('tasks', () => {
  const service = new TaskService();
  const list = ref<Task[]>([]);
  const isLoading = ref(false);
  const userStore = useUserStore();

  watch(() => userStore.accessToken, value => {
    if (!value) list.value = [];
  })

  onMounted(() => {
    if (!list.value.length && !isLoading.value) fetchList();
  })

  function fetchList() {
    isLoading.value = true;
    return service.findAll()
      .then(data => {
        if (data.length) list.value = data;
      })
      .finally(() => isLoading.value = false);
  }

  function fetchDetail(id: number) {
    return service.findOne(id);
  }

  function create(formData: TaskCreate) {
    return service.create(formData)
      .then(data => {
        fetchList();
        return data;
      });
  }

  function update(id: number, formData: TaskUpdate) {
    return service.update(id, formData).then(fetchList);
  }

  return { list, fetchList, fetchDetail, create, update };
});