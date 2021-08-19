/* eslint-disable @typescript-eslint/no-unused-vars */
import { OptionalAnalyticsListener } from './interface';
import { AnalyticsEvent, AnalyticsMessage } from '~/types/analytics/events';

interface gtmEvent {
  type: string;
  data: object;
}

export class GtmListener extends OptionalAnalyticsListener {
  // Receives the event from the event bus
  async receiveEvent(message: AnalyticsMessage) {
    const translatedMessage = this.translateMessage(message);
    if (translatedMessage) {
      const gtm = await this.optionals.requireOptional('gtm');
      gtm({
        event: translatedMessage.type,
        ...translatedMessage.data
      });
    }
  }

  translateMessage(message: AnalyticsMessage): gtmEvent | undefined {
    switch (message.type) {
      case AnalyticsEvent.BROWSE_EVENT:
      case AnalyticsEvent.HOME_EVENT:
      case AnalyticsEvent.PROFILE_EVENT:
        return {
          type: 'psykhe',
          data: { psykhe: message }
        };

      case AnalyticsEvent.TRANSACTION:
        return {
          type: 'transaction',
          data: {
            transactionId: message.data.id,
            transactionAffiliation: message.data.partner,
            transactionTotal: message.data.price,
            transactionProducts: [
              {
                name: message.data.product.name,
                sku: message.data.product.identifier,
                category: message.data.product.category,
                price: message.data.product.price,
                quantity: 1
              }
            ]
          }
        };
      default:
        return undefined;
    }
  }
}
