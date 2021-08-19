import { Middleware } from '@nuxt/types';

const requirePtNotTransmitted: Middleware = (context) => {
  if (context.$auth.user.pt_transmitted) {
    return context.redirect('/browse');
  }
};

export default requirePtNotTransmitted;
