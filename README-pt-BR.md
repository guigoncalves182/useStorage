# README para o Hook `useStorage`

## Descrição

O hook `useStorage` é um hook customizado React poderoso e type-safe que permite interagir com o `localStorage` e `sessionStorage` do navegador de maneira fácil e eficiente. Oferece recursos avançados como sincronização automática entre abas, tratamento de erros, compatibilidade com SSR e suporte completo a TypeScript.

![alt text for screen readers](https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWw5cWg5bWdxNzhta3F1cGlwdG5jaGV6dDhqcG43b2Q4YnBlaDNkOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/FdM5w94In2QOBMWcod/giphy.gif "Gif exemplo")

## Instalação

```bash
npm install use-storage
# ou
yarn add use-storage
```

## Recursos

✨ **Estado Reativo**: Retorna o valor atual como estado que atualiza automaticamente
🔄 **Sincronização entre Abas**: Sincroniza mudanças automaticamente entre abas do navegador
🛡️ **Tratamento de Erros**: Tratamento de erros integrado com informações detalhadas
🎯 **TypeScript**: Suporte completo a TypeScript com tipos genéricos
🔧 **Customizável**: Serializers/deserializers customizados para tipos complexos
🚀 **Compatível com SSR**: Funciona com segurança em server-side rendering
🔑 **Prefixação de Chaves**: Previne colisões de chaves com prefixação automática
🧹 **Limpar Tudo**: Utilitário para limpar todo o armazenamento

## Uso Básico

```tsx
import { useStorage } from "./useStorage";

const Component = () => {
  const { value, setValue, removeValue } = useStorage<string>({
    key: "username",
    defaultValue: "Visitante",
  });

  return (
    <div>
      <p>Olá, {value}!</p>
      <button onClick={() => setValue("João")}>Definir Nome</button>
      <button onClick={removeValue}>Limpar Nome</button>
    </div>
  );
};
```

## API

### Parâmetros

O hook `useStorage` aceita um objeto com as seguintes propriedades:

| Propriedade      | Tipo                                               | Padrão                                          | Descrição                                                                          |
| ---------------- | -------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| `key`            | `string`                                           | **obrigatório**                                 | A chave do item no armazenamento                                                   |
| `storage`        | `"localStorage" \| "sessionStorage"`               | `"localStorage"`                                | O tipo de armazenamento a usar                                                     |
| `defaultValue`   | `T`                                                | `undefined`                                     | Valor padrão quando o item não existe                                              |
| `prefix`         | `string`                                           | `""`                                            | Prefixo para a chave de armazenamento para evitar colisões                         |
| `serializer`     | `(value: T) => string`                             | `JSON.stringify`                                | Função serializadora customizada                                                   |
| `deserializer`   | `(value: string) => T`                             | `JSON.parse`                                    | Função desserializadora customizada                                                |
| `syncAcrossTabs` | `boolean` (deve ser `false` para `sessionStorage`) | `true` (localStorage), `false` (sessionStorage) | Habilitar sincronização entre abas do navegador (funciona apenas com localStorage) |

### Valor de Retorno

O hook retorna um objeto com as seguintes propriedades:

| Propriedade   | Tipo                    | Descrição                                  |
| ------------- | ----------------------- | ------------------------------------------ |
| `value`       | `T \| undefined`        | O valor atual do armazenamento (reativo)   |
| `setValue`    | `(value: T) => void`    | Armazena um valor no armazenamento         |
| `getValue`    | `() => T \| undefined`  | Recupera um valor do armazenamento         |
| `removeValue` | `() => void`            | Remove o item do armazenamento             |
| `clearAll`    | `() => void`            | Limpa todos os itens do armazenamento      |
| `error`       | `IStorageError \| null` | Informações de erro se uma operação falhou |
| `setItem`     | `(value: T) => void`    | Alias para `setValue` (compatibilidade)    |
| `getItem`     | `() => T \| undefined`  | Alias para `getValue` (compatibilidade)    |
| `removeItem`  | `() => void`            | Alias para `removeValue` (compatibilidade) |

## Exemplos Avançados

### Objetos Complexos com TypeScript

```tsx
interface Usuario {
  id: number;
  nome: string;
  email: string;
  preferencias: {
    tema: "claro" | "escuro";
    notificacoes: boolean;
  };
}

const PerfilUsuario = () => {
  const {
    value: usuario,
    setValue: setUsuario,
    error,
  } = useStorage<Usuario>({
    key: "perfil-usuario",
    defaultValue: {
      id: 0,
      nome: "Visitante",
      email: "",
      preferencias: { tema: "claro", notificacoes: true },
    },
  });

  const atualizarTema = (tema: "claro" | "escuro") => {
    if (usuario) {
      setUsuario({
        ...usuario,
        preferencias: { ...usuario.preferencias, tema },
      });
    }
  };

  if (error) {
    console.error("Erro no armazenamento:", error);
  }

  return <div>Tema atual: {usuario?.preferencias.tema}</div>;
};
```

### Usando Prefixo de Chave

```tsx
const { value, setValue } = useStorage({
  key: "configuracoes",
  prefix: "meuapp", // Armazenado como "meuapp_configuracoes"
  defaultValue: { volume: 50 },
});
```

### Serialização Customizada para Datas

```tsx
const { value: ultimoLogin, setValue: setUltimoLogin } = useStorage<Date>({
  key: "ultimo-login",
  serializer: (date) => date.toISOString(),
  deserializer: (str) => new Date(str),
  defaultValue: new Date(),
});
```

### Session Storage para Dados Temporários

```tsx
const { value: dadosFormulario, setValue: setDadosFormulario } = useStorage({
  key: "rascunho-formulario",
  storage: "sessionStorage", // Limpo quando a aba fecha
  defaultValue: { email: "", mensagem: "" },
});
```

### Tratamento de Erros

```tsx
const { value, setValue, error } = useStorage({
  key: "dados",
  defaultValue: null,
});

useEffect(() => {
  if (error) {
    toast.error(`Erro no armazenamento: ${error.error.message}`);
    // Registrar no serviço de rastreamento de erros
    logError(error.operation, error.error);
  }
}, [error]);
```

### Exemplo de Carrinho de Compras

```tsx
interface ItemCarrinho {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
}

const CarrinhoCompras = () => {
  const { value: carrinho, setValue: setCarrinho } = useStorage<ItemCarrinho[]>(
    {
      key: "carrinho-compras",
      prefix: "ecommerce",
      defaultValue: [],
    }
  );

  const adicionarItem = (item: ItemCarrinho) => {
    const existente = carrinho?.find((i) => i.id === item.id);
    if (existente) {
      setCarrinho(
        carrinho!.map((i) =>
          i.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i
        )
      );
    } else {
      setCarrinho([...(carrinho || []), item]);
    }
  };

  const total =
    carrinho?.reduce((sum, item) => sum + item.preco * item.quantidade, 0) || 0;

  return (
    <div>
      <h2>Carrinho ({carrinho?.length || 0} itens)</h2>
      <p>Total: R$ {total.toFixed(2)}</p>
    </div>
  );
};
```

### Desabilitar Sincronização entre Abas

```tsx
const { value, setValue } = useStorage({
  key: "apenas-local",
  syncAcrossTabs: false, // Não sincroniza com outras abas
});
```

### Segurança TypeScript com sessionStorage

```tsx
// ✅ PERMITIDO: localStorage com sincronização
const { value } = useStorage({
  key: "tema",
  storage: "localStorage",
  syncAcrossTabs: true, // OK
});

// ✅ PERMITIDO: sessionStorage sem sincronização
const { value } = useStorage({
  key: "formulario",
  storage: "sessionStorage",
  syncAcrossTabs: false, // OK
});

// ❌ ERRO DE TIPO: sessionStorage com sincronização
const { value } = useStorage({
  key: "formulario",
  storage: "sessionStorage",
  syncAcrossTabs: true, // ❌ Type 'true' is not assignable to type 'false'
});
```

**Nota**: TypeScript impedirá você de definir `syncAcrossTabs: true` ao usar `sessionStorage`, já que o evento `storage` do navegador não funciona entre abas com sessionStorage.

## Considerações de Performance

### Limites de Armazenamento

- **localStorage** e **sessionStorage** tipicamente têm limite de 5-10MB por origem
- Armazene apenas dados necessários
- Considere usar IndexedDB para grandes conjuntos de dados

### Quando Usar Cada Tipo de Armazenamento

**localStorage**:

- Preferências e configurações do usuário
- Dados do carrinho de compras
- Tokens de autenticação (com segurança adequada)
- Dados que devem persistir entre sessões

**sessionStorage**:

- Rascunhos de formulários (dados temporários)
- Estado de wizard/formulário multi-etapa
- Filtros e estado de busca temporários
- Dados que devem ser limpos quando a aba fecha

### Dicas de Otimização

```tsx
// ✅ Bom: Use valor padrão para evitar verificações de null
const { value } = useStorage({
  key: "configuracoes",
  defaultValue: { tema: "claro" },
});

// ❌ Evite: Armazenar objetos muito grandes
const { setValue } = useStorage({ key: "dados-enormes" });
setValue(objetoMassivo); // Pode atingir limites de armazenamento

// ✅ Bom: Armazene apenas o que você precisa
setValue({ id: usuario.id, nome: usuario.nome });
```

## Considerações de Segurança

⚠️ **Notas Importantes de Segurança**:

1. **Nunca armazene dados sensíveis** em localStorage ou sessionStorage:

   - Senhas
   - Informações de cartão de crédito
   - Números de identificação pessoal
   - Tokens não criptografados

2. **Vulnerabilidades XSS**: Dados no armazenamento são acessíveis via JavaScript, tornando-os vulneráveis a ataques XSS

3. **Melhores Práticas**:
   - Use cookies HTTP-only para tokens sensíveis
   - Criptografe dados sensíveis antes de armazenar
   - Valide e sanitize dados antes de armazenar
   - Implemente políticas adequadas de CORS e CSP

```tsx
// ❌ Ruim: Armazenando dados sensíveis
const { setValue } = useStorage({ key: "senha" });
setValue("minhaSenha123"); // NÃO FAÇA ISSO!

// ✅ Bom: Armazene preferências não sensíveis
const { setValue } = useStorage({ key: "preferencias-ui" });
setValue({ tema: "escuro", idioma: "pt-BR" });
```

## SSR / Server-Side Rendering

O hook é seguro para SSR e retornará o `defaultValue` em ambientes não-navegador:

```tsx
// Exemplo Next.js
const MeuComponente = () => {
  const { value } = useStorage({
    key: "tema",
    defaultValue: "claro",
  });

  // Usará "claro" durante SSR, depois hidrata com o valor real
  return <div className={value}>Conteúdo</div>;
};
```

## Compatibilidade de Navegadores

Funciona em todos os navegadores modernos que suportam:

- API localStorage/sessionStorage
- Recursos ES6+
- React 16.8+ (Hooks)

## Licença

MIT
