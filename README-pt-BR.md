# README para o Hook `useStorage`

## Descrição

O hook `useStorage` é uma função personalizada do React que permite interagir com o `localStorage` e `sessionStorage` do navegador de maneira fácil e eficiente sem abrir mão das tipagens do `typeScript`.

![alt text for screen readers](https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWw5cWg5bWdxNzhta3F1cGlwdG5jaGV6dDhqcG43b2Q4YnBlaDNkOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/FdM5w94In2QOBMWcod/giphy.gif "Gif exemplo")

## Uso

```tsx
import { useStorage } from "./useStorage";

const Component = () => {
  const { getItem, setItem, removeItem } = useStorage<algumaInterface>({
    key: "meuItem",
    storage: "localStorage",
  });

  // ...
};
```

## API

O hook `useStorage` recebe um objeto como parâmetro com as seguintes propriedades:

- `key`: Uma string que representa a chave do item no armazenamento.
- `storage`: Uma string que representa o tipo de armazenamento a ser usado. Pode ser `"localStorage"` ou `"sessionStorage"`. O padrão é `"localStorage"`.

O hook retorna um objeto com três métodos:

- `setItem(value: T)`: Armazena um valor no armazenamento. O valor é automaticamente convertido para JSON.
- `getItem()`: Recupera um valor do armazenamento. O valor é automaticamente convertido de JSON para o formato original.
- `removeItem()`: Remove um item do armazenamento.

## Exemplo

```tsx
import { useStorage } from "./useStorage";

interface myInterface {
  nome: string;
  idade: number;
}

const Component = () => {
  const { getItem, setItem, removeItem } = useStorage<minhaInterface>({
    key: "meuItem",
    storage: "localStorage",
  });

  // Armazenar um item
  setItem({ nome: "João", idade: 25 });

  // Recuperar um item
  const item = getItem();

  // Remover um item
  removeItem();
};
```
