<template>
  <div class="row">
    <account-profile></account-profile>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import AccountProfile from '~/components/user/AccountProfile.vue';

@Component({
  components: { AccountProfile },
  middleware: ['auth', 'require-pt-transmitted']
})
export default class Account extends Vue {
  head() {
    return {
      meta: [{ hid: 'robots', name: 'robots', content: 'noindex, nofollow' }],
      bodyAttrs: {
        class: 'page page-account'
      }
    };
  }
}
</script>
