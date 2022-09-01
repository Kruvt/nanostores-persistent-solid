import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from 'solid-testing-library';
import { action } from 'nanostores';
import { persistentAtom } from '../src/persistent';
import { useStore } from '../src/use-store';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

it('Initializes data in localStorage and renders it if no existing data present in localStorage', async () => {
  const atom = persistentAtom('test:key', 'initialValue');

  const Wrapper = () => {
    const $atom = useStore(atom);

    return <div data-testid="div-1">{$atom()}</div>;
  };

  expect(localStorage.getItem('test:key')).toEqual(null);
  render(() => <Wrapper />);
  expect(screen.getByTestId('div-1')).toHaveTextContent('initialValue');
  expect(localStorage.getItem('test:key')).toEqual('initialValue');
});

it('Mutates data and then saves to localStorage and renders it', async () => {
  const atom = persistentAtom('test:key', 'initialValue');
  const mutate = action(atom, 'mutate', (store, value) => store.set(value));

  const Wrapper = () => {
    const $atom = useStore(atom);

    return (
      <>
        <div data-testid="div-1">{$atom()}</div>
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
  const atom = persistentAtom('test:key', 'initialValue');

  localStorage.setItem('test:key', 'savedValue');

  const Wrapper = () => {
    const $atom = useStore(atom);

    return <div data-testid="div-1">{$atom()}</div>;
  };

  render(() => <Wrapper />);
  expect(localStorage.getItem('test:key')).toEqual('savedValue');
  expect(screen.getByTestId('div-1')).toHaveTextContent('savedValue');
});

it('Reverts back to initial data if keys manually cleaned in localStorage and renders it', async () => {
  const atom = persistentAtom('test:key', 'initialValue');

  localStorage.clear();

  const Wrapper = () => {
    const $atom = useStore(atom);
    const mutate = action(atom, 'mutate', (store, value) => store.set(value));

    return (
      <>
        <div data-testid="div-1">{$atom()}</div>
        <button data-testid="button-1" onClick={() => mutate('newValue')}>
          Mutate
        </button>
        <button data-testid="button-2" onClick={() => localStorage.clear()}>
          Clear
        </button>
      </>
    );
  };

  render(() => <Wrapper />);
  screen.getByTestId('button-1').click();
  expect(localStorage.getItem('test:key')).toEqual('newValue');
  expect(screen.getByTestId('div-1')).toHaveTextContent('newValue');
  screen.getByTestId('button-2').click();
  expect(localStorage.getItem('test:key')).toEqual(null);
  expect(screen.getByTestId('div-1')).toHaveTextContent('initialValue');
});

it('Updates data by listening to other tabs and renders it', async () => {
  const atom = persistentAtom('test:key', 'initialValue');

  const Wrapper = () => {
    const $atom = useStore(atom);

    return (
      <>
        <div data-testid="div-1">{$atom()}</div>
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
  const atom = persistentAtom('test:key', 'initialValue', { listen: false });

  const Wrapper = () => {
    const $atom = useStore(atom);

    return (
      <>
        <div data-testid="div-1">{$atom()}</div>
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
