<template>
  <div>
    <div class="psykhe-grid-item-view-panel">
      <template v-if="saveWindowVisible">
        <div class="psykhe-grid-item-view-panel-save">
          <a
            :class="{
              'psykhe-grid-item-view-actions-save': true,
              saved: inSavelist('default')
            }"
            @click.stop.prevent="saveToggle('default')"
          >
            <template v-if="inSavelist('default')">
              <img src="/media/icon/heart-filled-t.svg" />
              <span>SAVED</span>
            </template>

            <template v-else>
              <img src="/media/icon/heart-t.svg" />
            </template>
          </a>

          <div class="saved-lists-drop">
            <template v-for="(savelist, index) in visibleSavelists">
              <a
                :key="index"
                :class="{
                  'psykhe-grid-item-view-actions-save saved-list-item': true,
                  saved: inSavelist(savelist.slug)
                }"
                @click.stop.prevent="saveToggle(savelist.slug)"
              >
                <template v-if="inSavelist(savelist.slug)">
                  <img src="/media/icon/heart-filled-w.svg" />
                </template>

                <template v-else>
                  <img src="/media/icon/heart-w.svg" />
                </template>

                {{ savelist.name }}
              </a>
            </template>

            <div
              v-if="canCreateNewSavelist"
              class="psykhe-grid-item-view-actions-save create-list"
              @click.stop.prevent=""
            >
              <img src="/media/icon/plus-w.svg" />

              <form @submit.stop.prevent="createSavelist">
                <input v-model="newSavelistName" type="text" placeholder="New List" @keydown.stop="" />
              </form>
            </div>
          </div>

          <img
            v-if="isSavelistPage"
            src="/media/icon/close-t.svg"
            class="list-item-remove"
            @click.stop.prevent="removeFromLists"
          />
        </div>

        <a
          :class="{
            'psykhe-grid-item-view-actions-close': true
          }"
          @click.stop.prevent="closeSaveWindow"
        >
        </a>
      </template>

      <template v-else>
        <div class="psykhe-grid-item-view-panel-actions">
          <a
            :class="{
              'psykhe-grid-item-view-actions-save': true,
              saved: inSavelist('default')
            }"
            @click.stop.prevent="openSaveWindow"
          >
            <template v-if="inSavelist('default')">
              <img src="/media/icon/heart-filled-t.svg" />

              <ul class="saved-group-list-top">
                <li v-for="(savelist, index) in selectedVisibleSavelists" :key="index">
                  {{ savelist.name }} <span>.</span>
                </li>
              </ul>
            </template>

            <template v-else>
              <img src="/media/icon/heart-t.svg" />
              <span>SAVE TO LIST</span>
            </template>
          </a>

          <img
            v-if="isSavelistPage"
            src="/media/icon/close-t.svg"
            class="list-item-remove"
            @click.stop.prevent="removeFromLists"
          />
        </div>
      </template>
    </div>

    <transition name="fade">
      <div
        v-if="popupVisible && isFirstProduct"
        class="psykhe-help-pop psykhe-help-pop-list"
        @click.stop.prevent="closePopup"
      >
        <div class="psykhe-help-pop-inner">
          <a class="close-button close-button-list" @click.stop.prevent="closePopup"></a>

          SAVE FOR LATER<br />
          Shortlist before<br />
          you buy
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="nologinPopupVisible" class="psykhe-help-pop psykhe-help-pop-list">
        <div class="psykhe-help-pop-inner">
          <a class="close-button close-button-list" @click.stop.prevent="closeNologinPopup"></a>
          Log in to use this feature so PSYKHE can better know your style.
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator';
import { AnalyticsMixin } from '~/mixins/analyticsMixin';
import { optionsStore, paginationStore, productsStore, queryStore, savelistsStore } from '~/store';

import { Product } from '~/models/product';
import { IProduct } from '~/types/product/product';
import { Savelist } from '~/types/savelist/savelist';
import { BrowseAction } from '~/types/analytics/events';
import UserAuth from '~/mixins/userAuth';

@Component
export default class SaveToList extends mixins(UserAuth, AnalyticsMixin) {
  @Prop({ required: true, type: Object })
  readonly product!: Product;

  @Prop({ required: true, type: String })
  readonly queryIdentifier!: string;

  @Prop({ required: false, type: Boolean, default: false })
  readonly isFirstProduct!: boolean;

  @Prop({ required: true, type: String })
  readonly pageType!: string;

  @Prop({ required: true, type: Number })
  readonly position!: number;

  newSavelistName: string = '';
  saveWindowVisible: boolean = false;
  nologinPopupTriggered: boolean = false;

  get visibleSavelists() {
    return savelistsStore.visibleSavelists;
  }

  get selectedVisibleSavelists() {
    return this.visibleSavelists.filter((savelist) => savelist.slug && this.inSavelist(savelist.slug));
  }

  get popupVisible() {
    return optionsStore.hasFetchedOptions && !optionsStore.hasOption('closed_list_popup');
  }

  get canCreateNewSavelist() {
    return savelistsStore.canCreateNewSavelist;
  }

  get isSavelistPage() {
    return queryStore.getGlobalQueryParameters.savelists.length > 0;
  }

  get nologinPopupVisible() {
    return this.nologinPopupTriggered && optionsStore.getNoLoginLastSavedProduct === this.product.spec.identifier;
  }

  closePopup(event: Event) {
    event.stopPropagation();
    optionsStore.publishOption({ key: 'closed_list_popup', value: true });
  }

  closeNologinPopup() {
    this.nologinPopupTriggered = false;
  }

  inSavelist(slug: string): boolean {
    const savelist: Savelist = { slug };
    const product: IProduct = this.product.spec;

    return productsStore.productInSavelist(product, savelist);
  }

  async saveToggle(slug: string) {
    const product: IProduct = this.product.spec;
    const savelist: Savelist = { slug };

    this.trackProductInteraction(
      slug === 'liked' ? BrowseAction.LIKE : BrowseAction.DISLIKE,
      this.pageType,
      this.product.identifier,
      paginationStore.getCurrentPageNumber(this.queryIdentifier),
      this.queryIdentifier,
      this.position
    );

    await productsStore.toggleCachedProductSavelistMembership({ product, savelist });
    productsStore.toggleProductSavelistMembership({ product, savelist });
  }

  removeFromLists() {
    // Remove the product from the pagination cache for the current query
    if (queryStore.getGlobalQueryIdentifier) {
      paginationStore.removeProduct({
        queryIdentifier: queryStore.getGlobalQueryIdentifier,
        productIdentifier: this.product.identifier
      });
    }

    const product: IProduct = this.product.spec;

    for (const savelist of this.product.savelists) {
      productsStore.toggleCachedProductSavelistMembership({ product, savelist });
      productsStore.toggleProductSavelistMembership({ product, savelist });
    }
  }

  openSaveWindow() {
    if (!this.isLoggedIn) {
      optionsStore.trackNoLoginSavelistInteraction(this.product.spec.identifier);
      this.nologinPopupTriggered = true;
      return;
    }

    this.saveWindowVisible = true;

    if (!this.inSavelist('default')) {
      this.saveToggle('default');
    }
  }

  closeSaveWindow() {
    this.saveWindowVisible = false;
  }

  createSavelist(event: Event) {
    if (!event) {
      return;
    }

    if (!this.newSavelistName.length) {
      return;
    }

    const name = this.newSavelistName;
    this.newSavelistName = '';

    const savelist: Savelist = { name };

    savelistsStore.createSavelist(savelist);
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
