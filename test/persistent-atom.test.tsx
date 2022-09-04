import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from 'solid-testing-library';
import { action, computed } from 'nanostores';
import { persistentAtom } from '../src/persistent';
import { useStore } from '../src/use-store';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

it('Initializes data in localStorage and renders it if no existing data present in localStorage', async () => {
  const testAtom = persistentAtom('test:key', 'initialValue');

  const Wrapper = () => {
    const $testAtom = useStore(testAtom);

    return <div data-testid="div-1">{$testAtom()}</div>;
  };

  expect(localStorage.getItem('test:key')).toEqual(null);
  render(() => <Wrapper />);
  expect(screen.getByTestId('div-1')).toHaveTextContent('initialValue');
  expect(localStorage.getItem('test:key')).toEqual('initialValue');
});

it('Mutates data and then saves to localStorage and renders it', async () => {
  const testAtom = persistentAtom('test:key', 'initialValue');
  const mutate = action(testAtom, 'mutate', (store, value) => store.set(value));

  const Wrapper = () => {
    const $testAtom = useStore(testAtom);

    return (
      <>
        <div data-testid="div-1">{$testAtom()}</div>
        <button onClick={() => mutate('newValue')}>Mutate</button>
      </>
    );
  };

  render(() => <Wrapper />);
  expect(screen.getByTestId('div-1')).toHaveTextContent('initialValue');
  expect(localStorage.getItem('test:key')).toEqual('initialValue');
  screen.getByRole('button').click();
  expect(screen.getByTestId('div-1')).toHaveTextContent('newValue');
  expect(localStorage.getItem('test:key')).toEqual('newValue');
});

it('Loads data from localStorage and renders it', async () => {
  const testAtom = persistentAtom('test:key', 'initialValue');

  localStorage.setItem('test:key', 'savedValue');

  const Wrapper = () => {
    const $testAtom = useStore(testAtom);

    return <div data-testid="div-1">{$testAtom()}</div>;
  };

  render(() => <Wrapper />);
  expect(localStorage.getItem('test:key')).toEqual('savedValue');
  expect(screen.getByTestId('div-1')).toHaveTextContent('savedValue');
});

it('Updates data by listening to other tabs and renders it', async () => {
  const testAtom = persistentAtom('test:key', 'initialValue');

  const Wrapper = () => {
    const $testAtom = useStore(testAtom);

    return (
      <>
        <div data-testid="div-1">{$testAtom()}</div>
        <button
          onClick={() => {
            window.dispatchEvent(
              new StorageEvent('storage', {
                key: 'test:key',
                newValue: 'emittedValue'
              })
            );
          }}
        >
          Emit
        </button>
      </>
    );
  };

  render(() => <Wrapper />);
  expect(localStorage.getItem('test:key')).toEqual('initialValue');
  expect(screen.getByTestId('div-1')).toHaveTextContent('initialValue');
  screen.getByRole('button').click();
  expect(localStorage.getItem('test:key')).toEqual('initialValue');
  expect(screen.getByTestId('div-1')).toHaveTextContent('emittedValue');
});

it('Should not update data by listening to other tabs if disabled and continues rendering existing data', async () => {
  const testAtom = persistentAtom('test:key', 'initialValue', {
    listen: false
  });

  const Wrapper = () => {
    const $testAtom = useStore(testAtom);

    return (
      <>
        <div data-testid="div-1">{$testAtom()}</div>
        <button
          onClick={() => {
            window.dispatchEvent(
              new StorageEvent('storage', {
                key: 'test:key',
                newValue: 'emittedValue'
              })
            );
          }}
        >
          Emit
        </button>
      </>
    );
  };

  render(() => <Wrapper />);
  expect(localStorage.getItem('test:key')).toEqual('initialValue');
  expect(screen.getByTestId('div-1')).toHaveTextContent('initialValue');
  screen.getByRole('button').click();
  expect(localStorage.getItem('test:key')).toEqual('initialValue');
  expect(screen.getByTestId('div-1')).toHaveTextContent('initialValue');
});

it('Initializes computed data from persistent atom and renders it', async () => {
  const testAtom = persistentAtom('test:key', 'initialValue');
  const computedAtom = computed(testAtom, originalValue => {
    return 'computed ' + originalValue;
  });

  localStorage.setItem('test:key', 'savedValue');

  const Wrapper = () => {
    useStore(testAtom);
    const $computedAtom = useStore(computedAtom);

    return <div data-testid="div-1">{$computedAtom()}</div>;
  };

  render(() => <Wrapper />);
  expect(localStorage.getItem('test:key')).toEqual('savedValue');
  expect(screen.getByTestId('div-1')).toHaveTextContent('computed savedValue');
});
