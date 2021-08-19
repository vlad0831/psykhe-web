<template>
  <div class="home-wrapper">
    <div class="page-home-hero ban-cols">
      <div class="col ban-col-1">
        <deferred-figure
          :asset-key="'home/hero-side'"
          :pool="'page'"
          :constraints="{ width: 1000, height: 600 }"
        ></deferred-figure>
      </div>
      <div class="col ban-col-2">
        <div class="inner">
          <h2 class="page-section-header">Fashion, personalized by your personality</h2>
          <h4>
            PSYKHE is a shopping platform where you can see products from all your favorite brands matched to your
            personality.
          </h4>

          <h4>Sign up and take our personality test to discover your style sense of self.</h4>

          <div class="cta-buttons">
            <router-link class="btn-home light" :to="isLoggedIn ? '/personality-test' : '/register'"
              >Take the test</router-link
            >

            <router-link class="btn-home" to="/browse">Shop First</router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="row home-press">
      <div class="inner">
        <div class="col col-1">
          <div class="press-logo logo-vb"></div>
          <p>
            “New e-commerce platform PSYKHE makes recommendations based on personality traits by identifying both user
            and products.”
          </p>
        </div>
        <div class="col col-2">
          <div class="press-logo logo-tech"></div>
          <p>“Each user sees a different storefront that becomes increasingly personalized.”</p>
        </div>
        <div class="col col-3">
          <div class="press-logo logo-ft"></div>
          <p>
            “Clothes have qualities that we seek for psychological pay-off. It’s why one outfit makes us feel electric
            and another feels wrong.”
          </p>
        </div>
      </div>
    </div>

    <div class="row home-discover">
      <div class="col col-1"></div>
      <div class="col col-2">
        <div class="inner">
          <h2 class="page-section-header">Discover why you wear what you wear</h2>
          <h4>Self-knowledge is the antidote to mindless overconsumption.</h4>

          <h4>
            Use our psychology-powered AI to find pieces that are really you. Buy less pieces you’re not sure about.
            More that you love.
          </h4>
          <div class="actions">
            <router-link class="btn-home" :to="isLoggedIn ? '/personality-test' : '/register'"
              >Take the test</router-link
            >
          </div>
        </div>
      </div>
    </div>

    <div class="page-home-quote">
      <div class="col">
        <section class="quote">
          <div class="quote-text">
            <span class="d-none d-md-inline"> OUR AI: THE BRAIN OF A SUPERSTYLIST WHO GETS YOU AND YOUR STYLE </span>
          </div>
        </section>
      </div>
    </div>

    <div class="row home-how-psykhe-works">
      <div class="col col-1">
        <div class="inner">
          <h2 class="page-section-header">How PSYKHE Works</h2>
          <ul class="steps">
            <li class="step">
              <h4>You take the test</h4>
              <p>
                In under 3 minutes, you’ll complete the Big Five test, the most respected measure of personality within
                psychology, with questions supplemented by PSYKHE.
              </p>
            </li>
            <li class="step">
              <h4>We create your personality profile based on 5 key traits</h4>
              <p>
                You'll receive the results of your unique Big 5 personality profile, key to understanding your personal
                style.
              </p>
            </li>
            <li class="step">
              <h4>Our algorithm uses your scores to sort by personality</h4>
              <p>
                Our AI goes through all leading fashion retailers to pick out your best fashion matches, so you don't
                have to browse through pages of stuff.
              </p>
            </li>
            <li class="step">
              <h4>You can also shop by mood, create custom lists, and tune your feed</h4>
              <p>
                You can tweak your results according to mood, zap away things you don't like, train your personal
                algorithm, and save products for trips and events.
              </p>
            </li>
          </ul>

          <div class="actions">
            <a class="btn-home" :href="isLoggedIn ? '/personality-test' : '/register'">SIGN UP</a>
          </div>
        </div>
      </div>
      <div class="col how-it-works-img"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { UserMixin } from '~/mixins/userMixin';
import DeferredFigure from '~/components/common/DeferredFigure.vue';

@Component({
  layout: 'unauthenticated',
  middleware: 'require-unauthenticated',
  components: {
    DeferredFigure
  }
})
export default class Index extends UserMixin {
  head() {
    return {
      bodyAttrs: {
        class: 'page page-home'
      }
    };
  }
}
</script>
