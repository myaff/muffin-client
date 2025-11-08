<script setup lang="ts">
import { UiAlert } from '@/models/ui.model';
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import ProjectCreateForm from '@/components/ProjectCreate.vue';
import { useProjectsStore } from '@/store/projects';
import { Project, ProjectCreate } from '@/models/projects.model';

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
const create = (formData: ProjectCreate) => {
  isSending.value = true;
  projectsStrore.create(formData)
    .catch(e => sendingError.value = getErrorOrDefault(e))
    .finally(() => creationIsOpen.value = false);
}
const cancel = () => {
  creationIsOpen.value = false;
}
const getErrorOrDefault = (e: any) => {
  return {
    title: e?.title ?? t('error.unknown.title'),
    message: e?.message || e?.errorMessage || t('error.unknown.message'),
  };
}
</script>

<template>
  <div class="page w-100 align-center justify-center">
    <v-row v-if="!isLoading && list.length">
      <v-col v-for="item in list" :key="item.id" cols="4">
        <v-card
          :title="item.title"
          :subtitle="`${item.client.orgform.shortName} «${item.client.name}»`"
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
    <v-dialog v-model="creationIsOpen" width="640">
      <template v-if="!sendingError">
        <project-create-form @cancel="cancel" @submit="create" />
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
    <v-dialog v-model="detailIsOpen" width="800">
      <router-view />
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