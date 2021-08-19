import { AnalyticsListener } from './listeners/interface';

import { AnalyticsEvent, AnalyticsMessage } from '~/types/analytics/events';

import eventBus from '~/plugins/eventBus';

let initialListenersSubscribed = false;
const initialListenersSubscribedCallbacks: (() => void)[] = [];

export const AnalyticsService = {
  publish(message: AnalyticsMessage) {
    const eventChannel = 'analytics:' + message.type;

    this.whenInitialListenersSubscribed(() => {
      eventBus.$emit(eventChannel, message);
      eventBus.$emit('analytics:*', message);
    });
  },


  subscribe(listener: AnalyticsListener, channels?: AnalyticsEvent[]) {
    if (channels && channels.length) {
      channels.forEach((channel) => {
        const eventChannel = 'analytics:' + channel;
        eventBus.$on(eventChannel, (message: AnalyticsMessage) => {
          listener.receiveEvent(message);
        });
      });
    } else {
      eventBus.$on('analytics:*', (message: AnalyticsMessage) => {
        listener.receiveEvent(message);
      });
    }
  },

  setInitialListenersSubscribed() {
    initialListenersSubscribed = true;
    initialListenersSubscribedCallbacks.forEach((callback) => callback());
  },

  whenInitialListenersSubscribed(callback: () => void) {
    if (!initialListenersSubscribed) {
      initialListenersSubscribedCallbacks.push(callback);
    } else {
      callback();
    }
  }
};
