import { Task, TaskCreate, TaskDetail, TaskUpdate } from "@/models/tasks.model";
import { TaskService } from "@/services/tasks.service";
import { defineStore } from "pinia";
import { onMounted, ref, watch, reactive } from "vue";
import { useUserStore } from "./user";

export const useTasksStore = defineStore('tasks', () => {
  const service = new TaskService();
  const list = ref<Task[]>([]);
  const isLoading = ref(false);
  const detailsMap = reactive<Map<Task['id'], TaskDetail>>(new Map());
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

  function fetchDetail(id: Task['id']) {
    return service.findOne(id).then(data => {
      if (data) detailsMap.set(id, data);
      return data;
    });
  }

  function getDetail(id: Task['id']) {
    if (detailsMap.has(id)) {
      return Promise
        .resolve(detailsMap.get(id) as TaskDetail)
        .then(() => fetchDetail(id));
    }
    return fetchDetail(id);
  }

  function create(formData: TaskCreate) {
    return service.create(formData);
  }

  function update(id: Task['id'], formData: TaskUpdate) {
    return service.update(id, formData)
      .then(data => {
        if (data) detailsMap.set(id, data);
        return data;
      });
  }

  return {
    list,
    detailsMap,
    isLoading,
    fetchList,
    getDetail,
    fetchDetail,
    create,
    update,
  };
});