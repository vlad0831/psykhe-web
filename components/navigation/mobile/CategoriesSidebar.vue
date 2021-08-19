<template>
  <div>
    <b-sidebar
      v-for="(category, slug) in categories"
      :id="'sub' + slug"
      :key="slug"
      sidebar-class="mobile-nav"
      width="440px"
      no-header
      shadow
    >
      <div class="mob-nav-sub mob-bkg-light">
        <span v-b-toggle="'sub' + slug"></span>
        <nuxt-link class="nav-head-sub" :to="`/browse/${slug}`">
          {{ category.label }}
        </nuxt-link>
      </div>

      <ul v-if="Object.keys(category.children).length > 0">
        <li v-for="(child, childSlug) in category.children" :key="childSlug" class="nav-item">
          <nuxt-link class="nav-link" :to="`/browse/${slug}/${childSlug}`">
            {{ child.label }}
          </nuxt-link>
        </li>
      </ul>
    </b-sidebar>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator';
import { filterStore } from '~/store';

@Component
export default class CategoriesSidebar extends Vue {
  @Prop({ type: Boolean, required: false, default: false })
  readonly isLoggedIn!: boolean;

  get categories() {
    return filterStore.categories;
  }
}
</script>
