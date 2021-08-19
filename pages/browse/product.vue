<template>
  <div class="w-100 h-100">
    <loader :state="loadingState" class="psykhe-browse-product">
      <div v-if="productObject" class="row mb-4">
        <div
          class="psykhe-browse-product-gallery"
          :class="{
            'psykhe-browse-product-gallery-single': productObject.images.length === 1
          }"
        >
          <ul v-if="productObject.images.length > 1">
            <li v-for="(image, index) in productObject.images" :key="index" @click="selectHero(index)">
              <deferred-figure :src="image.url" :dynamic-src="image.dynamic_url" :aspect-x="3" :aspect-y="4" />
            </li>
          </ul>

          <div class="psykhe-browse-product-gallery-hero">
            <a v-if="productHasOffers" @click="merchantRedirect(productObject.offers.lowestPriceOffer)">
              <deferred-figure :src="hero.url" :dynamic-src="hero.dynamic_url" :aspect-x="3" :aspect-y="4" />
            </a>
            <deferred-figure v-else :src="hero.url" :dynamic-src="hero.dynamic_url" :aspect-x="3" :aspect-y="4" />
          </div>
        </div>

        <div class="psykhe-browse-product-detail" :class="{ liked: liked }">
          <div class="psykhe-browse-product-detail-name">{{ productObject.name }}</div>

          <nuxt-link :to="brandPath">
            <div class="psykhe-browse-product-detail-brand">{{ brandObject.name }}</div>
          </nuxt-link>

          <div v-if="productHasOffers" class="psykhe-browse-product-detail-prices">
            <div
              :class="{
                'psykhe-browse-product-detail-price': true,
                currency: true,
                sale: !!productObject.offers.lowestPriceOffer.salePrice
              }"
              :x-currency-symbol="productObject.offers.lowestPriceOffer.price.symbol"
            >
              {{ productObject.offers.lowestPriceOffer.price }}
            </div>
            <div
              v-if="productObject.offers.lowestPriceOffer.salePrice"
              class="psykhe-browse-product-detail-price currency sale-price"
              :x-currency-symbol="productObject.offers.lowestPriceOffer.price.symbol"
            >
              {{ productObject.offers.lowestPriceOffer.salePrice }}
            </div>
          </div>

          <div v-else class="psykhe-browse-product-detail-soldout">Sold out</div>

          <browser-item-zapper
            :product="productObject"
            :is-product-page="true"
            :is-first-product="false"
            :query-identifier="queryIdentifier"
            page-type="product"
          />

          <div v-if="productHasOffers" class="psykhe-browse-product-detail-offers">
            <p>Shop Now From</p>

            <ul>
              <li v-for="(partner, index) in productObject.offers.groupedByPartner" :key="index">
                <a @click="merchantRedirect(partner.lowestPriceOffer)">{{ partner.lowestPriceOffer.partner.name }}</a>
              </li>
            </ul>
          </div>

          <div class="psykhe-browse-product-detail-description">
            {{ productObject.description }}
          </div>

          <social-link />
        </div>
      </div>

      <div class="row">
        <nav style="width: 100%">
          <div class="nav nav-tabs" role="tablist">
            <a
              class="nav-item nav-link"
              :class="{ active: activeTab === 'more' }"
              data-toggle="tab"
              role="tab"
              @click="switchTab('more')"
            >
              More From This Brand
            </a>

            <a
              class="nav-item nav-link"
              :class="{ active: activeTab === 'similar' }"
              data-toggle="tab"
              role="tab"
              @click="switchTab('similar')"
            >
              Similar Products
            </a>
          </div>
        </nav>

        <div class="tab-content" style="width: 100%">
          <div
            id="product-similar-tab-styles"
            class="tab-pane fade show"
            :class="{ active: activeTab === 'more' }"
            role="tabpanel"
          >
            <custom-browser-grid
              :page-size="4"
              :custom-query="brandsQuery"
              :zapping-enabled="true"
              :excluded-products="excludedProducts"
            />
          </div>

          <div
            id="product-similar-tab-products"
            class="tab-pane fade show"
            :class="{ 'tab-pane fade show': true, active: activeTab === 'similar' }"
            role="tabpanel"
          >
            <custom-browser-grid
              :page-size="4"
              :custom-query="similarProductsQuery"
              :zapping-enabled="true"
              :excluded-products="excludedProducts"
            />
          </div>
        </div>
      </div>
    </loader>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Watch } from 'nuxt-property-decorator';
import _ from 'lodash';

import Loader from '~/components/common/Loader.vue';
import DeferredFigure from '~/components/common/DeferredFigure.vue';

import SocialLink from '~/components/browser/SocialLink.vue';
import CustomBrowserGrid from '~/components/browser/CustomBrowserGrid.vue';
import BrowserItemZapper from '~/components/browser/BrowserItemZapper.vue';

import { Savelist } from '~/types/savelist/savelist';
import { LoaderState } from '~/types/loader-states';
import { initialQueryParameters } from '~/types/query/query';

import { IProduct, IOffer } from '~/types/product/product';
import { BrowseAction } from '~/types/analytics/events';

import { Product } from '~/models/product';
import { UserMixin } from '~/mixins/userMixin';
import { AnalyticsMixin } from '~/mixins/analyticsMixin';

import { queryStore } from '~/store';
import { productsStore } from '~/utils/store-accessor';
import { QueryLinkService } from '~/services/query/query-link.service';

@Component({
  components: {
    CustomBrowserGrid,
    BrowserItemZapper,
    SocialLink,
    DeferredFigure,
    Loader
  }
})
export default class ProductDetail extends mixins(AnalyticsMixin, UserMixin) {
  heroIndex: number = 0;
  activeTab: string = 'more';
  actionType: string = '';
  popupVisible: boolean = false;
  showSaved: boolean = false;

  @Watch('$route', { immediate: true })
  handleRouteChanged(route: any) {
    const productId = parseInt(route.params.id);

    if (!productId) {
      return;
    }

    this.trackProductInteraction(BrowseAction.VIEW, 'product', productId);

    if (productId in productsStore.getCachedProducts) {
      return;
    }

    queryStore.fetchCustomQuery({
      query: {
        ...initialQueryParameters(),
        products: [productId]
      }
    });
  }

  merchantRedirect(offer: IOffer) {
    this.trackVisit(offer.partner.name);

    const userId = this.userIdentifier || 'guest';
    const transactionId = `${userId}-${this.productObject?.identifier}-${+new Date()}`;

    window.localStorage.setItem(
      transactionId,
      JSON.stringify({
        url: offer.url,
        partner: offer.partner.name
      })
    );

    window.open(`/merchant-redirect/?transaction=${transactionId}`);
  }

  inSavelist(slug: string): boolean {
    if (!this.productObject) {
      return false;
    }

    const saveList: Savelist = { slug };
    const product: IProduct = this.productObject.spec;

    return productsStore.productInSavelist(product, saveList);
  }

  selectHero(index: number) {
    if (!this.productObject) {
      return;
    }

    if (index + 1 > this.productObject.images.length) {
      return;
    }

    this.heroIndex = index;
  }

  switchTab(type: string) {
    this.activeTab = type;
  }

  closePopup() {
    this.popupVisible = false;
  }

  trackVisit(partner: string) {
    if (!this.productObject) {
      return;
    }

    // Inform analytics of the visit
    this.trackProductTransaction(this.productObject, partner);

    // Inform QE of the visit
    this.trackProductInteraction(BrowseAction.MERCHANT, 'product', this.productObject.identifier);
  }

  get liked() {
    return this.productObject ? productsStore.productInSavelist(this.productObject.spec, { slug: 'liked' }) : false;
  }

  get brandsQuery() {
    if (!this.brandObject) {
      return {};
    }

    return {
      ...initialQueryParameters(),
      brands: [this.brandObject.identifier]
    };
  }

  get similarProductsQuery() {
    if (!this.productObject) {
      return {};
    }

    return {
      ...initialQueryParameters(),
      categories: [this.productObject.spec.category.split('/')[0]]
    };
  }

  get productHasOffers() {
    if (!this.productObject) {
      return false;
    }

    return this.productObject.offers.offers.length !== 0;
  }

  get brandPath() {
    if (!this.brandObject) {
      return;
    }

    const updatedQuery = { ...this.query };
    updatedQuery.brands = [this.brandObject.identifier];

    return QueryLinkService.getInstance().createLinkFromQuery(updatedQuery, null);
  }

  get productObject() {
    const productId = parseInt(this.$route.params.id);

    if (!(productId in productsStore.getCachedProducts)) {
      return;
    }

    return new Product(productsStore.getCachedProducts[productId]);
  }

  get loadingState() {
    return this.productObject ? LoaderState.LOADED : LoaderState.LOADING;
  }

  get brandObject() {
    return this.productObject?.spec.brand;
  }

  get hero() {
    return this.productObject && this.productObject.images.length ? this.productObject.images[this.heroIndex] : null;
  }

  get query() {
    return queryStore.getGlobalQueryParameters;
  }

  get metaTitle() {
    return this.productObject ? `${this.productObject?.spec.name} | PSYKHE` : 'PSYKHE';
  }

  get metaDescription() {
    return _.truncate(this.productObject?.spec.description, { length: 155 });
  }

  get excludedProducts() {
    const identifier = this.productObject?.spec.identifier;

    return identifier ? [parseInt(identifier)] : [];
  }

  get queryIdentifier() {
    return queryStore.getGlobalQueryIdentifier;
  }

  head() {
    return {
      title: this.metaTitle,
      meta: [
        { hid: 'description', name: 'description', content: this.metaDescription },
        { hid: 'og:title', name: 'og:title', content: this.metaTitle },
        { hid: 'og:description', name: 'og:description', content: this.metaDescription },
        {
          hid: 'og:image',
          name: 'og:image',
          content: this.hero?.dynamic_url.replace(':width:', '1200').replace(':height:', '627')
        },
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary' },
        { hid: 'twitter:site', name: 'twitter:site', content: '@psykhefashion' },
        { hid: 'twitter:title', name: 'twitter:title', content: this.metaTitle },
        { hid: 'twitter:description', name: 'twitter:description', content: this.metaDescription },
        {
          hid: 'twitter:image',
          name: 'og:image',
          content: this.hero?.dynamic_url.replace(':width:', '1200').replace(':height:', '675')
        }
      ]
    };
  }
}
</script>
