[nano stores solid]: https://github.com/nanostores/solid
[nano stores persistent]: https://github.com/nanostores/persistent
[minimal reproduction]: https://stackblitz.com/edit/github-kbyuhy-tet5pj?file=src/components/Component.jsx
[issue]: https://github.com/nanostores/solid/issues/11
[output format conventions]: https://github.com/nanostores/nanostores#esm

# nanostores-persistent-solid

<a href="https://www.npmjs.com/package/nanostores-persistent-solid"><img src="https://img.shields.io/npm/v/nanostores-persistent-solid" alt="npm version badge"></a>
<a href="https://bundlephobia.com/package/nanostores-persistent-solid"><img src="https://img.shields.io/bundlephobia/minzip/nanostores-persistent-solid" alt="Bundlephobia minzipped size"></a>

<img align="right" width="92" height="92" title="Nano Stores logo"
     src="https://nanostores.github.io/nanostores/logo.svg">

Drop-in replacement of both **[Nano Stores Persistent]** and **[Nano Stores Solid]** that adds/fixes support for persistent atoms and maps in Solid SSR environments.

The original version of Nano Stores Solid does not support Nano Stores Persistent in SSR environments due to an **[issue]** in which pre-rendered content does not re-render to show updated content from persistent storage engines. This is demonstrated in this **[minimal reproduction]**:

1. Observe that initial rendered value is initialValue
2. Click on button and observe that rendered value changes.
3. Observe also that localStorage value changes as well.
4. Refresh tab and observe that rendered value is back to initialValue and does not update to show stored value from localStorage.

This library modifies contents from both Nano Stores Solid and Nano Stores Persistent in order to rectify the issue. Since code from the framework-agnostic Nano Stores Persistent library had to be modified just for it to work in a highly-specific Solid SSR environment, a PR was not opened to upstream these changes. However, if and when the original libraries are updated to fix this issue in a manner which is satisfactory to the original authors, this library will be archived.

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

## Documentation

Code from the original libraries were modified in such a way that:

1. the API still remains fully intact (anything that you can export in the original libraries can also be exported in this library),
2. it is identical in terms of surface area (usage of the APIs remains exactly the same),
3. its behaviour remains the same, except of course for the additional behaviour that has been added (persistent atoms/maps work in Solid SSR environments) which is the purpose of this library, and
4. The feature parity as described above will be maintained as the original packages receive further updates. Currently, it has feature parity with **v0.6.2** of Nano Stores Persistent and **v0.2.0** of Nano Stores Solid.

Therefore, this also means that full documentation about the API of this library and how it can be used are readily found in the original repositories at **[Nano Stores Persistent]** and **[Nano Stores Solid]**.

## Tests

The test suite was rewritten to ensure that the modified Solid integration is still able to handle the use-case of default atoms and maps which Nano Stores Solid could originally handle, and also the newly-added use-case of persistent atoms and maps.

Do note that areas of the API from the original libraries which were not touched by the rewrites (specifically API concerning storage engines, encoders and test storage engines from Nano Stores Persistent) are not included in the tests.

## Bundle Output Format

This library is an **ESM-only package**, so as to adhere to the **[output format conventions]** set by Nano Stores libraries. This means that you will need to use ES modules in your application in order to import this library.

## License

MIT
