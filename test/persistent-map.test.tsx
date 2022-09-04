import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from 'solid-testing-library';
import { action, computed } from 'nanostores';
import { persistentMap } from '../src/persistent';
import { useStore } from '../src/use-store';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

it('Initializes data in localStorage and renders it if no existing data present in localStorage', async () => {
  const testMap = persistentMap('test:', {
    keyOne: 'initialValueOne',
    keyTwo: 'initialValueTwo'
  });

  const Wrapper = () => {
    const $testMap = useStore(testMap);

    return (
      <>
        <div data-testid="div-1">{$testMap().keyOne}</div>
        <div data-testid="div-2">{$testMap().keyTwo}</div>
      </>
    );
  };

  expect(localStorage.getItem('test:keyOne')).toEqual(null);
  expect(localStorage.getItem('test:keyTwo')).toEqual(null);
  render(() => <Wrapper />);
  expect(screen.getByTestId('div-1')).toHaveTextContent('initialValueOne');
  expect(screen.getByTestId('div-2')).toHaveTextContent('initialValueTwo');
  expect(localStorage.getItem('test:keyOne')).toEqual('initialValueOne');
  expect(localStorage.getItem('test:keyTwo')).toEqual('initialValueTwo');
});

it('Mutates data and then saves to localStorage and renders it', async () => {
  const testMap = persistentMap('test:', {
    keyOne: 'initialValueOne',
    keyTwo: 'initialValueTwo'
  });
  const mutateOne = action(testMap, 'mutate-one', (store, value) =>
    store.setKey('keyOne', value)
  );
  const mutateTwo = action(testMap, 'mutate-two', (store, value) =>
    store.setKey('keyTwo', value)
  );

  const Wrapper = () => {
    const $testMap = useStore(testMap);

    return (
      <>
        <div data-testid="div-1">{$testMap().keyOne}</div>
        <div data-testid="div-2">{$testMap().keyTwo}</div>
        <button onClick={() => mutateOne('newValueOne')}>Mutate One</button>
        <button onClick={() => mutateTwo('newValueTwo')}>Mutate Two</button>
      </>
    );
  };

  render(() => <Wrapper />);
  expect(screen.getByTestId('div-1')).toHaveTextContent('initialValueOne');
  expect(screen.getByTestId('div-2')).toHaveTextContent('initialValueTwo');
  expect(localStorage.getItem('test:keyOne')).toEqual('initialValueOne');
  expect(localStorage.getItem('test:keyTwo')).toEqual('initialValueTwo');
  screen.getAllByRole('button').forEach(button => button.click());
  expect(screen.getByTestId('div-1')).toHaveTextContent('newValueOne');
  expect(screen.getByTestId('div-2')).toHaveTextContent('newValueTwo');
  expect(localStorage.getItem('test:keyOne')).toEqual('newValueOne');
  expect(localStorage.getItem('test:keyTwo')).toEqual('newValueTwo');
});

it('Loads data from localStorage and renders it', async () => {
  const testMap = persistentMap('test:', {
    keyOne: 'initialValueOne',
    keyTwo: 'initialValueTwo'
  });

  localStorage.setItem('test:keyOne', 'savedValueOne');
  localStorage.setItem('test:keyTwo', 'savedValueTwo');

  const Wrapper = () => {
    const $testMap = useStore(testMap);

    return (
      <>
        <div data-testid="div-1">{$testMap().keyOne}</div>
        <div data-testid="div-2">{$testMap().keyTwo}</div>
      </>
    );
  };

  render(() => <Wrapper />);
  expect(localStorage.getItem('test:keyOne')).toEqual('savedValueOne');
  expect(localStorage.getItem('test:keyTwo')).toEqual('savedValueTwo');
  expect(screen.getByTestId('div-1')).toHaveTextContent('savedValueOne');
  expect(screen.getByTestId('div-2')).toHaveTextContent('savedValueTwo');
});

it('Loads partially-present data from localStorage, and initializes absent data with initial values, and renders them', async () => {
  const testMap = persistentMap('test:', {
    keyOne: 'initialValueOne',
    keyTwo: 'initialValueTwo'
  });

  localStorage.setItem('test:keyOne', 'savedValueOne');
  localStorage.removeItem('test:keyTwo');

  const Wrapper = () => {
    const $testMap = useStore(testMap);

    return (
      <>
        <div data-testid="div-1">{$testMap().keyOne}</div>
        <div data-testid="div-2">{$testMap().keyTwo}</div>
      </>
    );
  };

  expect(localStorage.getItem('test:keyOne')).toEqual('savedValueOne');
  expect(localStorage.getItem('test:keyTwo')).toEqual(null);
  render(() => <Wrapper />);
  expect(localStorage.getItem('test:keyOne')).toEqual('savedValueOne');
  expect(localStorage.getItem('test:keyTwo')).toEqual('initialValueTwo');
  expect(screen.getByTestId('div-1')).toHaveTextContent('savedValueOne');
  expect(screen.getByTestId('div-2')).toHaveTextContent('initialValueTwo');
});

it('Updates data by listening to other tabs and renders it', async () => {
  const testMap = persistentMap('test:', {
    keyOne: 'initialValueOne',
    keyTwo: 'initialValueTwo'
  });

  const Wrapper = () => {
    const $testMap = useStore(testMap);

    return (
      <>
        <div data-testid="div-1">{$testMap().keyOne}</div>
        <div data-testid="div-2">{$testMap().keyTwo}</div>
        <button
          onClick={() => {
            window.dispatchEvent(
              new StorageEvent('storage', {
                key: 'test:keyOne',
                newValue: 'emittedValueOne'
              })
            );
          }}
        >
          Emit One
        </button>
        <button
          onClick={() => {
            window.dispatchEvent(
              new StorageEvent('storage', {
                key: 'test:keyTwo',
                newValue: 'emittedValueTwo'
              })
            );
          }}
        >
          Emit Two
        </button>
      </>
    );
  };

  render(() => <Wrapper />);
  expect(screen.getByTestId('div-1')).toHaveTextContent('initialValueOne');
  expect(screen.getByTestId('div-2')).toHaveTextContent('initialValueTwo');
  expect(localStorage.getItem('test:keyOne')).toEqual('initialValueOne');
  expect(localStorage.getItem('test:keyTwo')).toEqual('initialValueTwo');
  screen.getAllByRole('button').forEach(button => button.click());
  expect(localStorage.getItem('test:keyOne')).toEqual('initialValueOne');
  expect(localStorage.getItem('test:keyTwo')).toEqual('initialValueTwo');
  expect(screen.getByTestId('div-1')).toHaveTextContent('emittedValueOne');
  expect(screen.getByTestId('div-2')).toHaveTextContent('emittedValueTwo');
});

it('Should not update data by listening to other tabs if disabled and continues rendering existing data', async () => {
  const testMap = persistentMap(
    'test:',
    {
      keyOne: 'initialValueOne',
      keyTwo: 'initialValueTwo'
    },
    { listen: false }
  );

  const Wrapper = () => {
    const $testMap = useStore(testMap);

    return (
      <>
        <div data-testid="div-1">{$testMap().keyOne}</div>
        <div data-testid="div-2">{$testMap().keyTwo}</div>
        <button
          onClick={() => {
            window.dispatchEvent(
              new StorageEvent('storage', {
                key: 'test:keyOne',
                newValue: 'emittedValueOne'
              })
            );
          }}
        >
          Emit One
        </button>
        <button
          onClick={() => {
            window.dispatchEvent(
              new StorageEvent('storage', {
                key: 'test:keyTwo',
                newValue: 'emittedValueTwo'
              })
            );
          }}
        >
          Emit Two
        </button>
      </>
    );
  };

  render(() => <Wrapper />);
  expect(screen.getByTestId('div-1')).toHaveTextContent('initialValueOne');
  expect(screen.getByTestId('div-2')).toHaveTextContent('initialValueTwo');
  expect(localStorage.getItem('test:keyOne')).toEqual('initialValueOne');
  expect(localStorage.getItem('test:keyTwo')).toEqual('initialValueTwo');
  screen.getAllByRole('button').forEach(button => button.click());
  expect(localStorage.getItem('test:keyOne')).toEqual('initialValueOne');
  expect(localStorage.getItem('test:keyTwo')).toEqual('initialValueTwo');
  expect(screen.getByTestId('div-1')).toHaveTextContent('initialValueOne');
  expect(screen.getByTestId('div-2')).toHaveTextContent('initialValueTwo');
});

it('Initializes computed data from persistent map and renders it', async () => {
  const testMap = persistentMap('test:', {
    keyOne: 'initialValueOne',
    keyTwo: 'initialValueTwo'
  });
  const computedMap = computed(testMap, originalValue => {
    let newObj: { [key: string]: string } = {};
    for (const [key, value] of Object.entries(originalValue)) {
      newObj[key] = 'computed ' + value;
    }
    return newObj;
  });

  localStorage.setItem('test:keyOne', 'savedValueOne');
  localStorage.setItem('test:keyTwo', 'savedValueTwo');

  const Wrapper = () => {
    useStore(testMap);
    const $computedMap = useStore(computedMap);

    return (
      <>
        <div data-testid="div-1">{$computedMap().keyOne}</div>
        <div data-testid="div-2">{$computedMap().keyTwo}</div>
      </>
    );
  };

  render(() => <Wrapper />);
  expect(localStorage.getItem('test:keyOne')).toEqual('savedValueOne');
  expect(localStorage.getItem('test:keyTwo')).toEqual('savedValueTwo');
  expect(screen.getByTestId('div-1')).toHaveTextContent(
    'computed savedValueOne'
  );
  expect(screen.getByTestId('div-2')).toHaveTextContent(
    'computed savedValueTwo'
  );
});
