import { ApiService } from "./api.service";
import { AxiosError } from "axios";
import { EntityService, ListService } from "@/models/service.model";
import { Task, TaskCreate, TaskDetail, TaskUpdate } from "@/models/tasks.model";

export class TaskService extends ApiService implements ListService<Task>, EntityService<Task, TaskCreate, TaskUpdate, TaskDetail> {
  resource = '/task';
  create(formData: TaskCreate) {
    return TaskService.api.post<Task>(this.resource, formData)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  update(id: string | number, formData: TaskUpdate) {
    return TaskService.api
      .patch(`${this.resource}/${id}`, formData);
  }

  delete(id: string | number) {
    return TaskService.api.delete(`${this.resource}/${id}`)
  }

  findOne(id: string | number) {
    return TaskService.api
      .get<TaskDetail>(`${this.resource}/${id}`)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  findAll() {
    return TaskService.api
      .get<Task[]>(this.resource)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }
}