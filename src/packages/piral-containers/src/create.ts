import * as actions from './actions';
import { swap } from '@dbeining/react-atom';
import { buildName, Extend } from 'piral-core';
import { withPiletState } from './withPiletState';
import { PiletContainersApi } from './types';

/**
 * Available configuration options for the container plugin.
 */
export interface ContainersConfig {}

/**
 * Creates new Pilet API extensions for supporting pilet global state containers.
 */
export function createContainersApi(config: ContainersConfig = {}): Extend<PiletContainersApi> {
  return context => {
    context.defineActions(actions);

    swap(context.state, state => ({
      ...state,
      containers: {},
    }));

    return (api, target) => {
      let containers = 0;

      return {
        createState(options) {
          const actions = {};
          const id = buildName(target.name, containers++);
          const cb = dispatch => context.replaceState(id, dispatch);
          context.createState(id, options.state);
          Object.keys(options.actions).forEach(key => {
            const action = options.actions[key];
            actions[key] = (...args) => action.call(api, cb, ...args);
          });
          return component => withPiletState(component, id, actions) as any;
        },
      };
    };
  };
}
