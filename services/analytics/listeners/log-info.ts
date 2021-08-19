/* eslint-disable no-console */
/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AnalyticsListener } from './interface';
import { AnalyticsMessage } from '~/types/analytics/events';

export class LogInfoListener implements AnalyticsListener {
  async receiveEvent(message: AnalyticsMessage) {
    console.log(`[${message.type}] ${JSON.stringify(message)}`);
  }
}
