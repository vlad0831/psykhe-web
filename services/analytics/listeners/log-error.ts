/* eslint-disable no-console */
/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AnalyticsListener } from './interface';
import { AnalyticsMessage } from '~/types/analytics/events';

export class LogErrorListener implements AnalyticsListener {
  async receiveEvent(message: AnalyticsMessage) {
    console.error(`[${message.type}] ${JSON.stringify(message)}`);
  }
}
