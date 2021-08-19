import { Context, Plugin } from '@nuxt/types';

import { AnalyticsService } from '~/services/analytics/manager';
import { AnalyticsEvent } from '~/types/analytics/events';

import { GtmListener } from '~/services/analytics/listeners/gtm';
import { FbqListener } from '~/services/analytics/listeners/fbq';

import { LogInfoListener } from '~/services/analytics/listeners/log-info';

import Optionals from '~/services/analytics/optionals';
import { routerStore } from '~/store';

const routeAnalytics: Plugin = (context, inject) => {
  const optionals = new Optionals();

  registerOptionals(optionals, context);
  registerListeners(optionals);

  inject('optionals', optionals);

  context.app.router?.beforeEach((to, from, next) => {
    // If the last route wasn't external, set the last known route
    if (from.name !== null) {
      routerStore.pushRouteToHistory({
        route: from,
        scrollPosition: { scrollX: window.scrollX, scrollY: window.scrollY }
      });
    }

    // Send page views to external analytics
    AnalyticsService.publish({
      type: AnalyticsEvent.PAGEVIEW,
      data: {
        page: to.fullPath
      }
    });

    next();
  });
};

const registerListeners = (optionals: Optionals) => {
  // Register listeners to analytics channel
  AnalyticsService.subscribe(new GtmListener(optionals));
  AnalyticsService.subscribe(new FbqListener(optionals));

  // Register console output listeners if debug enabled
  if (process.env.ANALYTICS_DEBUG_ENABLED && ['true', '1'].includes(process.env.ANALYTICS_DEBUG_ENABLED)) {
    AnalyticsService.subscribe(new LogInfoListener());
  }

  // Mark the initial listeners are registered
  AnalyticsService.setInitialListenersSubscribed();
};

const registerOptionals = (optionals: Optionals, context: Context) => {
  // Register GTM
  if (!optionals.hasOptional('gtm')) {
    optionals.addOptional('gtm', () => context.$gtm.push);
  }

  // Register FB pixel
  if (!optionals.hasOptional('facebook')) {
    if (context.$fb?.options?.pixelId != 'disabled') {
      optionals.addOptional('facebook', () => context.$fb.fbq);
    }
  }
};

declare module 'vue/types/vue' {
  interface Vue {
    $optionals: Optionals;
  }
}

declare module '@nuxt/types' {
  interface Context {
    $fb: any;
    $gtm: any;
  }
}

export default routeAnalytics;
