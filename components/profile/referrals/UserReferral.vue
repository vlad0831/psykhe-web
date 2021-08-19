<template>
  <ul>
    <li v-for="(referral, index) in liveReferrals" :key="index">
      <referral-entry :referral="referral" :disabled-field="referral.email"></referral-entry>
    </li>
  </ul>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ReferralEntry from '~/components/profile/referrals/ReferralEntry.vue';
import { Referral } from '~/types/user/referral';

@Component({
  components: { ReferralEntry }
})
export default class UserReferral extends Vue {
  @Prop({ required: false, type: Number, default: 5 })
  readonly boxes!: number;

  @Prop({ required: true, type: Array })
  readonly userReferrals!: Referral[];

  liveReferrals: Referral[] = [];

  created() {
    let counter = 0;

    while (counter < this.boxes) {
      this.liveReferrals[counter] = this.userReferrals[counter];

      if (!this.userReferrals[counter]) {
        this.liveReferrals[counter] = {} as Referral;
      }

      ++counter;
    }
  }
}
</script>
