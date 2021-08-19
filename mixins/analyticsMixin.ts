import { Component } from 'nuxt-property-decorator';
import { UserMixin } from './userMixin';

import { AnalyticsService } from '~/services/analytics/manager';
import { AnalyticsEvent, BrowseAction } from '~/types/analytics/events';
import { queryStore } from '~/store';
import { Product } from '~/models/product';
declare global {
  interface Window {
    optionalsManager: any;
  }
}

@Component
export class AnalyticsMixin extends UserMixin {
  trackProductTransaction(product: Product, partner: string) {
    const userId = this.userIdentifier || 'guest';

    const offer = product.offers.lowestPriceOffer;
    const price = offer?.salePrice ? offer.salePrice.spec.value : offer?.price.spec.value;

    AnalyticsService.publish({
      type: AnalyticsEvent.TRANSACTION,
      data: {
        price,
        partner,
        id: `${userId}-${product.identifier}-${+new Date()}`,
        product: {
          price,
          name: product.name,
          category: product.categories,
          identifier: product.identifier
        }
      }
    });
  }

  trackProductInteraction(
    action: BrowseAction,
    pageType: string,
    productIdentifier: number,
    pageNumber?: number,
    queryIdentifier?: string,
    productPosition?: number
  ) {
    const seedProduct =
      this.$route.name === 'browse-merchant-brand-slug-id' ? parseInt(this.$route.params.id) : undefined;

    AnalyticsService.publish({
      type: AnalyticsEvent.BROWSE_EVENT,
      data: {
        action,
        user: this.userIdentifier,
        product: productIdentifier,

        context: {
          page: pageType,
          page_position: pageNumber,
          result_position: productPosition,
          ymal_seed_product: seedProduct && seedProduct !== productIdentifier ? seedProduct : undefined,
          recommendation: queryIdentifier ? queryStore.getQueryRecommendation(queryIdentifier) : undefined
        }
      }
    });
  }

  displayOptionalsModal() {
    window.optionalsManager = (setCookie: boolean) => {
      (this as any).$bvModal
        .msgBoxConfirm(
          this.$createElement('div', [
            this.$createElement('p', [
              "At the core of PSYKHE's mission is providing " +
                'recommendations that are specific to you. In order to ' +
                'achieve this, we use cookies to learn your preferences ' +
                'based on how you interact with the platform. ' +
                'Continued use of PSYKHE indicates acceptance of this. ' +
                'See our ',
              this.$createElement(
                'a',
                {
                  attrs: {
                    href: '/privacy-policy#psykhe-opt-nada',
                    target: '_blank'
                  }
                },
                'Privacy Policy'
              ),
              ' and ',
              this.$createElement(
                'a',
                {
                  attrs: {
                    href: '/terms-and-conditions#psykhe-opt-nada',
                    target: '_blank'
                  }
                },
                'Terms of Use'
              ),
              ' for further information.'
            ])
          ]),
          {
            modalClass: 'psykhe-optionals',
            title: 'PSYKHE Uses Cookies',
            okTitleHtml: 'ACCEPT&nbsp;ALL',
            cancelTitleHtml: 'REJECT&nbsp;THIRD-PARTY',
            noCloseOnEsc: true,
            noCloseOnBackdrop: true
          }
        )
        .then((confirmed: boolean) => {
          if (confirmed) {
            this.$fb.enable();
            this.$gtm.init(process.env.GOOGLE_TAG_MANAGER_ID);

            return this.$optionals.acceptAll();
          } else {
            return this.$optionals.rejectAll();
          }
        })
        .then(() => {
          if (setCookie) {
            this.$optionals.setCookie('psykhe_opt');
          }
        });
    };

    if (window.location.hash !== '#psykhe-opt-nada') {
      this.$optionals
        .loadCookie('psykhe_opt')
        .then((optionals) => {
          for (const optional of optionals) {
            if (optional.identifier === 'facebook' && optional.accepted) {
              this.$fb.enable();
            }

            if (optional.identifier === 'gtm' && optional.accepted) {
              this.$gtm.init(process.env.GOOGLE_TAG_MANAGER_ID);
            }
          }
        })
        .catch(() => {
          return window.optionalsManager(true);
        });
    }
  }
}
