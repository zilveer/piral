import { swap, Atom, deref } from '@dbeining/react-atom';
import { ReactChild } from 'react';
import { GlobalState, Disposable, appendItems, prependItems, withKey, withoutKey } from 'piral-core';
import { SearchOptions, SearchProviderRegistration } from './types';

export function setSearchInput(ctx: Atom<GlobalState>, input: string) {
  swap(ctx, state => ({
    ...state,
    search: {
      ...state.search,
      input,
    },
  }));
}

export function triggerSearch(ctx: Atom<GlobalState>, query?: string, immediate = false): Disposable {
  const state = deref(ctx);
  const providers = state.registry.searchProviders;
  const { input, results } = state.search;
  const { loading } = results;

  if (query === undefined) {
    query = input;
  }

  if (input !== query || !loading) {
    const allProviders = Object.keys(providers);
    const providerKeys = allProviders.filter(m => !providers[m].onlyImmediate || immediate);
    const load = !!query && providerKeys.length > 0;
    resetSearchResults(ctx, query, load);

    if (load) {
      let searchCount = providerKeys.length;
      let active = true;
      const opts: SearchOptions = {
        query,
        immediate,
      };

      providerKeys.forEach(key => {
        const provider = providers[key];
        provider.search(opts).then(
          results => {
            active && appendSearchResults(ctx, results, --searchCount === 0);
          },
          ex => {
            console.warn(ex);
            active && --searchCount === 0 && appendSearchResults(ctx, [], true);
          },
        );
      });

      return () => {
        active = false;
        providerKeys.forEach(key => providers[key].cancel());
        appendSearchResults(ctx, [], load);
      };
    } else if (!query) {
      allProviders.forEach(key => providers[key].clear());
    }
  }

  return () => {};
}

export function resetSearchResults(ctx: Atom<GlobalState>, input: string, loading: boolean) {
  swap(ctx, state => ({
    ...state,
    search: {
      input,
      results: {
        loading,
        items: [],
      },
    },
  }));
}

export function appendSearchResults(ctx: Atom<GlobalState>, items: Array<ReactChild>, done: boolean) {
  swap(ctx, state => ({
    ...state,
    search: {
      ...state.search,
      results: {
        loading: !done,
        items: appendItems(state.search.results.items, items),
      },
    },
  }));
}

export function prependSearchResults(ctx: Atom<GlobalState>, items: Array<ReactChild>, done: boolean) {
  swap(ctx, state => ({
    ...state,
    search: {
      ...state.search,
      results: {
        loading: !done,
        items: prependItems(state.search.results.items, items),
      },
    },
  }));
}

export function registerSearchProvider(ctx: Atom<GlobalState>, name: string, value: SearchProviderRegistration) {
  swap(ctx, state => ({
    ...state,
    registry: {
      ...state.registry,
      searchProviders: withKey(state.registry.searchProviders, name, value),
    },
  }));
}

export function unregisterSearchProvider(ctx: Atom<GlobalState>, name: string) {
  swap(ctx, state => ({
    ...state,
    registry: {
      ...state.registry,
      searchProviders: withoutKey(state.registry.searchProviders, name),
    },
  }));
}
