<template>
  <div>
    <div class="row psykhe-welcome-width">
      <h1 class="psykhe-large-heading">How PSYKHE Works</h1>

      <p class="how-subtitle">The only shopping platform that allows for Sort by Personality</p>

      <p>
        We believe that your psychology - your personality - is the biggest factor that influences your personal style.
        It's why you can look at a dress and instantly say "that's me" or "that's not me" at a glance, without thinking
        about it too much.
      </p>

      <p>
        And so, to provide you with fashion recommendations that feel "you", we ask you take a personality test to use
        PSYKHE. We want to capture and systemize that you-ness so that you don't have to trawl through thousands of
        products that aren't you.
      </p>

      <p>
        Of course, individual style preferences are very nuanced and sometimes complicated. The more you use PSYKHE:
        look at, save, tune products that you like, the more our AI will ‘get' you - just like building a relationship
        with a very good stylist.
      </p>
    </div>

    <div class="row psykhe-welcome-width">
      <div class="col">
        <section class="how page-section">
          <h2 class="page-section-header mt-4">In a nutshell...</h2>
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
              <h4>Our algorithm uses your scores to sort by personality</h4>
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
    <section class="more extra-padding">
      <p>
        Find out more in
        <nuxt-link to="/faqs" class="btn-primary">PSYKHE’s FAQs</nuxt-link>
      </p>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  layout: 'unauthenticated'
})
export default class HowItWorks extends Vue {
  get metaTitle() {
    return 'How it Works | PSYKHE';
  }

  get metaDescription() {
    return `Discover how PSYKHE uses your science-based personality profile to deliver
            a personalized product feed from leading luxury fashion retailers. `;
  }

  head() {
    return {
      title: this.metaTitle,
      bodyAttrs: {
        class: 'page page-how-it-works'
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
