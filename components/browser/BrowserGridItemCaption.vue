<template>
  <div v-remove-parent>
    <div v-if="product" class="psykhe-grid-item-details">
      <div v-if="product.debug" :x-ref="product.debug.o.ref">
        <div>{{ product.debug.rec }}({{ product.debug.s }})</div>

        <div>{{ product.debug.o.t }}({{ product.debug.pos }})</div>

        <div>
          <a :href="'/browse/' + product.categories[0]">
            {{ product.categories[0] }}
          </a>
        </div>
      </div>

      <div class="psykhe-browse-grid-brand" @click="viewBrand()">
        {{ brandObject.name }}
      </div>

      <router-link class="psykhe-browse-grid-name" :to="{ path: product.urlPath }">
        {{ product.name }}
      </router-link>

      <ul v-if="productHasOffers" class="psykhe-browse-grid-offers" style="margin-top: 15px">
        <template v-for="(offer, index) in product.offers.lowestPriceOffersByPartner">
          <li :key="index">
            <a @click="merchantRedirect(offer)">
              <span
                :class="{
                  'psykhe-browse-grid-price': true,
                  currency: true,
                  sale: !!product.offers.lowestPriceOffer.salePrice
                }"
                >{{
                  productHasOffers
                    ? product.offers.lowestPriceOffer.price.symbol + product.offers.lowestPriceOffer.price
                    : 'Sold Out'
                }}</span
              >
              <span class="psykhe-browse-grid-sale_price currency">{{
                product.offers.lowestPriceOffer.salePrice
                  ? product.offers.lowestPriceOffer.price.symbol + product.offers.lowestPriceOffer.salePrice
                  : null
              }}</span>
            </a>
          </li>
        </template>
      </ul>

      <p v-if="sprinklerDebugText" style="word-break: break-all">
        <br />
        {{ sprinklerDebugText }}
      </p>

      <div v-if="productHasNewLabel" class="psykhe-browse-grid-label">New</div>

      <div class="item-line"></div>
    </div>

    <browser-item-zapper
      v-if="zappingEnabled"
      :product="product"
      :position="position"
      :page-type="pageType"
      :is-first-product="isFirstProduct"
      :query-identifier="queryIdentifier"
    ></browser-item-zapper>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'nuxt-property-decorator';
import { paginationStore, sprinklersStore } from '~/store';
import { Brand } from '~/models/brand';
import { Product } from '~/models/product';
import { IBrand, IOffer } from '~/types/product/product';

import RemoveParent from '~/utils/remove-parent-directive';
import BrowserItemZapper from '~/components/browser/BrowserItemZapper.vue';

import { AnalyticsMixin } from '~/mixins/analyticsMixin';
import { BrowseAction } from '~/types/analytics/events';

@Component({
  directives: { RemoveParent },
  components: { BrowserItemZapper }
})
export default class BrowserGridItemCaption extends AnalyticsMixin {
  @Prop({ required: true, type: Object })
  readonly product!: Product;

  @Prop({ required: true, type: String })
  readonly queryIdentifier!: string;

  @Prop({ required: true, type: Boolean })
  readonly zappingEnabled!: boolean;

  @Prop({ required: false, type: Boolean, default: false })
  readonly isFirstProduct!: boolean;

  @Prop({ required: true, type: String })
  readonly pageType!: string;

  @Prop({ required: true, type: Number })
  readonly position!: number;

  brandObject: IBrand | null = null;

  created() {
    this.brandObject = new Brand({
      identifier: this.product.brandSlug,
      name: this.product.brandName
    });
  }

  get productBrand() {
    if (!this.brandObject) {
      return {};
    }

    return this.brandObject;
  }

  get productHasOffers() {
    if (!this.product) {
      return false;
    }

    return this.product.offers.size !== 0;
  }

  get sprinklerDebugText() {
    if (process.env.PAGINATION_DEBUG_ENABLED && ['true', '1'].includes(process.env.PAGINATION_DEBUG_ENABLED)) {
      return sprinklersStore
        .allocatedSprinklersForProduct(this.queryIdentifier, parseInt(this.product.spec.identifier))
        .map(decodeURIComponent)
        .join(',');
    }

    return '';
  }

  get productHasNewLabel() {
    if (this.product) {
      if (this.product.spec.labels && this.product.spec.labels.includes('new')) return true;
      return false;
    }

    return false;
  }

  viewBrand() {
    if (!this.brandObject) {
      return;
    }

    this.$router.push({ name: 'browse-brands-slugs', params: { brandslugs: this.brandObject.identifier } });
  }

  trackVisit(partner: string) {
    // Inform analytics of the visit
    this.trackProductTransaction(this.product, partner);

    // Inform QE of the visit
    this.trackProductInteraction(
      BrowseAction.MERCHANT,
      this.pageType,
      this.product.identifier,
      paginationStore.getCurrentPageNumber(this.queryIdentifier),
      this.queryIdentifier,
      this.position
    );
  }

  merchantRedirect(offer: IOffer) {
    this.trackVisit(offer.partner.name);

    const userId = this.userIdentifier || 'guest';
    const transactionId = `${userId}-${this.product?.identifier}-${+new Date()}`;

    window.localStorage.setItem(
      transactionId,
      JSON.stringify({
        url: offer.url,
        partner: offer.partner.name
      })
    );

    window.open(`/merchant-redirect/?transaction=${transactionId}`);
  }
}
</script>
