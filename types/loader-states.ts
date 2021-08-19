export enum LoaderState {
  LOADED = 'loaded',
  LOADING = 'loading',
  NOT_FOUND = 'not_found',
  TEMPORARY_FAILURE = 'temporary_failure',
  PERMANENT_FAILURE = 'permanent_failure'
}

export default LoaderState;
