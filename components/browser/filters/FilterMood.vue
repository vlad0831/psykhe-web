<template>
  <div class="psykhe-browse-filters-filter psykhe-browse-filters-filter-mood">
    <transition name="fade">
      <div v-if="popupVisible" class="psykhe-help-pop psykhe-help-pop-mood">
        <div class="psykhe-help-pop-inner">
          <a class="close-button close-button-mood" @click="closePopup"></a>
          SWITCH IT UP<br />
          Play with your style to<br />
          change how you feel
        </div>
      </div>
    </transition>

    <div class="psykhe-browse-filters-filter-main" @click.capture="closePopup">
      <template v-if="activeMood.identifier !== 'baseline'">
        <nuxt-link :to="getMoodPath('baseline')">
          <button class="filter-remove"></button>
        </nuxt-link>
      </template>

      <b-dropdown>
        <template v-slot:button-content>
          <template v-if="activeMood.identifier === 'baseline'">By Mood</template>
          <template v-else>{{ activeMood.name }}</template>
        </template>

        <div class="drop-mood">I want to feel...</div>

        <template v-if="availableMoods.length === 0">
          <div class="drop-mood">No Moods</div>
        </template>

        <template v-else>
          <template v-for="(mood, key) in availableMoods">
            <nuxt-link :key="key" :to="getMoodPath(mood)" rel="nofollow">
              <b-dropdown-item-button v-if="mood.name.length">
                {{ mood.name }}
              </b-dropdown-item-button>
            </nuxt-link>
          </template>
        </template>
      </b-dropdown>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import { queryStore, filterStore, optionsStore } from '~/store';
import { QueryLinkService } from '~/services/query/query-link.service';

@Component
export default class FilterMood extends Vue {
  closePopup() {
    if (this.$auth.loggedIn) {
      optionsStore.publishOption({ key: 'closed_mood_popup', value: true });
    }
  }

  getMoodPath(mood: any) {
    if (mood.identifier === this.query.mood) {
      return {};
    }

    const updatedQuery = Object.assign({}, this.query);
    updatedQuery.mood = mood.identifier;

    return QueryLinkService.getInstance().createLinkFromQuery(updatedQuery, null);
  }

  get activeMood() {
    const mood = this.availableMoods.find((mood) => mood.identifier === this.query.mood);

    if (!mood) {
      return {
        identifier: 'baseline',
        name: 'By Mood'
      };
    }

    return mood;
  }

  get query() {
    return queryStore.getGlobalQueryParameters;
  }

  get availableMoods() {
    return filterStore.moods;
  }

  get popupVisible() {
    return this.$auth.loggedIn && optionsStore.hasFetchedOptions && !optionsStore.hasOption('closed_mood_popup');
  }
}
</script>
