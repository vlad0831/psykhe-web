/* eslint-disable @typescript-eslint/no-unused-vars */
import Optionals from '../optionals';
import { AnalyticsMessage } from '~/types/analytics/events';

export interface AnalyticsListener {
  // Receives the event from the event bus
  receiveEvent(message: AnalyticsMessage): Promise<void>
}

// prettier-ignore
export abstract class OptionalAnalyticsListener implements AnalyticsListener {
  protected optionals: Optionals;

  constructor(optionals: Optionals) {
    this.optionals = optionals;
  }

  // Receives the event from the event bus
  abstract receiveEvent(message: AnalyticsMessage): Promise<void>
}

export interface RequestParams {}
