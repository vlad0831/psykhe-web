import { Plugin } from '@nuxt/types';
import { initializeAxios } from '~/utils/api';

const accessor: Plugin = (context) => {
  initializeAxios(context);
};

export default accessor;
