export enum AnalyticsEvent {
  PAGEVIEW = 'pageview',
  HOME_EVENT = 'home_event',
  TRANSACTION = 'transaction',
  BROWSE_EVENT = 'browse_event',
  PROFILE_EVENT = 'profile_event'
}

export type AnalyticsMessage =
  | PageViewMessage
  | TransactionMessage
  | HomeEventMessage
  | BrowseEventMessage
  | ProfileEventMessage;

// Pageview events
export interface PageViewMessage {
  type: AnalyticsEvent.PAGEVIEW;
  data: {
    page: string;
  };
}

// Clickthrough events
export interface TransactionMessage {
  type: AnalyticsEvent.TRANSACTION;
  data: {
    id: string;
    price?: number;
    partner?: string;

    product: {
      name?: string;
      price?: number;
      category?: string;
      identifier?: number;
    };
  };
}

// Homepage events
export enum HomeAction {
  REGISTRATION_STARTED = 'registration_started',
  REGISTRATION_COMPLETED = 'registration_completed'
}

export interface HomeEventMessage {
  type: AnalyticsEvent.HOME_EVENT;
  data: {
    action: HomeAction;
    context: {
      page: string;
    };
  };
}

// Browse events
export enum BrowseAction {
  VIEW = 'view',
  LIKE = 'like',
  SAVE = 'save',
  UNSAVE = 'unsave',
  DISLIKE = 'dislike',
  MERCHANT = 'merchant',
  CLICKTHROUGH = 'clickthrough'
}

export interface BrowseEventMessage {
  type: AnalyticsEvent.BROWSE_EVENT;
  data: {
    user?: string;
    product?: number;
    action: BrowseAction;

    context?: {
      page: string;
      page_position?: number;
      recommendation?: string;
      result_position?: number;
      ymal_seed_product?: number;
    };
  };
}

// Profile events
export enum ProfileAction {
  REFERRED = 'referred'
}

export interface ProfileEventMessage {
  type: AnalyticsEvent.PROFILE_EVENT;
  data: {
    user: string;
    action: ProfileAction;

    context: {
      page: string;
    };
  };
}
