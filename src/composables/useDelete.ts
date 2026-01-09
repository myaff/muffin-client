import { UiAlert } from "@/models/ui.model";
import { EntityStore } from "./useEntityStore";
import { ref, watch } from "vue";
import { BaseContentEntity } from "@/models/common.model";

export interface CreateUpdteConfig<T extends BaseContentEntity, C = T, U = C> {
  store: Pick<EntityStore<T, C, U>, 'remove'>;
  onError: (e: any) => UiAlert;
  onDelete?: () => any;
}
export default function useDelete<T extends BaseContentEntity>(config: CreateUpdteConfig<T>) {
  const { store, onError, onDelete } = config;
  const isDeleting = ref(false);
  const deletingError = ref<UiAlert | null>(null);
  const deletionIsOpen = ref(false);
  const entityToDelete = ref<T['id'] | null>(null);

  const doDelete = (id: T['id']) => {
    isDeleting.value = true;
    store.remove(id)
      .then(() => {
        deletionIsOpen.value = false;
        entityToDelete.value = null;
        if (onDelete) onDelete();
      })
      .catch(e => deletingError.value = onError(e))
      .finally(() => isDeleting.value = false);
  }

  const cancel = () => {
    deletionIsOpen.value = false;
    if (entityToDelete.value) entityToDelete.value = null;
    if (deletingError.value) deletingError.value = null;
  }

  function openDeletion(id: T['id']) {
    entityToDelete.value = id;
    deletionIsOpen.value = true;
  }

  watch(deletionIsOpen, value => {
    if (!value) cancel();
  })

  return {
    isDeleting,
    deletingError,
    deletionIsOpen,
    entityToDelete,
    cancel,
    openDeletion,
    doDelete,
  }
}