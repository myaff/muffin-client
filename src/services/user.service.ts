import { Signed, User, UserSignIn, UserSignUp } from "@/models/user.model";
import { ApiService } from "./api.service";
import { AxiosError } from "axios";
import { ResponseError } from "@/models/common.model";

export class UserService extends ApiService {
  resource = '/auth';
  signIn(formData: UserSignIn) {
    return UserService.api
      .post<Signed>(`${this.resource}/signin`, formData)
      .then(res => { return res.data })
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  signup(formData: UserSignUp) {
    return UserService.api
      .post<Signed>(`${this.resource}/signup`, formData)
      .then(res => { return res.data })
      .catch((error: AxiosError<ResponseError>) => {
        throw error.response?.data;
      });
  }

  refresh(token: string) {
    return UserService.api
      .post<Signed>(`${this.resource}/refresh`, { token })
      .then(res => { return res.data })
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  fetchProfile() {
    return UserService.api.get<User>(`${this.resource}/profile`)
    .then(res => { return res.data })
    .catch((error: AxiosError) => {
      throw { title: error.code, message: error.message };
    });
  }
}