import { PiletMetadata } from 'piral-base';
import { PiletApi } from './api';
import { GlobalStateContext } from './state';

export interface ApiExtender<T> {
  /**
   * Extends the base API of a module with new functionality.
   * @param api The API created by the base layer.
   * @param target The target the API is created for.
   * @returns The extended API.
   */
  (api: PiletApi, target: PiletMetadata): T;
}

export interface Extend<T = Partial<PiletApi>> {
  /**
   * Extends the base API with a custom set of functionality to be used by modules.
   * @param context The global state context to be used.
   * @returns The extended API or a function to create the extended API for a specific target.
   */
  (context: GlobalStateContext): T | ApiExtender<T>;
}

export interface PiletRequester {
  (): Promise<Array<PiletMetadata>>;
}
