<template>
  <div>
    <div class="profile-top">
      <div :class="[{ 'with-avatar': hasAvatar }, 'row']">
        <section v-if="hasAvatar" class="page-profile-hero">
          <deferred-figure
            :pool="'user'"
            :asset-key="userIdentifier"
            :constraints="{ width: 230, height: 230 }"
            :cache-refresh="avatarUploaded"
          ></deferred-figure>
        </section>

        <section :class="[{ 'with-avatar': hasAvatar }, 'page-profile-intro']">
          <h3>
            <span>Hi {{ userNameFirst }},</span> your personality code is
            {{ `${oceanRounded.O}${oceanRounded.C}${oceanRounded.E}${oceanRounded.A}${oceanRounded.N}` }}
          </h3>

          <p class="mob-hide-sm">
            Using a version of the Big 5 model of personality traits, we've calculated your scores below. Within
            psychology, this model is the most trusted framework for measuring personality, and has a known relationship
            with style preferences. If you've ever wondered why you're drawn to certain colors, shapes, prints, or
            brands, your personality scores can help you understand why.
          </p>

          <p class="mob-hide-sm">
            Your core personal style is arrived at from how the five scores combine and interact together, and not from
            one score alone, for an aesthetic that's uniquely yours. Read on for an explanation of how you scored within
            each scale.
          </p>
        </section>

        <section class="page-profile-actions mob-hide-sm">
          <nuxt-link to="/lists" class="page-profile-actions-saved"> My Lists</nuxt-link>
          <nuxt-link to="/account" class="page-profile-actions-account"> My Account</nuxt-link>
        </section>

        <section class="profile-trait-bars mob-vis-sm">
          <div role="tablist">
            <a class="trait-bar active" @click="selectedMobileTrait = 'openness'">
              <span class="trait-text">Openness {{ oceanPercentage.O | numFormat(0) }}%</span>
              <span class="trait-bar-inner" :style="metricBarStyle(oceanPercentage.O)"></span>
            </a>

            <a class="trait-bar" @click="selectedMobileTrait = 'conscientiousness'">
              <span class="trait-text">CONSCIENTIOUSNESS {{ oceanPercentage.C | numFormat(0) }}%</span>
              <span class="trait-bar-inner" :style="metricBarStyle(oceanPercentage.C)"></span>
            </a>

            <a class="trait-bar" @click="selectedMobileTrait = 'extroversion'">
              <span class="trait-text">EXTROVERSION {{ oceanPercentage.E | numFormat(0) }}%</span>
              <span class="trait-bar-inner" :style="metricBarStyle(oceanPercentage.E)"></span>
            </a>

            <a class="trait-bar" @click="selectedMobileTrait = 'agreeableness'">
              <span class="trait-text">AGREEABLENESS {{ oceanPercentage.A | numFormat(0) }}%</span>
              <span class="trait-bar-inner" :style="metricBarStyle(oceanPercentage.A)"></span>
            </a>

            <a class="trait-bar" @click="selectedMobileTrait = 'neuroticism'">
              <span class="trait-text">NEUROTICISM {{ oceanPercentage.N | numFormat(0) }}%</span>

              <span class="trait-bar-inner" :style="metricBarStyle(oceanPercentage.N)"></span>
            </a>
          </div>
        </section>

        <div class="profile-top-message mob-vis-sm">Tap your result above for more detail</div>
      </div>
    </div>

    <div class="page-profile-traits">
      <b-tabs class="mob-hide-sm" fill>
        <b-tab :title="tabTitle('Openness', oceanPercentage.O, oceanRounded.O)">
          <profile-trait
            :active="true"
            :slug="'openness'"
            :label="'Openness'"
            :score-rounded="oceanRounded.O"
            :score-human="oceanHuman.O"
            :score-percentage="oceanPercentage.O"
          >
            <openness :range="oceanHuman.O"></openness>
          </profile-trait>
        </b-tab>

        <b-tab :title="tabTitle('Conscientiousness', oceanPercentage.C, oceanRounded.C)">
          <profile-trait
            :active="false"
            :slug="'conscientiousness'"
            :label="'Conscientiousness'"
            :score-rounded="oceanRounded.C"
            :score-human="oceanHuman.C"
            :score-percentage="oceanPercentage.C"
          >
            <conscientiousness :range="oceanHuman.C"></conscientiousness>
          </profile-trait>
        </b-tab>

        <b-tab :title="tabTitle('Extroversion', oceanPercentage.E, oceanRounded.E)">
          <profile-trait
            :active="false"
            :slug="'extroversion'"
            :label="'Extroversion'"
            :score-rounded="oceanRounded.E"
            :score-human="oceanHuman.E"
            :score-percentage="oceanPercentage.E"
          >
            <extroversion :range="oceanHuman.E"></extroversion>
          </profile-trait>
        </b-tab>

        <b-tab :title="tabTitle('Agreeableness', oceanPercentage.A, oceanRounded.A)">
          <profile-trait
            :active="false"
            :slug="'agreeableness'"
            :label="'Agreeableness'"
            :score-rounded="oceanRounded.A"
            :score-human="oceanHuman.A"
            :score-percentage="oceanPercentage.A"
          >
            <agreeableness :range="oceanHuman.A"></agreeableness>
          </profile-trait>
        </b-tab>

        <b-tab :title="tabTitle('Neuroticism', oceanPercentage.N, oceanRounded.N)">
          <profile-trait
            :active="false"
            :slug="'neuroticism'"
            :label="'Neuroticism'"
            :score-rounded="oceanRounded.N"
            :score-human="oceanHuman.N"
            :score-percentage="oceanPercentage.N"
          >
            <neuroticism :range="oceanHuman.N"></neuroticism>
          </profile-trait>
        </b-tab>
      </b-tabs>

      <div class="mob-vis-sm tab-content">
        <profile-trait
          v-if="selectedMobileTrait === 'openness'"
          :active="true"
          :slug="'openness'"
          :label="'Openness'"
          :score-rounded="oceanRounded.O"
          :score-human="oceanHuman.O"
          :score-percentage="oceanPercentage.O"
        >
          <openness :range="oceanHuman.O"></openness>
        </profile-trait>

        <profile-trait
          v-if="selectedMobileTrait === 'conscientiousness'"
          :active="false"
          :slug="'conscientiousness'"
          :label="'Conscientiousness'"
          :score-rounded="oceanRounded.C"
          :score-human="oceanHuman.C"
          :score-percentage="oceanPercentage.C"
        >
          <conscientiousness :range="oceanHuman.C"></conscientiousness>
        </profile-trait>

        <profile-trait
          v-if="selectedMobileTrait === 'extroversion'"
          :active="false"
          :slug="'extroversion'"
          :label="'Extroversion'"
          :score-rounded="oceanRounded.E"
          :score-human="oceanHuman.E"
          :score-percentage="oceanPercentage.E"
        >
          <extroversion :range="oceanHuman.E"></extroversion>
        </profile-trait>

        <profile-trait
          v-if="selectedMobileTrait === 'agreeableness'"
          :active="false"
          :slug="'agreeableness'"
          :label="'Agreeableness'"
          :score-rounded="oceanRounded.A"
          :score-human="oceanHuman.A"
          :score-percentage="oceanPercentage.A"
        >
          <agreeableness :range="oceanHuman.A"></agreeableness>
        </profile-trait>

        <profile-trait
          v-if="selectedMobileTrait === 'neuroticism'"
          :active="false"
          :slug="'neuroticism'"
          :label="'Neuroticism'"
          :score-rounded="oceanRounded.N"
          :score-human="oceanHuman.N"
          :score-percentage="oceanPercentage.N"
        >
          <neuroticism :range="oceanHuman.N"></neuroticism>
        </profile-trait>
      </div>
    </div>

    <section class="page-profile-actions mob-vis-sm">
      <nuxt-link to="/lists" class="page-profile-actions-saved"> My Lists</nuxt-link>
      <nuxt-link to="/account" class="page-profile-actions-account"> My Account</nuxt-link>
    </section>

    <div class="page-profile-matches">
      <nav>
        <div class="nav nav-tabs" role="tablist">
          <a
            class="nav-item nav-link"
            :class="{ active: activeTab === MatchesTab.BEST }"
            data-toggle="tab"
            role="tab"
            @click="switchTab(MatchesTab.BEST)"
          >
            Current best matches
          </a>

          <a
            class="nav-item nav-link"
            :class="{ active: activeTab === MatchesTab.CLOTHING }"
            data-toggle="tab"
            role="tab"
            @click="switchTab(MatchesTab.CLOTHING)"
          >
            Best clothing matches
          </a>

          <a
            class="nav-item nav-link"
            :class="{ active: activeTab === MatchesTab.BAGS }"
            data-toggle="tab"
            role="tab"
            @click="switchTab(MatchesTab.BAGS)"
          >
            Best bag matches
          </a>

          <a
            class="nav-item nav-link"
            :class="{ active: activeTab === MatchesTab.SHOES }"
            data-toggle="tab"
            role="tab"
            @click="switchTab(MatchesTab.SHOES)"
          >
            Best shoe matches
          </a>

          <a
            class="nav-item nav-link"
            :class="{ active: activeTab === MatchesTab.ACCESSORIES }"
            data-toggle="tab"
            role="tab"
            @click="switchTab(MatchesTab.ACCESSORIES)"
          >
            Best accessories matches
          </a>
        </div>
      </nav>

      <div class="tab-content">
        <div
          id="profile-matches-tab-best"
          class="tab-pane fade show"
          :class="{ active: activeTab === MatchesTab.BEST }"
          role="tabpanel"
        >
          <custom-browser-grid
            :zapping-enabled="true"
            :custom-query="bestMatchesQuery"
            :page-size="12"
            @loaded="handleTabLoaded(MatchesTab.BEST)"
          />

          <div v-if="tabLoaded(MatchesTab.BEST)" class="see-more-container">
            <nuxt-link :to="QueryLinkService.getInstance().createLinkFromQuery(bestMatchesQuery, null)">
              See more</nuxt-link
            >
          </div>
        </div>

        <div
          id="profile-matches-tab-clothes"
          class="tab-pane fade show"
          :class="{ active: activeTab === MatchesTab.CLOTHING }"
          role="tabpanel"
        >
          <custom-browser-grid
            :zapping-enabled="true"
            :custom-query="bestClothingQuery"
            :page-size="12"
            @loaded="handleTabLoaded(MatchesTab.CLOTHING)"
          />

          <div v-if="tabLoaded(MatchesTab.CLOTHING)" class="see-more-container">
            <nuxt-link :to="QueryLinkService.getInstance().createLinkFromQuery(bestClothingQuery, null)">
              See more
            </nuxt-link>
          </div>
        </div>

        <div
          id="profile-matches-tab-bags"
          class="tab-pane fade show"
          :class="{ active: activeTab === MatchesTab.BAGS }"
          role="tabpanel"
        >
          <custom-browser-grid
            :zapping-enabled="true"
            :custom-query="bestBagsQuery"
            :page-size="12"
            @loaded="handleTabLoaded(MatchesTab.BAGS)"
          />

          <div v-if="tabLoaded(MatchesTab.BAGS)" class="see-more-container">
            <nuxt-link :to="QueryLinkService.getInstance().createLinkFromQuery(bestBagsQuery, null)">
              See more
            </nuxt-link>
          </div>
        </div>

        <div
          id="profile-matches-tab-shoes"
          class="tab-pane fade show"
          :class="{ active: activeTab === MatchesTab.SHOES }"
          role="tabpanel"
        >
          <custom-browser-grid
            :zapping-enabled="true"
            :custom-query="bestShoesQuery"
            :page-size="12"
            @loaded="handleTabLoaded(MatchesTab.SHOES)"
          />

          <div v-if="tabLoaded(MatchesTab.SHOES)" class="see-more-container">
            <nuxt-link :to="QueryLinkService.getInstance().createLinkFromQuery(bestShoesQuery, null)">
              See more
            </nuxt-link>
          </div>
        </div>

        <div
          id="profile-matches-tab-accessories"
          class="tab-pane fade show"
          :class="{ active: activeTab === MatchesTab.ACCESSORIES }"
          role="tabpanel"
        >
          <custom-browser-grid
            :zapping-enabled="true"
            :custom-query="bestAccessoriesQuery"
            :page-size="12"
            @loaded="handleTabLoaded(MatchesTab.ACCESSORIES)"
          />

          <div v-if="tabLoaded(MatchesTab.ACCESSORIES)" class="see-more-container">
            <nuxt-link :to="QueryLinkService.getInstance().createLinkFromQuery(bestAccessoriesQuery, null)">
              See more
            </nuxt-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import DeferredFigure from '~/components/common/DeferredFigure.vue';
import { UserMixin } from '~/mixins/userMixin';
import ProfileTrait from '~/components/profile/ProfileTrait.vue';
import Openness from '~/components/profile/traits/Openness.vue';
import Conscientiousness from '~/components/profile/traits/Conscientiousness.vue';
import Extroversion from '~/components/profile/traits/Extroversion.vue';
import Agreeableness from '~/components/profile/traits/Agreeableness.vue';
import Neuroticism from '~/components/profile/traits/Neuroticism.vue';
import { initialQueryParameters } from '~/types/query/query';
import CustomBrowserGrid from '~/components/browser/CustomBrowserGrid.vue';
import { QueryLinkService } from '~/services/query/query-link.service';

enum MatchesTab {
  BEST = 'best',
  BAGS = 'bags',
  SHOES = 'shoes',
  CLOTHING = 'clothing',
  ACCESSORIES = 'accessories'
}

@Component({
  components: {
    Neuroticism,
    Agreeableness,
    Extroversion,
    Conscientiousness,
    Openness,
    ProfileTrait,
    DeferredFigure,
    CustomBrowserGrid
  },
  mixins: [UserMixin],
  middleware: ['auth', 'require-pt-transmitted', 'require-profile-complete']
})
export default class Profile extends UserMixin {
  activeTab: MatchesTab = MatchesTab.BEST;
  selectedMobileTrait: String = 'openness';

  MatchesTab = MatchesTab;
  QueryLinkService = QueryLinkService;

  loadedTabs: MatchesTab[] = [];
  viewedTabs: MatchesTab[] = [MatchesTab.BEST];

  head() {
    return {
      meta: [{ hid: 'robots', name: 'robots', content: 'noindex, nofollow' }],
      bodyAttrs: {
        class: 'page page-profile'
      }
    };
  }

  metricBarStyle(value: String) {
    return 'width:' + value + '%';
  }

  tabTitle(text: String, value: String, score: String) {
    return text + ' ' + Vue.filter('numFormat')(value, 0) + '%' + ` (${score})`;
  }

  switchTab(type: MatchesTab) {
    if (!this.viewedTabs.includes(type)) {
      this.viewedTabs.push(type);
    }

    this.activeTab = type;
  }

  handleTabLoaded(tab: MatchesTab) {
    this.loadedTabs = [...this.loadedTabs, tab];
  }

  tabLoaded(tab: MatchesTab) {
    return this.loadedTabs.includes(tab);
  }

  get bestMatchesQuery() {
    return this.viewedTabs.includes(MatchesTab.BEST) ? initialQueryParameters() : null;
  }

  get bestClothingQuery() {
    return this.viewedTabs.includes(MatchesTab.CLOTHING)
      ? {
          ...initialQueryParameters(),
          categories: ['clothes']
        }
      : null;
  }

  get bestBagsQuery() {
    return this.viewedTabs.includes(MatchesTab.BAGS)
      ? {
          ...initialQueryParameters(),
          categories: ['bags']
        }
      : null;
  }

  get bestShoesQuery() {
    return this.viewedTabs.includes(MatchesTab.SHOES)
      ? {
          ...initialQueryParameters(),
          categories: ['shoes']
        }
      : null;
  }

  get bestAccessoriesQuery() {
    return this.viewedTabs.includes(MatchesTab.ACCESSORIES)
      ? {
          ...initialQueryParameters(),
          categories: ['accessories']
        }
      : null;
  }
}
</script>
