# README for `useStorage` Hook

## Description

The `useStorage` hook is a custom React function that allows you to interact with the browser's `localStorage` and `sessionStorage` in an easy and efficient way without sacrificing `TypeScript` typings.

![alt text for screen readers](https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWw5cWg5bWdxNzhta3F1cGlwdG5jaGV6dDhqcG43b2Q4YnBlaDNkOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/FdM5w94In2QOBMWcod/giphy.gif "Gif example")


## Usage

```tsx
import { useStorage } from "./useStorage";

const Component = () => {
  const { getItem, setItem, removeItem } = useStorage<someInterface>({
    key: "myItem",
    storage: "localStorage",
  });

  // ...
};
```

## API

The `useStorage` hook takes an object as a parameter with the following properties:

- `key`: A string that represents the key of the item in the storage.
- `storage`: A string that represents the type of storage to be used. It can be `"localStorage"` or `"sessionStorage"`. The default is `"localStorage"`.

The hook returns an object with three methods:

- `setItem(value: T)`: Stores a value in the storage. The value is automatically converted to JSON.
- `getItem()`: Retrieves a value from the storage. The value is automatically converted from JSON to the original format.
- `removeItem()`: Removes an item from the storage.

## Example

```tsx
import { useStorage } from "./useStorage";

interface myInterface {
  name: string;
  age: number;
}

const Component = () => {
  const { getItem, setItem, removeItem } = useStorage<myInterface>({
    key: "myItem",
    storage: "localStorage",
  });

  // Store an item
  setItem({ name: "John", age: 25 });

  // Retrieve an item
  const item = getItem();

  // Remove an item
  removeItem();
};
```
