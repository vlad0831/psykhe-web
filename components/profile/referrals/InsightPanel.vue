<template>
  <div v-if="userReferrals.length >= insightRevealThreshold" class="page-insights-unlocked w-50 m-auto text-center">
    <h2 class="w-100 text-center mb-4">First Insight Unlocked!</h2>
    <h1 v-if="populationDistancePercentage < 33" class="w-100 text-center" style="font-family: 'Playfair Display'">
      Your very own vibe
    </h1>
    <h1 v-else-if="populationDistancePercentage < 66" class="w-100 text-center" style="font-family: 'Playfair Display'">
      Not so basic
    </h1>
    <h1 v-else class="w-100 text-center" style="font-family: 'Playfair Display'">Fashion to the core</h1>

    <h3 class="w-100 text-center">You're like {{ populationDistancePercentage }}% of the fashion population.</h3>

    <p v-if="populationDistancePercentage < 33">
      <b>Your very own vibe:</b> compared to the rest of the people that have taken this test, your personality is quite
      unique, and your style probably is too.
    </p>
    <p v-else-if="populationDistancePercentage < 66">
      <b>Not so basic:</b> compared to the rest of the users that have taken this test, your personality is pretty
      unique, yet you probably have a lot in common with other fashion people, and like similar vibes too.
    </p>
    <p v-else>
      <b>Fashion to the core:</b> compared to the rest of the users that have taken this test, your personality is
      pretty similar, so you probably have a lot in common with other fashion people, and appreciate similar vibes too.
    </p>

    <p class="font-italic mt-5">Thank you for being an early adopter of PSYKHE.</p>
    <p class="font-italic">
      Stay tuned for our launch to discover your AI and psychology-powered recommendations from leading brands and
      retailers.
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class InsightPanel extends Vue {
  @Prop({ required: true, type: Array })
  readonly userReferrals!: String[];

  @Prop({ required: true, type: Number })
  readonly populationDistancePercentage!: Number;

  insightRevealThreshold: Number = 3;
}
</script>
