<template>
  <div class="psykhe-browse-grid-refine">
    <a class="psykhe-browse-grid-dislike" @click="saveToggle('disliked')">
      <transition name="fade">
        <div
          v-if="isFirstProduct && helpPopupVisible"
          class="psykhe-help-pop psykhe-help-pop-like"
          @click.stop.prevent="closeHelpPopup"
        >
          <div class="psykhe-help-pop-inner">
            <a class="close-button close-button-like"></a>
            TRY IT<br />
            Make products<br />
            disappear!
          </div>
        </div>
      </transition>

      <transition name="fade">
        <div v-if="dislikePopupVisible" class="psykhe-help-pop nologin-zap">
          <div class="psykhe-help-pop-inner nologin-zap">
            <a class="close-button close-button-mood" @click.stop.prevent="closeNoLoginPoup"></a>
            Log in to use this feature so PSYKHE can better know your style.
          </div>
        </div>
      </transition>
    </a>

    <a class="psykhe-browse-grid-like" @click="saveToggle('liked')">
      <transition name="fade">
        <div v-if="likePopupVisible" class="psykhe-help-pop nologin-zap">
          <div class="psykhe-help-pop-inner nologin-zap">
            <a class="close-button close-button-mood" @click.stop.prevent="closeNoLoginPoup"></a>
            Log in to use this feature so PSYKHE can better know your style.
          </div>
        </div>
      </transition>
    </a>

    <transition name="fade-in-out">
      <div v-if="showSaved" class="psykhe-browse-grid-info">Saved!</div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator';
import { AnalyticsMixin } from '~/mixins/analyticsMixin';
import { UserMixin } from '~/mixins/userMixin';
import { Product } from '~/models/product';
import { productsStore, optionsStore, paginationStore } from '~/store';
import { BrowseAction } from '~/types/analytics/events';

import { IProduct } from '~/types/product/product';
import { Savelist } from '~/types/savelist/savelist';

@Component
export default class BrowserItemZapper extends mixins(AnalyticsMixin, UserMixin) {
  @Prop({ required: false, type: Boolean, default: false })
  readonly isFirstProduct!: boolean;

  @Prop({ required: false, type: Object, default: false })
  readonly product!: Product;

  @Prop({ required: false, type: String })
  readonly queryIdentifier!: string;

  @Prop({ required: true, type: String })
  readonly pageType!: string;

  @Prop({ required: false, type: Number })
  readonly position!: number;

  @Prop({ required: false, type: Boolean, default: false })
  readonly isProductPage?: boolean;

  showSaved: boolean = false;
  likePopupTriggered: boolean = false;
  dislikePopupTriggered: boolean = false;
  noLoginPopupDismissed: boolean = false;

  get helpPopupVisible() {
    return optionsStore.hasFetchedOptions && !optionsStore.hasOption('closed_like_popup');
  }

  get likePopupVisible() {
    return this.noLoginPopupVisible && this.likePopupTriggered;
  }

  get dislikePopupVisible() {
    return this.noLoginPopupVisible && optionsStore.noLoginZapLimitExceeded && this.dislikePopupTriggered;
  }

  get noLoginPopupVisible() {
    return !this.noLoginPopupDismissed && optionsStore.noLoginLastZappedProduct === this.product.spec.identifier;
  }

  async saveToggle(slug: string) {
    // If the user is not logged in, ensure the no login zap limit has not been exceeded
    if (!this.isLoggedIn) {
      optionsStore.trackNoLoginInteraction({
        productIdentifier: this.product.spec.identifier,
        zapped: slug === 'disliked'
      });

      if (slug === 'liked' || optionsStore.noLoginZapLimitExceeded) {
        this.noLoginPopupDismissed = false;

        this.likePopupTriggered = slug === 'liked';
        this.dislikePopupTriggered = slug !== 'liked';

        return;
      }
    }

    // Prevent repeated actions if the product has already been blacklisted
    if (productsStore.productInBlacklist(this.product.spec)) {
      return;
    }

    this.trackProductInteraction(
      slug === 'liked' ? BrowseAction.LIKE : BrowseAction.DISLIKE,
      this.pageType,
      this.product.identifier,
      paginationStore.getCurrentPageNumber(this.queryIdentifier),
      this.queryIdentifier,
      this.position
    );

    if (slug === 'disliked') {
      await productsStore.blacklistProducts([this.product.spec]);
    }

    const product: IProduct = this.product.spec;
    const savelist: Savelist = { slug };
    await productsStore.toggleCachedProductSavelistMembership({ product, savelist });

    // Flash the "saved" message if the product is now in the savelist
    if (productsStore.productInSavelist(product, savelist) && slug !== 'disliked') {
      this.showSaved = true;
      setTimeout(() => (this.showSaved = false), 1000);
    }

    // If the user is logged in, inform the API of the action
    if (this.isLoggedIn) {
      try {
        await productsStore.toggleProductSavelistMembership({ product, savelist });
      } catch (error) {
        // todo: queue the request to be re-sent
      }
    }

    // If the action was a zap:
    // - Return to /browse if we are on the product page
    // - Wait for the zap animation to play and replace the product, if we are already on /browse
    if (slug === 'disliked') {
      if (this.isProductPage) {
        this.$router.back();
      } else {
        setTimeout(() => paginationStore.replaceBlacklistedProducts(this.queryIdentifier), 250);
      }
    }
  }

  closeHelpPopup(event: Event) {
    event.stopPropagation();

    optionsStore.publishOption({ key: 'closed_like_popup', value: true });
  }

  closeNoLoginPoup(event: Event) {
    event.stopPropagation();

    this.noLoginPopupDismissed = true;
  }
}
</script>
