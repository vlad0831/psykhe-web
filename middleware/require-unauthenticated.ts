import { Middleware } from '@nuxt/types';

const requireUnauthenticated: Middleware = (context) => {
  if (context.$auth.loggedIn) {
    return context.redirect('/browse');
  }
};

export default requireUnauthenticated;
