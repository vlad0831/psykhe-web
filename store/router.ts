/* eslint-disable require-await */
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { Route } from 'vue-router';

@Module({ name: 'router', namespaced: true, stateFactory: true })
export default class RouterModule extends VuexModule {
  // Stack of routes previously visited by the user
  history: Route[] = [];

  // Stack of scroll positions, such that the last known scroll position of history[i] = scrollPositions[i]
  scrollPositions: ScrollPosition[] = [];

  get historySize() {
    return this.history.length;
  }

  get previousRoute() {
    return this.history.length ? this.history[0] : null;
  }

  get previousScrollPosition() {
    return this.scrollPositions.length ? this.scrollPositions[0] : null;
  }

  @Mutation
  setRouteHistory(payload: Route[]) {
    this.history = payload;
  }

  @Mutation
  setRouteScrollPositions(payload: ScrollPosition[]) {
    this.scrollPositions = payload;
  }

  // Pushes a previously visited route onto the stack
  @Action
  async pushRouteToHistory({ route, scrollPosition }: HistoryStackPayload) {
    this.context.commit('setRouteHistory', [route, ...this.history]);

    this.context.commit('setRouteScrollPositions', [
      { scrollX: scrollPosition.scrollX, scrollY: scrollPosition.scrollY },
      ...this.scrollPositions
    ]);
  }

  // Pops the last visited route from the stack and returns it
  @Action
  popRouteFromHistory(): HistoryStackPayload | null {
    if (!this.history.length) {
      return null;
    }

    const lastRoute = this.history[0];
    const lastScrollPosition = this.scrollPositions[0];

    this.context.commit('setRouteHistory', this.history.slice(1));
    this.context.commit('setRouteScrollPositions', this.scrollPositions.slice(1));

    return {
      route: lastRoute,
      scrollPosition: lastScrollPosition
    };
  }
}

export interface ScrollPosition {
  scrollX: number;
  scrollY: number;
}

export interface HistoryStackPayload {
  route: Route;
  scrollPosition: ScrollPosition;
}
