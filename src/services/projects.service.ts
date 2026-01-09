import { ApiService } from "./api.service";
import { AxiosError } from "axios";
import { EntityService, ListService } from "@/models/service.model";
import { Project, ProjectCreate, ProjectDetail, ProjectUpdate } from "@/models/projects.model";
import { PaginatableList } from "@/models/common.model";

export class ProjectsService extends ApiService implements ListService<Project>, EntityService<Project, ProjectCreate, ProjectUpdate, ProjectDetail> {
  resource = '/project';
  create(formData: ProjectCreate) {
    return ProjectsService.api.post<ProjectDetail>(this.resource, formData)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  update(id: string | number, formData: ProjectUpdate) {
    return ProjectsService.api
      .patch<ProjectDetail>(`${this.resource}/${id}`, formData)
      .then((res) => res.data);
  }

  delete(id: string | number) {
    return ProjectsService.api.delete(`${this.resource}/${id}`)
  }

  findOne(id: string | number) {
    return ProjectsService.api
      .get<ProjectDetail>(`${this.resource}/${id}`)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  findAll() {
    return ProjectsService.api
      .get<PaginatableList<Project>>(this.resource)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }
}