import { Module, VuexModule, Mutation, Action, config } from 'vuex-module-decorators';
import { Option } from '~/types/user/option';

config.rawError = true;

@Module({
  name: 'options',
  namespaced: true,
  stateFactory: true
})
export default class OptionsModule extends VuexModule {
  // State
  options: Option[] = [];
  fetchedOptions: boolean = false;

  noLoginZapCount: number = 0;
  noLoginLastZappedProduct: string = '';
  noLoginLastSavedProduct: string = '';

  // Getters
  get allOptions() {
    return this.options;
  }

  get hasFetchedOptions() {
    return this.fetchedOptions;
  }

  get hasOption() {
    return (key: string) => this.options.some((option: Option) => option.key === key);
  }

  get getOptionValue() {
    return (key: string) => {
      const option = this.options.find((option: Option) => option.key === key);

      return option !== undefined ? (option as Option).value : undefined;
    };
  }

  get noLoginZapLimitExceeded() {
    return this.noLoginZapCount > 2;
  }

  get getNoLoginLastSavedProduct() {
    return this.noLoginLastSavedProduct;
  }

  // Mutations
  @Mutation
  setOptions(payload: Option[]) {
    this.options = payload;
  }

  @Mutation
  setOption(payload: Option) {
    const optionIndex = this.options.findIndex((option: Option) => option.key === payload.key);

    if (optionIndex !== -1) {
      this.options[optionIndex].value = payload.value;
    } else {
      this.options.push(payload);
    }
  }

  @Mutation
  markOptionsAsFetched() {
    this.fetchedOptions = true;
  }

  @Mutation
  setNoLoginZapCount(payload: number) {
    this.noLoginZapCount = payload;
  }

  @Mutation
  setNoLoginLastZappedProduct(payload: string) {
    this.noLoginLastZappedProduct = payload;
  }

  @Mutation
  setNoLoginLastSavedProduct(payload: string) {
    this.noLoginLastSavedProduct = payload;
  }

  // Actions
  @Action
  async publishOption(payload: Option) {
    await this.store.$optionsService.update(payload);

    this.context.commit('setOption', payload);
  }

  @Action
  async fetchOptionsIfNescessary() {
    if (this.fetchedOptions) {
      return;
    }

    const options = await this.store.$optionsService.all();

    this.context.commit('setOptions', options);
    this.context.commit('markOptionsAsFetched', true);
  }

  @Action
  trackNoLoginInteraction({ productIdentifier, zapped }: TrackNoLoginInteractionPayload) {
    if (zapped) {
      this.context.commit('setNoLoginZapCount', this.noLoginZapCount + 1);
    }

    this.context.commit('setNoLoginLastZappedProduct', productIdentifier);
  }

  @Action
  trackNoLoginSavelistInteraction(productIdentifier: string) {
    this.context.commit('setNoLoginLastSavedProduct', productIdentifier);
  }
}

export interface TrackNoLoginInteractionPayload {
  zapped: boolean;
  productIdentifier: string;
}
