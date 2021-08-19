import { IImage, IProduct } from '~/types/product/product';
import { Savelist } from '~/types/savelist/savelist';
import { Offers } from './offers';

export class Product {
  spec: IProduct;
  cachedOffers: Offers;

  constructor(spec: IProduct) {
    this.spec = spec;
    this.cachedOffers = new Offers({ offers: [] });
  }

  get debug(): object {
    return this.spec.debug;
  }

  get identifier(): number {
    return parseInt(this.spec.identifier);
  }

  get name(): string {
    return this.spec.name;
  }

  get slug(): string {
    return this.spec.slug;
  }

  get partnerSlug(): string {
    if (!this.offers.offers.length) {
      return '';
    }

    if (Object.keys(this.offers.groupedByPartner).length > 1) {
      return 'multiple';
    }

    if (!this.offers.lowestPriceOffer) {
      return '';
    }

    return this.offers.lowestPriceOffer.partner.identifier;
  }

  get brandName(): string {
    return this.spec.brand.name;
  }

  get brandSlug(): string {
    return this.spec.brand.identifier;
  }

  get urlPath(): string {
    return ['/browse', this.partnerSlug, this.brandSlug, [this.slug, this.identifier].join('/')].join('/');
  }

  get images(): IImage[] {
    return this.spec.images;
  }

  get categories(): string {
    return this.spec.category;
  }

  get description() {
    return this.spec.description;
  }

  get descriptionLong(): string {
    return this.spec.descriptionLong;
  }

  get offers(): Offers {
    if (this.cachedOffers.size) {
      return this.cachedOffers;
    }

    this.cachedOffers = new Offers({
      offers: this.spec.offers
    });

    return this.cachedOffers;
  }

  get savelists() {
    return this.spec.savelists;
  }

  set savelists(savelists: Savelist[]) {
    this.spec.savelists = savelists;
  }
}
