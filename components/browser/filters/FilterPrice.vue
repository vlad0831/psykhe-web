<template>
  <div class="psykhe-browse-filters-filter psykhe-browse-filters-filter-price">
    <div class="psykhe-browse-filters-filter-heading" @click="toggleVisible">
      <div class="psykhe-browse-filters-filter-heading-label">Price</div>
      <div class="psykhe-browse-filters-filter-heading-actions">
        <a v-if="visible" class="filter-close"></a>
        <a v-if="!visible" class="filter-open"></a>
      </div>
    </div>
    <div v-if="visible">
      <div class="psykhe-browse-filters-filter-main">
        <div class="psykhe-browse-filters-filter-main-input">
          <label :for="prefixed('low')">Min</label>
          <div class="psykhe-browse-filters-filter-main-input-container">
            <input :id="prefixed('low')" ref="lowInput" v-model="low" class="psykhe-browse-filters-filter-price-low" />
          </div>
        </div>
        <div class="psykhe-browse-filters-filter-main-input">
          <label :for="prefixed('high')">Max</label>
          <div class="psykhe-browse-filters-filter-main-input-container">
            <input
              :id="prefixed('high')"
              ref="highInput"
              v-model="high"
              class="psykhe-browse-filters-filter-price-high"
            />
          </div>
        </div>
      </div>
      <filter-price-mode />
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator';
import Prefixed from '~/mixins/prefixed.ts';
import { queryStore } from '~/store';
import { QueryLinkService } from '~/services/query/query-link.service';
import FilterPriceMode from '~/components/browser/filters/FilterPriceMode.vue';

@Component({
  components: { FilterPriceMode },
  mixins: [Prefixed('browse-filter-price')]
})
export default class FilterPrice extends Vue {
  visible: boolean = true;
  debouncer?: number = undefined;
  low = this.query.price && this.query.price.length ? String(this.query.price[0]) : '0';
  high =
    this.query.price && this.query.price.length && String(this.query.price[1]) !== '0'
      ? String(this.query.price[1])
      : '';

  @Watch('low')
  onLowValueChanged(newLow: string, oldLow: string) {
    if (!String(newLow).match(/^[0-9]*$/)) {
      this.low = oldLow;
      return;
    }
    if (
      window.parseInt(newLow, 10) === window.parseInt(oldLow, 10) ||
      window.parseInt(newLow, 10) > window.parseInt(this.high ? this.high : '0', 10)
    ) {
      return;
    }

    this.debounce(600, () => {
      const activePrice = this.activePrice();
      if (activePrice && activePrice.join(',') !== (this.query.price && this.query.price.join(','))) {
        this.setPriceFilter(activePrice);
      }
    });
  }

  @Watch('high')
  onHighValueChanged(newHigh: string, oldHigh: string) {
    if (!String(newHigh).match(/^[0-9]*$/)) {
      this.high = oldHigh;
      return;
    }
    if (
      window.parseInt(newHigh, 10) === window.parseInt(oldHigh, 10) ||
      window.parseInt(newHigh, 10) < window.parseInt(this.low, 10)
    ) {
      return;
    }

    this.debounce(600, () => {
      const activePrice = this.activePrice();
      if (activePrice && activePrice.join(',') !== (this.query.price && this.query.price.join(','))) {
        this.setPriceFilter(activePrice);
      }
    });
  }

  activeLow() {
    if (!String(this.low).match(/^[0-9]+$/)) {
      return 0;
    }
    return window.parseInt(this.low, 10);
  }

  activeHigh() {
    if (!String(this.high).match(/^[0-9]+$/)) {
      return 0;
    }
    return window.parseInt(this.high, 10);
  }

  activePrice() {
    if (this.activeLow > this.activeHigh) {
      return undefined;
    }

    return [this.activeLow(), this.activeHigh()];
  }

  toggleVisible() {
    this.visible = !this.visible;
  }

  debounce(timeout: number, fn: () => void) {
    if (this.debouncer) {
      window.clearTimeout(this.debouncer);
    }

    this.debouncer = window.setTimeout(() => {
      this.debouncer = undefined;
      fn.apply(this);
    }, timeout);
  }

  setPriceFilter(price: number[]) {
    const updatedQuery = Object.assign({}, this.query);

    if (price && (price[0] || price[1])) {
      updatedQuery.price = price;
    } else {
      updatedQuery.price = [0, 0];
    }

    return this.$router.push(QueryLinkService.getInstance().createLinkFromQuery(updatedQuery, null));
  }

  get query() {
    return queryStore.getGlobalQueryParameters;
  }
}
</script>
