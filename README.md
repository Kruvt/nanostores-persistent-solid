# nanostores-persistent-solid

<img align="right" width="92" height="92" title="Nano Stores logo"
     src="https://nanostores.github.io/nanostores/logo.svg">

Modified version of **[Nano Stores Solid]** — the Solid adapter for **[Nano Stores]** — that adds support for **[Nano Stores Persistent]** in Solid SSR environments.

The original version of Nano Stores Solid does not support Nano Stores Persistent in SSR environments due to an **[issue]** in which pre-rendered content does not re-render to show updated content from persistent storage engines. This is demonstrated in this **[minimal reproduction]**:

1. Observe that initial rendered value is initialValue
2. Click on button and observe that rendered value changes.
3. Observe also that localStorage value changes as well.
4. Refresh tab and observe that rendered value is back to initialValue and does not update to show stored value from localStorage.

This library modifies contents from both Nano Stores Solid and Nano Stores Persistent in order to rectify the issue. Since code from the framework-agnostic Nano Stores Persistent library had to be modified just for it to work in a highly-specific Solid SSR environment, a PR was not opened to upstream these changes. However, if and when the original libraries are updated to fix this issue in a manner which is satisfactory to the original authors, this library will be archived.

[nano stores solid]: https://github.com/nanostores/solid
[nano stores]: https://github.com/nanostores/nanostores
[nano stores persistent]: https://github.com/nanostores/persistent
[minimal reproduction]: https://stackblitz.com/edit/github-kbyuhy-tet5pj?file=src/components/Component.jsx
[issue]: https://github.com/nanostores/solid/issues/11

## Quick Start

Install it:

```bash
pnpm add nanostores nanostores-persistent-solid # or npm or yarn
```

Use it:

```ts
// store.ts
import { persistentAtom, persistentMap } from 'nanostores-persistent-solid';

export const testAtom = persistentAtom('testKey', 'testValue');

export const testMap = persistentMap(
  'testPrefix:',
  {
    valueOne: 1,
    valueTwo: 2
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse
  }
);
```

```tsx
// Component.tsx
import { useStore } from 'nanostores-persistent-solid';
import { testAtom, testMap } from './store';

function Component() {
  const $testAtom = useStore(testAtom);
  const $testMap = useStore(testMap);

  return (
    <>
      <div>{$testAtom()}</div>
      <div>{$testMap().valueOne}</div>
      <div>{$testMap().valueTwo}</div>
    </>
  );
}
```

## Further Documentation

Code from the original libraries was modified in such a way that the API still remains fully intact and identical. Therefore, further documentation about the full API of this library can be found in the original repositories at **[Nano Stores]**, **[Nano Stores Persistent]** and **[Nano Stores Solid]**.

## Tests

The test suite was rewritten to ensure that the modified Solid integration is still able to handle the usecase of default atoms and maps which Nano Stores Solid could originally handle, and also the newly-added usecase of persistent atoms and maps. Do note that areas of the API from the original libraries which were not touched by the rewrites (specifically API concerning storage engines, encoders and test storage engines from Nano Stores Persistent) are not included in the tests.

## License

MIT
