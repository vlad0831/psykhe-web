<template>
  <global-browser-grid :zapping-enabled="true" :filters-enabled="true" :page-size="30" />
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';

import GlobalBrowserGrid from '~/components/browser/GlobalBrowserGrid.vue';

@Component({
  layout: 'browse',
  components: { GlobalBrowserGrid },
  middleware: ['require-pt-when-logged-in']
})
export default class Browse extends Vue {}
</script>
