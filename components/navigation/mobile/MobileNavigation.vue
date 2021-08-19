<template>
  <div>
    <main-sidebar />
    <categories-sidebar />
    <editorial-sidebar />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';

import MainSidebar from '~/components/navigation/mobile/MainSidebar.vue';
import EditorialSidebar from '~/components/navigation/mobile/EditorialSidebar.vue';
import CategoriesSidebar from '~/components/navigation/mobile/CategoriesSidebar.vue';

@Component({
  components: { MainSidebar, CategoriesSidebar, EditorialSidebar }
})
export default class MobileNavigation extends Vue {}
</script>
