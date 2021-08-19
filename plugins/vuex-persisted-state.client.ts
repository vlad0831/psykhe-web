import createPersistedState from 'vuex-persistedstate';
import { Store } from 'vuex';

export default ({ store }: { store: Store<any> }) => {
  const key = process.env.PSYKHE_SRC_ID ? `${process.env.PSYKHE_SRC_ID}_pagination` : 'pagination';

  createPersistedState({
    key,
    paths: ['pagination']
  })(store);
};
