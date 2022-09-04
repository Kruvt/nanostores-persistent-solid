import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from 'solid-testing-library';
import { atom, action, computed } from 'nanostores';
import { useStore } from '../src/use-store';

afterEach(() => {
  cleanup();
});

it('Initializes data and renders it', async () => {
  const testAtom = atom('initialValue');

  const Wrapper = () => {
    const $testAtom = useStore(testAtom);

    return <div data-testid="div-1">{$testAtom()}</div>;
  };

  render(() => <Wrapper />);
  expect(screen.getByTestId('div-1')).toHaveTextContent('initialValue');
});

it('Mutates data and then renders it', async () => {
  const testAtom = atom('initialValue');
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
  screen.getByRole('button').click();
  expect(screen.getByTestId('div-1')).toHaveTextContent('newValue');
});

it('Initializes computed data and renders it', async () => {
  const testAtom = atom('initialValue');
  const computedAtom = computed(
    testAtom,
    originalValue => 'computed ' + originalValue
  );

  const Wrapper = () => {
    const $computedAtom = useStore(computedAtom);

    return <div data-testid="div-1">{$computedAtom()}</div>;
  };

  render(() => <Wrapper />);
  expect(screen.getByTestId('div-1')).toHaveTextContent(
    'computed initialValue'
  );
});
