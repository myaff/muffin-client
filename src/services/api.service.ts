import axios from "axios";
import { formatISO, isDate } from "date-fns";
import qs from "qs";

export abstract class ApiService {
  static api = axios.create({
    baseURL: import.meta.env.VITE_BASE_API,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  static setAuthToken(token: string) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  static removeAuthToken() {
    delete this.api.defaults.headers.common['Authorization'];
  }

  formatDate(date: string | Date) {
    const dateInstance = isDate(date) ? date as Date : new Date(date);
    return formatISO(dateInstance);
  }

  stringifyParams(params?: any) {
    return params
      ? qs.stringify(params, {
        addQueryPrefix: true,
        arrayFormat: 'repeat',
      })
      : '';
  }
}