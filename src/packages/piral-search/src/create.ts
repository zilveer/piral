import * as actions from './actions';
import { isfunc } from 'piral-base';
import { ReactChild, isValidElement, createElement } from 'react';
import { swap } from '@dbeining/react-atom';
import { buildName, Extend, Dict, withApi, PiletApi, GlobalStateContext } from 'piral-core';
import { DefaultContainer, DefaultInput, DefaultResult } from './default';
import { PiletSearchApi, SearchSettings, SearchHandler, SearchProviderRegistration, SearchResultType } from './types';

export interface InitialSearchProvider {
  /**
   * Defines the search handler.
   */
  search: SearchHandler;
  /**
   * The optional settings to be defined.
   */
  settings?: SearchSettings;
}

/**
 * Available configuration options for the search plugin.
 */
export interface SearchConfig {
  /**
   * Sets the providers to be given by the app shell.
   * @default []
   */
  providers?: Array<InitialSearchProvider>;
  /**
   * Sets the initial results of the search.
   * @default []
   */
  results?: Array<ReactChild>;
  /**
   * Sets the initial query.
   * @default ''
   */
  query?: string;
}

function noop() {}

function createSearchRegistration(
  pilet: string,
  search: SearchHandler,
  settings: SearchSettings = {},
): SearchProviderRegistration {
  const { onlyImmediate = false, onCancel = noop, onClear = noop } = settings;
  return {
    pilet,
    onlyImmediate,
    cancel: isfunc(onCancel) ? onCancel : noop,
    clear: isfunc(onClear) ? onClear : noop,
    search,
  };
}

function getSearchProviders(providers: Array<InitialSearchProvider>) {
  const searchProviders: Dict<SearchProviderRegistration> = {};
  let i = 0;

  for (const { search, settings } of providers) {
    searchProviders[`global-${i++}`] = createSearchRegistration(undefined, search, settings);
  }

  return searchProviders;
}

function toChild(content: SearchResultType, api: PiletApi, context: GlobalStateContext): ReactChild {
  if (typeof content === 'string' || isValidElement(content)) {
    return content;
  } else {
    const component = withApi(context.converters, content, api, 'extension');
    return createElement(component);
  }
}

function wrapResults(
  result: SearchResultType | Array<SearchResultType>,
  api: PiletApi,
  context: GlobalStateContext,
): Array<ReactChild> {
  const results = Array.isArray(result) ? result : [result];
  return results.map(item => toChild(item, api, context));
}

/**
 * Creates new Pilet API extensions for search and filtering.
 */
export function createSearchApi(config: SearchConfig = {}): Extend<PiletSearchApi> {
  const { providers = [], results = [], query = '' } = config;

  return context => {
    context.defineActions(actions);

    swap(context.state, state => ({
      ...state,
      components: {
        ...state.components,
        SearchContainer: DefaultContainer,
        SearchInput: DefaultInput,
        SearchResult: DefaultResult,
      },
      registry: {
        ...state.registry,
        searchProviders: getSearchProviders(providers),
      },
      search: {
        input: query,
        results: {
          loading: false,
          items: results,
        },
      },
    }));

    return (api, target) => {
      const pilet = target.name;
      let next = 0;

      return {
        registerSearchProvider(name, provider, settings?) {
          if (typeof name !== 'string') {
            settings = provider;
            provider = name;
            name = next++;
          }

          const id = buildName(pilet, name);
          context.registerSearchProvider(
            id,
            createSearchRegistration(
              pilet,
              q => Promise.resolve(provider(q, api)).then(results => wrapResults(results, api, context), () => []),
              settings,
            ),
          );
        },
        unregisterSearchProvider(name) {
          const id = buildName(pilet, name);
          context.unregisterSearchProvider(id);
        },
      };
    };
  };
}
