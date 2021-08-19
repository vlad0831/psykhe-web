import { Context } from '@nuxt/types';
import { NuxtAxiosInstance } from '@nuxtjs/axios';

// eslint-disable-next-line import/no-mutable-exports
let $axios: NuxtAxiosInstance;
let gotToken: boolean;

export function initializeAxios(context: Context) {
  $axios = context.$axios;

  $axios.onRequest((config) => {
    if (!gotToken && config.url?.match(/^\//) && !config.url?.match(/^\/sanctum\//)) {
      return $axios
        .$get('/sanctum/csrf-cookie', {
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          },
          withCredentials: true
        })
        .then(async () => {
          gotToken = true;
          return config;
        });
    }
  });

  $axios.onError((error) => {
    if (error.request?.responseURL) {
      const url = new URL(error.request.responseURL);

      if (url.pathname === `${process.env.NUXT_ENV_API_ROUTE}/user`) {
        throw error;
      }
    }

    if (error.response?.status === 401) {
      context.$auth.reset();
      context.redirect('/sign-in');
    }

    throw error;
  });
}

export { $axios };
