import { Auth } from '@nuxtjs/auth';

declare module 'vuex/types/index' {
  interface Store<S> {
    $auth: Auth;
  }
}
