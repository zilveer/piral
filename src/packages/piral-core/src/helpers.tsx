import {
  AvailableDependencies,
  ApiCreator,
  DependencyGetter,
  ArbiterRecallStrategy,
  ArbiterOptions,
  getDependencyResolver,
  loadModule,
} from 'react-arbiter';
import { globalDependencies, getLocalDependencies } from './modules';
import { Pilet, PiletApi, PiletRequester, GlobalStateContext } from './types';

/**
 * Creates a dependency getter that sets the shared dependencies explicitly.
 * Overrides the potentially set shared dependencies from the Piral CLI, but
 * keeps all global dependencies such as react, react-dom, ...
 * @param sharedDependencies The shared dependencies to declare.
 */
export function setSharedDependencies(sharedDependencies: AvailableDependencies) {
  const dependencies = {
    ...globalDependencies,
    ...sharedDependencies,
  };
  return () => dependencies;
}

/**
 * Creates a dependency getter that extends the shared dependencies with additional dependencies.
 * @param additionalDependencies The additional dependencies to declare.
 */
export function extendSharedDependencies(additionalDependencies: AvailableDependencies) {
  const dependencies = {
    ...getLocalDependencies(),
    ...additionalDependencies,
  };
  return () => dependencies;
}

interface PiralArbiterConfig {
  availablePilets: Array<Pilet>;
  createApi: ApiCreator<PiletApi>;
  getDependencies: DependencyGetter;
  strategy: ArbiterRecallStrategy<PiletApi>;
  requestPilets: PiletRequester;
  context: GlobalStateContext;
}

export function createArbiterOptions({
  context,
  createApi,
  availablePilets,
  getDependencies,
  strategy,
  requestPilets,
}: PiralArbiterConfig): ArbiterOptions<PiletApi> {
  return {
    modules: availablePilets,
    getDependencies,
    strategy,
    dependencies: globalDependencies,
    fetchModules() {
      const promise = requestPilets();

      if (process.env.DEBUG_PILET) {
        const initialTarget = `${location.origin}/${process.env.DEBUG_PILET}`;
        const updateTarget = initialTarget.replace('http', 'ws');
        const appendix = fetch(initialTarget).then(res => res.json());
        const ws = new WebSocket(updateTarget);
        ws.onmessage = ({ data }) => {
          const meta = JSON.parse(data);
          const getter = getDependencyResolver(globalDependencies, getDependencies);
          const fetcher = (url: string) =>
            fetch(url, {
              method: 'GET',
              cache: 'reload',
            }).then(m => m.text());
          loadModule(meta, getter, fetcher).then(pilet => {
            try {
              const newApi = createApi(pilet);
              context.injectPilet(pilet);
              pilet.setup(newApi);
            } catch (error) {
              console.info('The pilet crashed.');
              console.error(error);
            }
          });
        };
        return promise.catch(() => []).then(pilets => appendix.then(pilet => [pilet, ...pilets]));
      }

      return promise;
    },
    createApi,
  };
}
