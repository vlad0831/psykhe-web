<template>
  <div :id="'profile-tab-' + slug" :class="[{ active: 'active' }, 'tab-pane show ']" role="tabpanel">
    <div class="row">
      <div class="col">
        <div class="page-profile-traits-top">
          <div class="page-profile-traits-hero">
            <deferred-figure
              :pool="'page'"
              :asset-key="'profile/' + slug + '/' + scoreRounded"
              :constraints="{ width: 150, height: 100 }"
            ></deferred-figure>
          </div>
          <hr class="mob-hide-sm" />
          <div class="page-profile-traits-score">
            <div class="page-profile-traits-score-breakdown mob-hide-sm">
              <h4>{{ label }}</h4>
              <p class="page-profile-traits-score-breakdown-item">
                <span class="page-profile-traits-score-breakdown-item-range">80-100</span>
                <span class="page-profile-traits-score-breakdown-item-human">High = 5</span>
              </p>
              <p class="page-profile-traits-score-breakdown-item">
                <span class="page-profile-traits-score-breakdown-item-range">60-80</span>
                <span class="page-profile-traits-score-breakdown-item-human">Moderate-High = 4</span>
              </p>
              <p class="page-profile-traits-score-breakdown-item">
                <span class="page-profile-traits-score-breakdown-item-range">40-60</span>
                <span class="page-profile-traits-score-breakdown-item-human">Moderate = 3</span>
              </p>
              <p class="page-profile-traits-score-breakdown-item">
                <span class="page-profile-traits-score-breakdown-item-range">20-40</span>
                <span class="page-profile-traits-score-breakdown-item-human">Moderate-Low = 2</span>
              </p>
              <p class="page-profile-traits-score-breakdown-item">
                <span class="page-profile-traits-score-breakdown-item-range">0-20</span>
                <span class="page-profile-traits-score-breakdown-item-human">Low = 1</span>
              </p>
            </div>
            <div class="page-profile-traits-score-hero">
              <div class="page-profile-traits-score-hero-percentage">
                {{ scorePercentage | numFormat(0) }}
              </div>
              <h3 class="mob-vis-sm">You scored {{ scoreHuman }} on {{ label }}</h3>
            </div>
          </div>
        </div>
      </div>
      <div class="col">
        <h3 class="mob-hide-sm">You scored {{ scoreHuman }} on {{ label }}</h3>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import DeferredFigure from '~/components/common/DeferredFigure.vue';
@Component({
  components: { DeferredFigure }
})
export default class ProfileTrait extends Vue {
  @Prop({ required: true, type: String })
  slug!: string;

  @Prop({ required: true, type: Boolean })
  active!: boolean;

  @Prop({ required: true, type: String })
  label!: string;

  @Prop({ required: true, type: String })
  scoreRounded!: string;

  @Prop({ required: true, type: String })
  scoreHuman!: string;

  @Prop({ required: true, type: String })
  scorePercentage!: string;
}
</script>
