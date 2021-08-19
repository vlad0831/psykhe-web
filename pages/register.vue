<template>
  <div>
    <div id="take-the-test" class="page-register-hero">
      <div class="col">
        <div>
          <registration></registration>
        </div>
      </div>
      <div class="col">
        <deferred-figure
          :pool="'page'"
          :asset-key="'home/hero-side'"
          :constraints="{ width: 1000, height: 600 }"
        ></deferred-figure>
      </div>
    </div>

    <div class="row testimonial-holder">
      <div class="testimonial">
        <div class="col psykhe-welcome-width">
          <div class="testimonial-image">
            <deferred-figure
              :pool="'page'"
              :asset-key="'register/testimonial/lara'"
              :constraints="{ width: 1, height: 1 }"
            ></deferred-figure>
          </div>

          <div class="text">
            <p>
              "I don’t think anyone ever has described me so well. I can't wait to see what clothes I get matched with."
            </p>
            <span>Lara Vanjak, London</span>
          </div>
        </div>
      </div>

      <div class="testimonial">
        <div class="col psykhe-welcome-width">
          <div class="text" style="text-align: right">
            <p>
              "So excited for this! Just took my quiz and it was spot on. Can’t wait to see what comes up for my
              friends."
            </p>
            <span>Saheedat Abdul, NYC</span>
          </div>

          <div class="testimonial-image" style="text-align: right">
            <deferred-figure
              :pool="'page'"
              :asset-key="'register/testimonial/saheedat-abdul'"
              :constraints="{ width: 1, height: 1 }"
            ></deferred-figure>
          </div>
        </div>
      </div>
    </div>

    <div class="row psykhe-welcome-width">
      <div class="col">
        <section class="how page-section">
          <h2 class="page-section-header">How PSYKHE Works...</h2>
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
                You’ll receive the results of your unique personality profile in terms of the Big Five traits, key to
                understanding your personal style and aesthetic preference.
              </p>
            </li>
            <li class="step">
              <h4>Our algorithm uses your personality scores to tailor fashion recommendations</h4>
              <p>
                Our patent-pending AI model predicts what pieces you'll like most from leading fashion retailers so you
                don't have to wade through pages and pages of stuff.
              </p>
            </li>
            <li class="step">
              <h4>You can also shop by mood, create custom lists, and tune your feed</h4>
              <p>
                You can tweak your results according to mood and how you want to feel, create shortlists for events and
                holidays, and zap away things you don’t like.
              </p>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <section class="more" style="border: none; padding-bottom: 30px">
      <p>
        <a href="#take-the-test" class="btn-primary">Take the test</a>
      </p>
    </section>

    <div class="psykhe-welcome-width">
      <div class="col">
        <section class="page-section features">
          <h2 class="page-section-header" style="padding-bottom: 30px">PSYKHE Features</h2>
          <ul class="features">
            <li class="feature">
              <h4>Personalized by Personality</h4>
              <p>Shape your own algorithm and see more of what you like, and less of what you don't like.</p>
            </li>
            <li class="feature">
              <h4>Shop by Mood</h4>
              <p>
                Want to feel happier? More confident? Calmer? Romantic? Discover clothes that trigger these qualities.
              </p>
            </li>
            <li class="feature">
              <h4>Global Retailers</h4>
              <p>
                Shop leading fashion brands and retailers all in one place, with product for your personality at the
                forefront.
              </p>
            </li>
            <li class="feature">
              <h4>Fine-Tuning</h4>
              <p>
                Love a product? Click the tick below it to save. Not into it? Click the x and zap it away. These actions
                are remembered by your algorithm.
              </p>
            </li>
          </ul>
        </section>
      </div>
    </div>
    <section class="more extra-padding" style="border: none">
      <p>
        <a href="#take-the-test" class="btn-primary">Know yourself</a>
      </p>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Registration from '~/components/user/Registration.vue';
import DeferredFigure from '~/components/common/DeferredFigure.vue';

@Component({
  layout: 'unauthenticated',
  middleware: 'require-unauthenticated',
  components: { DeferredFigure, Registration }
})
export default class Register extends Vue {
  get metaTitle() {
    return 'Register | PSYKHE';
  }

  get metaDescription() {
    return `Enter your details to take the Big 5 personality test so you can begin using
            PSYKHE's highly tailored shopping platform and shop by personality.`;
  }

  head() {
    return {
      title: this.metaTitle,
      bodyAttrs: {
        class: 'page page-register'
      },
      meta: [
        { hid: 'description', name: 'description', content: this.metaDescription },
        { hid: 'og:title', name: 'og:title', content: this.metaTitle },
        { hid: 'og:description', name: 'og:description', content: this.metaDescription },
        { hid: 'twitter:title', name: 'twitter:title', content: this.metaTitle },
        { hid: 'twitter:description', name: 'twitter:description', content: this.metaDescription }
      ]
    };
  }
}
</script>
