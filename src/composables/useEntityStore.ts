import { BaseContentEntity } from "@/models/common.model";
import { EntityService } from "@/models/service.model";
import { Ref, ref } from "vue";

export default function useEntityStore<T extends BaseContentEntity, C = T, U = C, D extends BaseContentEntity = T>(service: EntityService<T, C, U, D>, onUpdate: () => any) {
  const detailsMap: Ref<Map<D['id'], D>> = ref(new Map());

  function fetchDetail(id: T['id']) {
      return service.findOne(id).then(data => {
        if (data) detailsMap.value.set(id, data);
        return data;
      });
    }

  function getDetail(id: T['id']) {
    const existing = detailsMap.value.get(id);
    if (existing) {
      return Promise
        .resolve(existing)
        .then(() => fetchDetail(id));
    }
    return fetchDetail(id);
  }

  function create(formData: C) {
    return service.create(formData)
      .then(data => {
        onUpdate();
        return data;
      });
  }

  function update(id: T['id'], formData: U) {
    return service.update(id, formData)
      .then(data => {
        if (data) detailsMap.value.set(id, data);
        onUpdate();
        return data;
      });
  }

  return {
    detailsMap,
    getDetail,
    create,
    update,
  }
}