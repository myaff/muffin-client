<script setup lang="ts">
import { UiAlert } from '@/models/ui.model';
import { reactive, ref, watch, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import TaskCreateForm from '@/components/TaskCreate.vue';
import TaskUpdateStatusForm from '@/components/TaskUpdateStatus.vue';
import { useTasksStore } from '@/store/tasks';
import { TaskCreate, Task } from '@/models/tasks.model';
import { useAppStore } from '@/store/app';
import { Status, StatusGroup, StatusGroupColor } from '@/models/status.model';
import TaskCard from '@/components/TaskCard.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const tasksStore = useTasksStore();
const list = computed(() => tasksStore.list);
const isLoading = ref(false);
const loadingError = ref<UiAlert | null>(null);

const fetchList = async () => {
  isLoading.value = true;
  tasksStore.fetchList()
    .catch(e => loadingError.value = getErrorOrDefault(e))
    .finally(() => isLoading.value = false);
}

const detailIsOpen = ref(false);
if (route.params?.id) detailIsOpen.value = true;
watch(detailIsOpen, value => {
  if (!value) router.push({ name: 'tasks' });
});
watch(route, async value => {
  detailIsOpen.value = !!value.params.id;
});

function openDetail(item: Task) {
  router.push({
    name: 'task',
    params: { id: item.id },
  });
  detailIsOpen.value = true;
}

// view settings
const appStore = useAppStore();
const statuses = computed(() => appStore.statuses);
const search = ref('');

const grouppedTasks = computed(() => {
  return list.value.reduce((acc, task) => {
    if (!acc[task.status.group]) acc[task.status.group] = [];
    if (matchFilters(task)) acc[task.status.group].push(task);
    return acc;
  }, {} as { [key in StatusGroup]: Task[] })
})

const matchFilters = (task: Task) => {
  if (!search.value) return true;
  const reg = new RegExp(search.value, 'im');
  return reg.test(task.code) || reg.test(task.title);
}

interface StatusBoardColumn {
  key: StatusGroup;
  title: string;
  statuses: Status[];
}
interface TasksBoardColumn extends StatusBoardColumn {
  tasks: Task[];
  count: number;
}
type StatusBoard = { [key in StatusGroup]: StatusBoardColumn };
type TaskBoard = { [key in StatusGroup]: TasksBoardColumn };
const board = computed(() => {
  return statuses.value.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = {
        key: item.group,
        title: t(`tasks.statusGroups.${item.group}`),
        tasks: grouppedTasks.value[item.group] || [],
        count: grouppedTasks.value[item.group]?.length || 0,
        statuses: [item],
      };
    } else acc[item.group].statuses.push(item);
    return acc;
  }, {} as TaskBoard);
});

onMounted(() => {
  fetchList();
  if (!statuses.value.length) appStore.fetchStatuses();
});

// creation
const isSending = ref(false);
const sendingError = ref<UiAlert | null>(null);
const creationIsOpen = ref(false);
const create = (formData: TaskCreate) => {
  isSending.value = true;
  tasksStore.create(formData)
    .catch(e => sendingError.value = getErrorOrDefault(e))
    .finally(() => {
      isSending.value = false;
      creationIsOpen.value = false;
    });
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

// update status
const isUpdating = ref(false);
const updatingError = ref<UiAlert | null>(null);
const updatingIsOpen = ref(false);
const updateFormData = reactive({
  task: null as Task | null,
  statuses: board.value as Partial<StatusBoard>,
});
const boardDropActive = ref<StatusBoardColumn | null>(null);
const cardDragActive = ref<Task | null>(null);

const onDrop = () => {
  if (!cardDragActive.value || !boardDropActive.value) return;
  openUpdateStatus(cardDragActive.value, { [boardDropActive.value.key]:boardDropActive.value})
  boardDropActive.value = null;
  cardDragActive.value = null;
}
const updateDialogWidth = computed(() => Math.max(Object.keys(updateFormData.statuses).length * 200, 320));
const openUpdateStatus = (task: Task, statuses: Partial<StatusBoard>) => {
  updateFormData.task = task;
  updateFormData.statuses = statuses;
  updatingIsOpen.value = true;
}
const closeUpdateStatus = () => {
  updatingIsOpen.value = false;
  updateFormData.task = null;
  updateFormData.statuses = board.value;
  isUpdating.value = false;
}
const updateStatus = (formData: { task: Task; status: Status }) => {
  isUpdating.value = true;
  tasksStore.update(formData.task.id, { status: formData.status })
    .then(() => tasksStore.fetchList())
    .catch(e => updatingError.value = getErrorOrDefault(e))
    .finally(closeUpdateStatus);
}
</script>

<template>
  <div class="page w-100 align-center justify-center">
    <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" hide-details class="mb-8" />
    <v-row v-if="!isLoading && list.length" align="stretch" class="fill-height">
      <v-col v-for="(column, key) in board" :key="key" cols="12" :lg="12 / Object.keys(board).length">
        <v-sheet rounded="lg" class="column fill-height pa-2">
          <div class="column-heading px-3 mb-4 text-caption font-weight-bold">
            <span class="text-uppercase">
            {{ column.title }}
            </span>
            <span class="text-grey">
            {{ column.count }}
            </span>
          </div>
          <task-card
            v-for="task in column.tasks"
            :key="task.id"
            :task="task"
            class="column-card mb-2"
            :class="{ dragging: cardDragActive?.id === task.id }"
            @click="openDetail(task)"
            @dragstart="cardDragActive = task"
            @dragend="cardDragActive = null">
            <template #actions>
              <v-chip
                hover
                :color="StatusGroupColor[task.status.group]"
                @click.stop="openUpdateStatus(task, board)">
                {{ task.status.title }}
              </v-chip>
            </template>
          </task-card>
          <div
            dropzone="move"
            droppable
            class="column-dropzone"
            :class="{ dragover: boardDropActive?.title === column.title }"
            @dragover.prevent="boardDropActive = column"
            @dragleave="boardDropActive = null"
            @drop="onDrop">
          </div>
        </v-sheet>
      </v-col>
      <v-btn icon="mdi-plus" size="x-large" color="primary" class="add-btn" @click="creationIsOpen = true" />
    </v-row>
    <v-layout v-else full-height class="align-center justify-center">
      <v-progress-circular v-if="isLoading" indeterminate />
      <v-alert v-else-if="loadingError" :title="loadingError?.title" :text="loadingError.message" type="error" max-width="640" />
      <v-alert v-else :title="t('tasks.empty')" max-width="640">
        <v-btn color="primary" size="large" class="mt-4" @click="creationIsOpen = true">
          {{ t('tasks.add') }}
        </v-btn>
      </v-alert>
    </v-layout>
    <v-dialog v-model="creationIsOpen" width="640">
      <template v-if="!sendingError">
        <task-create-form @cancel="cancel" @submit="create" />
        <v-overlay v-model="isSending" contained class="align-center justify-center">
          <v-progress-circular indeterminate />
        </v-overlay>
      </template>
      <v-alert v-else :title="sendingError?.title" :text="sendingError?.message" type="error" />
    </v-dialog>
    <v-dialog v-model="updatingIsOpen" :width="updateDialogWidth">
      <template v-if="!updatingError">
        <task-update-status-form
          v-if="updateFormData.task && updateFormData.statuses"
          :task="updateFormData.task"
          :list="updateFormData.statuses"
          @cancel="closeUpdateStatus()"
          @submit="updateStatus" />
        <v-overlay v-model="isUpdating" contained class="align-center justify-center">
          <v-progress-circular indeterminate />
        </v-overlay>
      </template>
      <v-alert v-else :title="updatingError?.title" :text="updatingError?.message" type="error" />
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
.column {
  display: flex;
  flex-direction: column;
  &-heading {
    display: flex;
    justify-content: space-between;
    flex: 0 0 auto;
  }
  &-card {
    flex: 0 0 auto;

    &.dragging {
      opacity: 0.5;
    }
  }
  &-dropzone {
    flex: 1 1 100%;
    border-radius: inherit;
    transition: background .3s;

    &.dragover {
      background: rgba(var(--v-theme-primary-darken-1), 0.1);
    }
  }
}
.close-dialog {
  position: absolute;
  top: 0;
  right: 0;
}
</style>