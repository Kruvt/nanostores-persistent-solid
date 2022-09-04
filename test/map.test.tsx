import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from 'solid-testing-library';
import { map, action, computed } from 'nanostores';
import { useStore } from '../src/use-store';

afterEach(() => {
  cleanup();
});

it('Initializes data and renders it', async () => {
  const testMap = map({
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

  render(() => <Wrapper />);
  expect(screen.getByTestId('div-1')).toHaveTextContent('initialValueOne');
  expect(screen.getByTestId('div-2')).toHaveTextContent('initialValueTwo');
});

it('Mutates data and then renders it', async () => {
  const testMap = map({
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
  screen.getAllByRole('button').forEach(button => button.click());
  expect(screen.getByTestId('div-1')).toHaveTextContent('newValueOne');
  expect(screen.getByTestId('div-2')).toHaveTextContent('newValueTwo');
});

it('Initializes computed data and renders it', async () => {
  const testMap = map({
    keyOne: 'initialValueOne',
    keyTwo: 'initialValueTwo'
  });
  const computedMap = computed(testMap, originalValue => {
    let newObj: {
      [key: string]: string;
    } = {};
    for (const [key, value] of Object.entries(originalValue)) {
      newObj[key] = 'computed ' + value;
    }
    return newObj;
  });

  const Wrapper = () => {
    const $computedMap = useStore(computedMap);

    return (
      <>
        <div data-testid="div-1">{$computedMap().keyOne}</div>
        <div data-testid="div-2">{$computedMap().keyTwo}</div>
      </>
    );
  };

  render(() => <Wrapper />);
  expect(screen.getByTestId('div-1')).toHaveTextContent(
    'computed initialValueOne'
  );
  expect(screen.getByTestId('div-2')).toHaveTextContent(
    'computed initialValueTwo'
  );
});
