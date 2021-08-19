import { IOffer, IOffers, IPartner, IPrice } from '~/types/product/product';

export class Offers {
  spec: IOffers;
  offers: Offer[];

  constructor(spec: IOffers) {
    this.spec = spec;
    this.offers = [];

    for (const offer of spec.offers) {
      this.offers.push(ensureOfferObject(offer));
    }
  }

  *[Symbol.iterator]() {
    for (const offer of this.offers) {
      yield offer;
    }
  }

  get size() {
    return this.offers.length;
  }

  get groupedByPartner() {
    const partners: { [key: string]: Offers } = {};
    for (const offer of this.offers) {
      if (!partners[offer.partner.identifier]) {
        partners[offer.partner.identifier] = new Offers({
          offers: []
        });
      }

      partners[offer.partner.identifier].add(offer);
    }

    return partners;
  }

  get lowestPriceOffersByPartner() {
    const offers = new Offers({
      offers: []
    });

    Object.values(this.groupedByPartner).forEach((partner) => {
      if (partner.lowestPriceOffer) {
        offers.add(partner.lowestPriceOffer);
      }
    });

    return offers;
  }

  get lowestPriceOffer() {
    let matched;
    for (const offer of this.offers) {
      if (offer.salePrice) {
        if (!matched || (matched.salePrice && matched.salePrice > offer.salePrice)) {
          matched = offer;
        }
      } else if (!matched || matched.price.comparable > offer.price.comparable) {
        matched = offer;
      }
    }
    return matched;
  }

  add(offer: IOffer | Offer) {
    if (offer instanceof Offer) {
      this.offers.push(offer);
    } else {
      this.offers.push(new Offer(offer));
    }
  }
}

export class Offer {
  spec: IOffer;

  constructor(spec: IOffer) {
    this.spec = spec || {};
  }

  get url(): string {
    return this.spec.url;
  }

  get partner(): IPartner {
    return this.spec.partner;
  }

  get price(): Price {
    return new Price({
      currency: this.spec.currency,
      value: this.spec.price
    });
  }

  get salePrice(): Price | undefined {
    if (!this.spec.sale_price || this.spec.sale_price == this.spec.price) {
      return undefined;
    }

    return new Price({
      currency: this.spec.currency,
      value: this.spec.sale_price
    });
  }
}

export class Price {
  spec: IPrice;

  constructor(spec: IPrice) {
    spec = spec || {};

    this.spec = {
      currency: spec.currency,
      value: spec.value
    };
  }

  toString() {
    return this.formattedValue;
  }

  get comparable() {
    // FIXME: convert to standard currency (eg: always USD)
    //        (it may be that this conversion happens elsewhere)
    return this.spec.value;
  }

  get currency() {
    return this.spec.currency;
  }

  get symbol() {
    switch (this.currency) {
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'USD':
        return '$';
    }
  }

  get formattedValue() {
    // FIXME: different currencies have different formatting rules
    return Number(this.spec.value)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}

function ensureOfferObject(offer: Offer | IOffer): Offer {
  return Offer.prototype.isPrototypeOf(offer) ? (offer as Offer) : new Offer(offer as IOffer);
}
