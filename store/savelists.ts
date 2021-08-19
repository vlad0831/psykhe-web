import { Module, VuexModule, Mutation, Action, config } from 'vuex-module-decorators';
import { Savelist } from '~/types/savelist/savelist';
import { Product } from '~/models/product';

config.rawError = true;

@Module({
  name: 'savelists',
  namespaced: true,
  stateFactory: true
})
export default class SavelistsModule extends VuexModule {
  // State
  limit: number = 8;
  savelists: Savelist[] = [];
  fetchedSavelists: boolean = false;

  // Getters
  get canCreateNewSavelist() {
    return this.visibleSavelists.length < this.limit;
  }

  get hasFetchedSavelists() {
    return this.fetchedSavelists;
  }

  get allSavelists() {
    return this.savelists;
  }

  get visibleSavelists() {
    return this.savelists.filter(
      (savelist: Savelist) => !['liked', 'disliked', 'default'].includes(savelist.slug as string)
    );
  }

  get hasSavelistWithSlug() {
    return (slug: string) => this.savelists.some((savelist: Savelist) => savelist.slug === slug);
  }

  // Mutations
  @Mutation
  addSavelist(payload: Savelist) {
    this.savelists.push(payload);
  }

  @Mutation
  setSavelists(payload: Savelist[]) {
    this.savelists = payload;
  }

  @Mutation
  filterSavelists(callback: (savelist: Savelist) => boolean) {
    this.savelists = this.savelists.filter(callback);
  }

  @Mutation
  markSavelistsAsFetched() {
    this.fetchedSavelists = true;
  }

  // Actions
  @Action
  async fetchSavelistsIfNescessary() {
    if (this.fetchedSavelists) {
      return;
    }

    const savelists: Savelist[] = await this.store.$savelistsService.all();

    this.context.commit('setSavelists', savelists);
    this.context.commit('markSavelistsAsFetched');
  }

  @Action
  async createSavelist(savelist: Savelist) {
    const response = await this.store.$savelistsService.create(savelist);

    // Set the new savelists slug from the response
    savelist.slug = response.slug;

    this.context.commit('addSavelist', savelist);
  }

  @Action
  async renameSavelist(savelist: Savelist) {
    try {
      const response = await this.store.$savelistsService.update(savelist);

      this.context.commit('setSavelists', [
        ...this.savelists.filter((value) => value.slug !== savelist.slug),
        {
          name: savelist.name,
          slug: response.slug
        }
      ]);
    } catch {}
  }

  @Action
  async deleteSavelist(savelist: Savelist) {
    await this.store.$savelistsService.delete(savelist);

    this.context.commit('filterSavelists', (target: Savelist) => target.slug !== savelist.slug);
  }
}
