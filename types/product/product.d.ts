import { Savelist } from '../savelist/savelist';

export interface IProduct {
  identifier: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  descriptionShort: string;
  descriptionLong: string;
  brand: IBrand;
  images: IImage[];
  offers: IOffer[];
  savelists: Savelist[];
  labels?: string[];
  debug: object;
}

export interface IBrand {
  identifier: string;
  name: string;
}

export interface IImage {
  url: string;
  dynamic_url: string;
}

export interface IOffers {
  offers: IOffer[];
}

export interface IOffer {
  currency: string;
  price: number;
  sale_price?: number;
  url: string;
  partner: IPartner;
}

export interface IPartner {
  identifier: string;
  name: string;
}

export interface IPrice {
  currency: string;
  value: number;
}
