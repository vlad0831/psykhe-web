import { Middleware } from '@nuxt/types';

const requirePtWhenLoggedIn: Middleware = (context) => {
  if (context.$auth.loggedIn && !context.$auth.user.pt_transmitted) {
    return context.redirect('/personality-test');
  }
};

export default requirePtWhenLoggedIn;
