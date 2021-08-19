import { Middleware } from '@nuxt/types';

const requireProfileComplete: Middleware = (context) => {
  if (!context.$auth.user.nags.profile) {
    return context.redirect('/account');
  }
};

export default requireProfileComplete;
