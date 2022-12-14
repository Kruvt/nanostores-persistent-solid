import type { StoreValue } from 'nanostores';
import { createStore as createStoreImpl, reconcile } from 'solid-js/store';
import type { Accessor } from 'solid-js';
import { createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import type { Store } from './persistent';
import { storageEngine } from './persistent';
import { isPrimitive } from './util';

function createPrimitiveStore<
  SomeStore extends Store,
  Value extends StoreValue<SomeStore>
>(store: SomeStore): Accessor<Value> {
  const initialValue = store.get();
  const [state, setState] = createSignal(initialValue);

  onMount(() => {
    if ('persistentKey' in store) {
      let key = store.persistentKey;
      if (storageEngine[key]) {
        store.set(store.decode(storageEngine[key]));
      } else {
        store.set(initialValue);
      }
    }
  });

  const unsubscribe = store.subscribe(value => {
    setState(value);
  });

  onCleanup(() => unsubscribe());

  return state;
}

/**
 * Subscribes to store changes and gets store’s value.
 *
 * @param store Store instance.
 * @returns Store value.
 */
export function useStore<
  SomeStore extends Store,
  Value extends StoreValue<SomeStore>
>(store: SomeStore): Accessor<Value> {
  if (isPrimitive(store.get())) return createPrimitiveStore(store);

  const initialValue = store.get();
  const [state, setState] = createStoreImpl(initialValue);

  onMount(() => {
    if ('persistentKey' in store) {
      let key = store.persistentKey;
      if (storageEngine[key]) {
        store.set(store.decode(storageEngine[key]));
      } else {
        store.set(initialValue);
      }
    }
    if ('persistentPrefix' in store) {
      let prefix = store.persistentPrefix;
      let data: { [key: string]: string } = {};
      for (let key in storageEngine) {
        if (key.startsWith(prefix)) {
          data[key.slice(prefix.length)] = store.decode(storageEngine[key]);
        }
      }
      for (let rootKey in initialValue) {
        if (!(rootKey in data)) {
          data[rootKey] = initialValue[rootKey];
        }
      }
      store.set(data);
    }
  });

  const unsubscribe = store.subscribe(value => {
    const newState = reconcile(value);
    setState(newState);
  });

  onCleanup(() => unsubscribe());

  return createMemo(() => state);
}
