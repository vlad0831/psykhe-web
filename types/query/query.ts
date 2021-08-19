import { QueryStatus } from './status.enum';

export interface QueryParameters {
  brands?: string[];
  categories?: string[];
  checkpoint?: string;
  colors?: string[];
  limit: string;
  modes: string[];
  mood?: string;
  occasions: string[];
  options: string[];
  partners: string[];
  price: number[];
  products: number[];
  recommendation: string;
  result: string;
  savelists: string[];
  search: string;
  sprinklers: string[];
  user?: string;
}

export interface QueryTracking {
  // Query identifier
  [key: string]: {
    ready: boolean;
    status: QueryStatus;
    cancelled: boolean;
    checkpoint: string;
    recommendation: string;
  };
}

export function initialQueryParameters(): QueryParameters {
  return {
    brands: [],
    categories: [],
    checkpoint: '',
    colors: [],
    modes: [],
    mood: '',
    occasions: [],
    options: [],
    partners: [],
    price: [],
    recommendation: '',
    savelists: [],
    limit: '',
    result: '',
    search: '',
    sprinklers: [],
    products: [],
    user: ''
  };
}
