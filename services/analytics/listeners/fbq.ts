/* eslint-disable @typescript-eslint/no-unused-vars */
import Optionals from '../optionals';
import { OptionalAnalyticsListener } from './interface';
import { AnalyticsEvent, AnalyticsMessage } from '~/types/analytics/events';

interface fbqEvent {
  type: string,
  data: object
}

export class FbqListener extends OptionalAnalyticsListener {
  // Receives the event from the event bus
  async receiveEvent(message: AnalyticsMessage) {
    const translatedMessage = this.translateMessage(message);
    if (translatedMessage) {
      const fbq = await this.optionals.requireOptional('facebook');
      fbq('track', translatedMessage.type, translatedMessage.data);
    }
  }

  translateMessage(message: AnalyticsMessage): fbqEvent | undefined {
    switch (message.type) {
      case AnalyticsEvent.PAGEVIEW:
        return {
          type: 'PageView',
          data: {}
        };

      case AnalyticsEvent.TRANSACTION:
        return {
          type: 'Purchase',
          data: {
            currency: 'GBP',
            content_type: 'product',
            value: message.data.price,
            content_name: message.data.product.name,
            content_ids: message.data.product.identifier
          }
        };

      default:
        return undefined;
    }
  }
}
