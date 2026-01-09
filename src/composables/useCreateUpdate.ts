import { UiAlert } from "@/models/ui.model";
import { EntityStore } from "./useEntityStore";
import { ref, watch } from "vue";
import { BaseContentEntity } from "@/models/common.model";

export interface CreateUpdteConfig<T extends BaseContentEntity, C = T, U = C> {
  store: Pick<EntityStore<T, C, U>, 'create' | 'update'>;
  onError: (e: any) => UiAlert;
  onCreate?: () => any;
  onUpdate?: () => any;
}
export default function useCreateUpdate<T extends BaseContentEntity, C = T, U = C>(config: CreateUpdteConfig<T, C, U>) {
  const { store, onError, onCreate, onUpdate } = config;
  const isSending = ref(false);
  const sendingError = ref<UiAlert | null>(null);
  const creationIsOpen = ref(false);
  const entityToEdit = ref<T | null>(null);

  const create = (formData: C) => {
    isSending.value = true;
    store.create(formData)
      .then(() => {
        creationIsOpen.value = false;
        entityToEdit.value = null;
        if (onCreate) onCreate();
      })
      .catch(e => sendingError.value = onError(e))
      .finally(() => isSending.value = false);
  }

  const update = (formData: U) => {
    if (!entityToEdit.value) return;
    isSending.value = true;
    store.update(entityToEdit.value.id, formData)
      .then(() => {
        creationIsOpen.value = false;
        entityToEdit.value = null;
        if (onUpdate) onUpdate();
      })
      .catch(e => sendingError.value = onError(e))
      .finally(() => {
        isSending.value = false;
      })
  }

  const cancel = () => {
    creationIsOpen.value = false;
    if (entityToEdit.value) entityToEdit.value = null;
    if (sendingError.value) sendingError.value = null;
  }

  function openCreation() {
    creationIsOpen.value = true;
  }

  function openEdition(entity: T) {
    entityToEdit.value = entity;
    creationIsOpen.value = true;
  }

  watch(creationIsOpen, value => {
    if (!value) cancel();
  })

  return {
    isSending,
    sendingError,
    creationIsOpen,
    entityToEdit,
    create,
    update,
    cancel,
    openCreation,
    openEdition,
  }
}