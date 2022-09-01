import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from 'solid-testing-library';
import { delay } from 'nanodelay';
import { action } from 'nanostores';
import { persistentAtom } from '../src/persistent';
import { useStore } from '../src/useStore';

afterEach(() => {
  cleanup();
});

it('Initializes data in localStorage and renders it', async () => {
  const item = persistentAtom('test:key', 'initialValue');

  const Wrapper = () => {
    const $item = useStore(item);

    return <div data-testid="test-1">{$item()}</div>;
  };

  render(() => <Wrapper />);
  expect(screen.getByTestId('test-1')).toHaveTextContent('initialValue');
  expect(localStorage.getItem('test:key')).toEqual('initialValue');
});

it('Mutates data and then saves to localStorage and renders it', async () => {
  const item = persistentAtom('test:key', 'initialValue');
  const mutate = action(item, 'mutate', (store, value) => store.set(value));

  const Wrapper = () => {
    const $item = useStore(item);

    return (
      <>
        <div data-testid="test-2">{$item()}</div>
        <button onClick={() => mutate('newValue')}>Mutate</button>
      </>
    );
  };

  render(() => <Wrapper />);
  screen.getByRole('button').click();
  expect(screen.getByTestId('test-2')).toHaveTextContent('newValue');
  expect(localStorage.getItem('test:key')).toEqual('newValue');
});

it('Loads data from localStorage and renders it', async () => {
  const item = persistentAtom('test:key', 'initialValue');

  localStorage.setItem('test:key', 'savedValue');

  const Wrapper = () => {
    const $item = useStore(item);

    return <div data-testid="test-3">{$item()}</div>;
  };

  render(() => <Wrapper />);
  expect(screen.getByTestId('test-3')).toHaveTextContent('savedValue');
});

it('Reverts back to initial data if keys manually cleaned in localStorage and renders it', async () => {
  const item = persistentAtom('test:key', 'initialValue');

  localStorage.clear();

  const Wrapper = () => {
    const $item = useStore(item);
    const mutate = action(item, 'mutate', (store, value) => store.set(value));

    return (
      <>
        <div data-testid="test-4">{$item()}</div>
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
  screen.getByTestId('button-2').click();
  expect(screen.getByTestId('test-4')).toHaveTextContent('initialValue');
});
