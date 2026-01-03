import { Project, ProjectCreate, ProjectDetail, ProjectUpdate } from "@/models/projects.model";
import { ProjectsService } from "@/services/projects.service";
import { defineStore } from "pinia";
import { onMounted, reactive, ref, watch } from "vue";
import { useUserStore } from "./user";

export const useProjectsStore = defineStore('projects', () => {
  const service = new ProjectsService();
  const list = ref<Project[]>([]);
  const isLoading = ref(false);
  const detailsMap = reactive<Map<Project['id'], ProjectDetail>>(new Map());
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
    return service.findOne(id).then(data => {
      if (data) detailsMap.set(id, data);
      return data;
    });
  }

  function getDetail(id: Project['id']) {
    if (detailsMap.has(id)) {
      return Promise
        .resolve(detailsMap.get(id) as Project)
        .then(() => fetchDetail(id));
    }
    return fetchDetail(id);
  }

  function create(formData: ProjectCreate) {
    return service.create(formData)
      .then(data => {
        fetchList();
        return data;
      });
  }

  function update(id: number, formData: ProjectUpdate) {
    return service.update(id, formData).then(data => {
      if (data) detailsMap.set(id, data);
      return data;
    });
  }

  return {
    list,
    isLoading,
    fetchList,
    fetchDetail,
    detailsMap,
    getDetail,
    create,
    update,
  };
});