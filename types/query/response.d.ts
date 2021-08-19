import { IProduct } from '~/types/product/product';
import { QueryParameters } from './query';
import { QueryStatus } from './status.enum';

export interface QueryResponse {
  identifier: string;
  status: QueryStatus;
  recommendation: string;
  checkpoint: string;
  pools: SprinklerPool[];
  debug: QueryResultDebug;
  query: QueryParameters;

  products: IProduct[];
}

export interface SprinklerPool {
  identifier: string;
  weight: number;
  debug: SprinklerPoolDebug;
  order: number[];
  has_more: boolean;
}

export interface QueryResultDebug {
  // todo
}
export interface SprinklerPoolDebug {
  // todo
}
