# molic.dg

Editor visual para a linguagem **MOLIC**, permitindo modelar fluxos de conversação em sistemas de diálogo. Combine um editor de código com diagrama interativo que se atualiza em tempo real, com syntax highlighting, auto-completar, validação e exportação para SVG.

- [Sobre o molic.dg](#sobre-o-molg)
- [Como Contribuir](#como-contribuir)
- [Documentação](#documentação)

## Sobre o molic.dg

**Principais recursos:**

- **Editor de Código**: Syntax highlighting, auto-completar e validação em tempo real
- **Diagrama Interativo**: Visualização que se atualiza conforme você escreve
- **Snippets**: Atalhos como `scen`, `star`, `proc` para gerar estruturas comuns
- **Exportar**: Baixar diagrama como SVG
- **Tema**: Modo claro e escuro

## Como Contribuir

### Instalação

```bash
git clone [seu-repositorio]
cd molic.dg
npm install
npm run dev
```

O app estará em `http://localhost:5173`

### Estrutura

```
src/
├── components/       # Componentes React
├── context/          # React Context
├── core/             # Parser, grammar, lógica MOLIC
├── docs/             # Documentação do app (markdown)
├── hooks/            # Custom hooks
├── providers/        # Providers do app
├── styles/           # Estilos globais
├── types/            # TypeScript types
└── utils/            # Funções globais
```

## Documentação

### Adicionar página

1. Crie arquivo em `src/docs/seu-arquivo.md`
2. Registre em `src/docs/content.ts`:

```typescript
{
  id: 'seu-arquivo',
  title: 'Título',
  file: 'seu-arquivo.md',
  order: 10,
}
```

3. Pronto! O app se atualiza automaticamente

---

**Stack**: React + TypeScript + Vite + Monaco Editor + React Flow
