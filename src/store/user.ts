import { defineStore } from "pinia";
import { useLocalStorage } from '@vueuse/core';
import { Ref, computed } from "vue";
import { Token, User, UserSignIn, UserSignUp } from "@/models/user.model";
import { isBefore } from "date-fns";
import { UserService } from "@/services/user.service";

const defaultTokenData = {
  token: '',
  expiresAt: '',
};
const defaultUserData = {
  id: 0,
  email: '',
  firstName: '',
  lastName: '',
  middleName: null,
  currency: { id: 'RUB' },
  lang: 'ru',
} as User;
export const useUserStore = defineStore('user', () => {
  const accessToken: Ref<Token> = useLocalStorage('accessToken', defaultTokenData);
  const refreshToken: Ref<Token> = useLocalStorage('refreshToken', defaultTokenData);
  const user: Ref<User> = useLocalStorage('user', defaultUserData);
  const isAuthorized = computed(() => !!accessToken.value?.token);
  const userService = new UserService();

  const signIn = (formData: UserSignIn) => {
    return userService.signIn(formData).then(data => {
      accessToken.value = data.accessToken;
      refreshToken.value = data.refreshToken;
      UserService.setAuthToken(data.accessToken.token);
      return Promise.resolve();
    });
  }
  const signUp = (formData: UserSignUp) => {
    return userService.signup(formData).then(data => {
      accessToken.value = data.accessToken;
      refreshToken.value = data.refreshToken;
      UserService.setAuthToken(data.accessToken.token);
      return Promise.resolve();
    });
  }
  const refresh = () => {
    UserService.removeAuthToken();
    return userService.refresh(refreshToken.value.token).then(data => {
      accessToken.value = data.accessToken;
      refreshToken.value = data.refreshToken;
      UserService.setAuthToken(data.accessToken.token);
      return Promise.resolve();
    });
  }
  const signOut = () => {
    accessToken.value = defaultTokenData;
    refreshToken.value = defaultTokenData;
    user.value = defaultUserData;
    UserService.removeAuthToken();
  }
  const fetchProfile = () => {
    return userService.fetchProfile().then(data => {
      user.value = data;
      return Promise.resolve();
    });
  }

  const checkIfExpired = (tokenData: Token) => {
    const isExp = isBefore(new Date(tokenData.expiresAt), new Date());
    return isExp;
  }

  const actualizeToken = (token: Ref<Token>) => {
    if (token.value.token && checkIfExpired(token.value)) {
      token.value = defaultTokenData;
    }
  }
  
  const init = async () => {
    actualizeToken(accessToken);
    actualizeToken(refreshToken);
    if (!accessToken.value.token && refreshToken.value.token) await refresh();
    if (accessToken.value.token) {
      UserService.setAuthToken(accessToken.value.token);
      if (!user.value.id) await fetchProfile().catch(signOut);
    }
    else signOut();
  }

  return { accessToken, refreshToken, user, isAuthorized, init, signIn, signUp, signOut };
}) 