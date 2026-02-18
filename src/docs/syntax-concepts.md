# Sintaxe & Conceitos

## Estrutura Básica

Todo diagrama MoLIC segue uma estrutura hierárquica simples:

```
start: NomeDaCena

scene NomeDaCena
  [conteúdo]

scene OutraCena
  [conteúdo]

-> end
```

### Os Três Blocos Fundamentais

#### **1. Start (Início)**

Define o ponto de entrada do diagrama:

```
start: MinhaAplicacao
```

#### **2. Scene (Cena)**

Uma cena representa um estado ou contexto da interação:

```
scene Dashboard
  system: Bem-vindo ao painel!
```

#### **3. End (Fim)**

Marca o término de um fluxo:

```
-> end
```

## Falas (Utterances)

As falas representam as mensagens ou ações trocadas entre usuário e sistema:

### Fala do Sistema

Use `d:` ou `system:` para mensagens do designer/sistema:

```
scene Menu
  d: O sistema exibe um menu com três opções
```

### Fala do Usuário

Use `u:` ou `user:` para ações e falas do usuário:

```
scene Menu
  u: Cliquei em "Perfil"
```

### Fala Mista

Use `du:` ou `mixed:` para descrever interações bidirecional:

```
scene Busca
  du: Usuário digita na caixa de busca enquanto o sistema filtra resultados em tempo real
```

## Fluxos e Decisões

### If / Else (Decisões Bifurcadas)

Use `if` e `else` para criar desvios de fluxo:

```
scene Checkout
  u: Verifiquei meu carrinho

  if: Carrinho vazio?
    system: Seu carrinho está vazio
    -> ShoppingPreco
  else:
    system: Prossiga para o pagamento
    -> Payment
```

### When (Transições Condicionais)

`when` define uma condição sem bifurcação explícita:

```
scene Atendimento
  when: Atendente disponível?
    -> Atendimento
  when: Fila grande?
    -> Agendamento
```

## Metadados

### Topic (Tópico)

Agrupa uma ou mais falas sob um tópico:

```
scene Configurações
  topic: Privacidade
    system: Ajustes de privacidade
    u: Marcar como privado
```

### Let (Variáveis)

Define variáveis ou estados para documentação:

```
scene PerfilUsuario
  let: userName = "João Silva"
  let: userRole = "Admin"
  system: Bem-vindo, {userName}!
```

### Why (Racionalização)

Documenta por que uma decisão foi tomada:

```
scene Carrinho
  if: Estoque disponível?
    -> Checkout
    why: Verifica estoque antes de prosseguir para ordem de compra
```

### Effect (Efeito)

Descreve o que acontece como resultado:

```
scene Pedido
  u: Finalizei a compra
  -> PedidoConfirmado
  effect: Estoque é decrementado e email de confirmação é enviado
```

## Transições

Use `->` para indicar transições entre cenas:

```
scene A
  system: Ação na cena A
  -> B

scene B
  system: Ação na cena B
  -> end
```

### Transições Globais

Use `break` para sair do fluxo atual:

```
scene Processo
  when: Usuário cancela?
    -> break
```

> [!warning] Todas as falas devem estar indentadas corretamente. Inconsistências de indentação causarão erros de sintaxe!
