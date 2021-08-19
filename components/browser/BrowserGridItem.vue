<template>
  <div class="psykhe-grid-item" :class="{ liked: liked, zapping: zapping }">
    <browse-item-transition :zapping="zapping" />

    <router-link v-if="!zapping" :to="{ path: product.urlPath }">
      <div class="psykhe-grid-item-view" @click="trackInteraction">
        <deferred-figure
          :asset-key="productHero.url"
          class="psykhe-grid-item-view-image"
          :alt="product ? product.name : 'placeholder'"
          :src="productHero.url"
          :dynamic-src="productHero.dynamicUrl"
          :aspect-x="3"
          :aspect-y="4"
        />

        <save-to-list
          :product="product"
          :position="position"
          :page-type="pageType"
          :query-identifier="queryIdentifier"
          :is-first-product="isFirstProduct"
        />
      </div>
    </router-link>

    <browser-grid-item-caption
      :product="product"
      :position="position"
      :page-type="pageType"
      :zapping-enabled="zappingEnabled"
      :query-identifier="queryIdentifier"
      :is-first-product="isFirstProduct"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'nuxt-property-decorator';
import { paginationStore, productsStore } from '~/store';

import { Product } from '~/models/product';
import { IProduct } from '~/types/product/product';
import { Savelist } from '~/types/savelist/savelist';

import SaveToList from '~/components/browser/SaveToList.vue';
import DeferredFigure from '~/components/common/DeferredFigure.vue';
import BrowseItemTransition from '~/components/browser/BrowseItemTransition.vue';
import BrowserGridItemCaption from '~/components/browser/BrowserGridItemCaption.vue';

import { AnalyticsMixin } from '~/mixins/analyticsMixin';
import { BrowseAction } from '~/types/analytics/events';

@Component({
  components: { SaveToList, BrowserGridItemCaption, DeferredFigure, BrowseItemTransition }
})
export default class BrowserGridItem extends AnalyticsMixin {
  @Prop({ required: true, type: Number })
  readonly productIdentifier!: number;

  @Prop({ required: true, type: String })
  readonly queryIdentifier!: string;

  @Prop({ required: false, type: Boolean, default: false })
  readonly isFirstProduct!: boolean;

  @Prop({ required: false, type: Boolean, default: true })
  readonly zappingEnabled!: object;

  @Prop({ required: true, type: Number })
  readonly position!: number;

  @Prop({ required: true, type: String })
  readonly pageType!: string;

  trackInteraction() {
    this.trackProductInteraction(
      BrowseAction.CLICKTHROUGH,
      this.pageType,
      this.productIdentifier,
      paginationStore.getCurrentPageNumber(this.queryIdentifier),
      this.queryIdentifier,
      this.position
    );
  }

  get product() {
    const cachedProduct = productsStore.getCachedProducts[this.productIdentifier];

    return new Product(cachedProduct);
  }

  get zapping() {
    return productsStore.productInBlacklist(this.product.spec);
  }

  get liked() {
    return productsStore.productInSavelist(this.product.spec, { slug: 'liked' });
  }

  get productHero() {
    return {
      url: this.product.images ? this.product.images[0].url : undefined,
      dynamicUrl: this.product.images ? this.product.images[0].dynamic_url : undefined
    };
  }

  inSavelist(slug: string): boolean {
    const savelist: Savelist = { slug };
    const product: IProduct = this.product.spec;

    return productsStore.productInSavelist(product, savelist);
  }
}
</script>
