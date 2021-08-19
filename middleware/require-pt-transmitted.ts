import { Middleware } from '@nuxt/types';

const requirePtTransmitted: Middleware = (context) => {
  if (!context.$auth.user.pt_transmitted) {
    return context.redirect('/personality-test');
  }
};

export default requirePtTransmitted;
