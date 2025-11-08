import { Project, ProjectCreate, ProjectUpdate } from "@/models/projects.model";
import { ProjectsService } from "@/services/projects.service";
import { defineStore } from "pinia";
import { onMounted, ref, watch } from "vue";
import { useUserStore } from "./user";

export const useProjectsStore = defineStore('projects', () => {
  const service = new ProjectsService();
  const list = ref<Project[]>([]);
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

  function create(formData: ProjectCreate) {
    return service.create(formData)
      .then(data => {
        fetchList();
        return data;
      });
  }

  function update(id: number, formData: ProjectUpdate) {
    return service.update(id, formData).then(fetchList);
  }

  return { list, isLoading, fetchList, fetchDetail, create, update };
});