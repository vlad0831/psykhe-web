<template>
  <div class="psykhe-browse-filters">
    <a class="mob-filters-btn mob-vis-sm" @click.prevent="visible = true">Filters</a>

    <div class="mob-filters collapse" :class="{ show: visible }">
      <a class="mob-filter-title mob-vis-sm" @click.prevent="visible = false">Filters</a>

      <filter-mood></filter-mood>
      <filter-occasion></filter-occasion>
      <filter-categories></filter-categories>
      <filter-brand></filter-brand>
      <filter-color></filter-color>
      <filter-price></filter-price>
      <filter-option></filter-option>

      <div>
        <a class="btn btn-primary btn-filter-apply mob-vis-sm" @click.prevent="visible = false">Apply</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import FilterMood from '~/components/browser/filters/FilterMood.vue';
import FilterOccasion from '~/components/browser/filters/FilterOccasion.vue';
import FilterCategories from '~/components/browser/filters/FilterCategories.vue';
import FilterColor from '~/components/browser/filters/FilterColor.vue';
import FilterPrice from '~/components/browser/filters/FilterPrice.vue';
import FilterOption from '~/components/browser/filters/FilterOption.vue';
import FilterBrand from '~/components/browser/filters/FilterBrand.vue';

@Component({
  components: { FilterMood, FilterOccasion, FilterCategories, FilterColor, FilterPrice, FilterOption, FilterBrand }
})
export default class BrowserFilter extends Vue {
  visible = false;
}
</script>
