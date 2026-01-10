<script setup lang="ts">
import { UiAlert } from '@/models/ui.model';
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import ProjectCreateUpdateForm from '@/components/project/ProjectCreateUpdate.vue';
import { useProjectsStore } from '@/store/projects';
import { Project, ProjectCreate, ProjectUpdate } from '@/models/projects.model';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const projectsStrore = useProjectsStore();
const list = computed(() => projectsStrore.list);
const isLoading = computed(() => projectsStrore.isLoading);
const loadingError = ref<UiAlert | null>(null);

async function fetchList() {
  projectsStrore.fetchList()
    .catch(e => loadingError.value = getErrorOrDefault(e));
}
if (!list.value.length && !isLoading.value) fetchList();

const detailIsOpen = ref(false);
if (route.params?.id) detailIsOpen.value = true;
watch(detailIsOpen, value => {
  if (!value) router.push({ name: 'projects' });
});
watch(route, async value => {
  detailIsOpen.value = !!value.params.id;
});

function openDetail(item: Project) {
  router.push({
    name: 'project',
    params: { id: item.id },
  });
  detailIsOpen.value = true;
}

// creation
const isSending = ref(false);
const sendingError = ref<UiAlert | null>(null);
const creationIsOpen = ref(false);
const projectToEdit = ref<Project | null>(null);
const create = (formData: ProjectCreate) => {
  isSending.value = true;
  projectsStrore.create(formData)
    .catch(e => sendingError.value = getErrorOrDefault(e))
    .finally(() => creationIsOpen.value = false);
}
const update = (formData: ProjectUpdate) => {
  if (!projectToEdit.value) return;
  isSending.value = true;
  projectsStrore.update(projectToEdit.value.id, formData)
    .then(() => fetchList())
    .catch(e => sendingError.value = getErrorOrDefault(e))
    .finally(() => {
      isSending.value = false;
      creationIsOpen.value = false;
      projectToEdit.value = null;
    })
}
const cancel = () => {
  creationIsOpen.value = false;
  if (projectToEdit.value) projectToEdit.value = null;
}
const getErrorOrDefault = (e: any) => {
  return {
    title: e?.title ?? t('error.unknown.title'),
    message: e?.message || e?.errorMessage || t('error.unknown.message'),
  };
}
function onProjectEdit(project: Project) {
  projectToEdit.value = project;
  creationIsOpen.value = true;
}
</script>

<template>
  <div class="page w-100 align-center justify-center">
    <v-row v-if="!isLoading && list.length">
      <v-col v-for="item in list" :key="item.id" cols="4">
        <v-card
          :title="item.title"
          @click="openDetail(item)" />
      </v-col>
      <v-btn icon="mdi-plus" size="x-large" color="primary" class="add-btn" @click="creationIsOpen = true" />
    </v-row>
    <v-layout v-else full-height class="align-center justify-center">
      <v-progress-circular v-if="isLoading" indeterminate />
      <v-alert v-else-if="loadingError" :title="loadingError?.title" :text="loadingError.message" type="error" max-width="640" />
      <v-alert v-else :title="t('projects.empty')" max-width="640">
        <v-btn color="primary" size="large" class="mt-4" @click="creationIsOpen = true">
          {{ t('projects.add') }}
        </v-btn>
      </v-alert>
    </v-layout>
    <v-dialog v-model="creationIsOpen" width="90vw" max-width="1280">
      <template v-if="!sendingError">
        <ProjectCreateUpdateForm
          :project="projectToEdit"
          @cancel="cancel"
          @submit="(e: ProjectCreate) => !!projectToEdit ? update(e) : create(e)" />
        <v-overlay v-model="isSending" contained class="align-center justify-center">
          <v-progress-circular indeterminate />
        </v-overlay>
      </template>
      <v-alert v-else :title="sendingError?.title" :text="sendingError?.message" type="error" />
      <v-btn
        v-if="creationIsOpen && !isSending"
        icon="mdi-close"
        class="close-dialog"
        variant="plain"
        @click="creationIsOpen = false" />
    </v-dialog>
    <v-dialog v-model="detailIsOpen" width="90vw" max-width="1280">
      <router-view @edit="onProjectEdit" />
      <v-btn v-if="detailIsOpen"
        icon="mdi-close"
        variant="plain"
        class="close-dialog"
        @click="detailIsOpen = false" />
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
.close-dialog {
  position: absolute;
  top: 0;
  right: 0;
}
</style>