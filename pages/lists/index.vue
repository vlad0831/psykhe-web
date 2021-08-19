<template>
  <div class="page page-lists">
    <div class="row">
      <h2>Your Lists</h2>
      <hr />
    </div>

    <div class="page-lists-savelists">
      <list-manager />
    </div>

    <div class="psykhe-browse-main">
      <global-browser-grid
        :expire-always="true"
        :zapping-enabled="false"
        :filters-enabled="false"
        :page-size="Number.MAX_SAFE_INTEGER"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';

import ListManager from '~/components/savelists/ListManager.vue';
import GlobalBrowserGrid from '~/components/browser/GlobalBrowserGrid.vue';

@Component({
  components: { ListManager, GlobalBrowserGrid },
  middleware: ['auth', 'require-pt-transmitted']
})
export default class Lists extends Vue {}
</script>
