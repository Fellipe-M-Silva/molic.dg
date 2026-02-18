# Referência de API

## Tipos de Nós

MoLIC oferece diferentes tipos de nós para representar diferentes aspectos da interação:

## Scene (Cena)

A cena é o bloco fundamental. Representa um estado ou contexto conversacional.

```
scene NomeDaCena
  system: Mensagem do sistema
  user: Ação do usuário
```

### Características

- Pode conter múltiplas falas
- Suporta decisões internas (if/else)
- Pode transicionar para outras cenas
- Pode ser global (acessível de qualquer lugar)

### Exemplo

```
scene Dashboard
  d: Sistema exibe o painel principal
  u: Usuário visualiza seus dados
  -> end
```

## Global Scene

Uma cena global pode ser acessada de qualquer outra cena, sem necessidade de transição explícita:

```
global Help {
  d: Abre o painel de ajuda
  -> Help
}
```

## Process (Processo)

Um `process` é uma representação de um fluxo de sistema mais complexo, sem interação direta com o usuário:

```
process SendEmail
  effect: Email é enviado e log é registrado
  when: Email enviado com sucesso?
    -> NotificationSent
```

## Fork (Bifurcação)

Um `fork` representa múltiplos fluxos paralelos que acontecem simultaneamente:

```
fork: ProcessoPagamento
  -> ProcessarPagamento
  -> EnviarNotificacao
  -> AtualizarInventario
```

## Nós Terminais

### Start (Início)

Define o ponto de entrada do diagrama:

```
start: AplicacaoWeb
```

### End (Fim)

Marca o término de um fluxo:

```
scene Final
  system: Obrigado por usar nosso serviço!
  -> end
```

### Break

Interrompe um fluxo atual e retorna para o nível anterior:

```
scene Processo
  when: Usuário pressiona ESC?
    -> break
```

## External (Externo)

Representa uma interação com um sistema externo:

```
scene Pagamento
  external: Integração com Stripe
  -> PagamentoProcessado
```

## Contact (Contato)

Referencia um agente externo (atendente, suporte, etc.):

```
scene Suporte
  contact: Agente de suporte
  -> ConversaComAgente
```

## Transições de Controle

### -> (Transição Normal)

Descreve uma transição clara entre cenas:

```
scene A
  -> B
```

### if / else (Decisão)

Bifurca baseado em uma condição:

```
scene Validacao
  if: Dados válidos?
    -> Sucesso
  else:
    -> Erro
```

### when (Condição)

Define uma transição condicional:

```
scene Monitor
  when: Evento disparado?
    -> Processar
```

## Exemplos Completos

### Fluxo Simples

```
start: App

scene Inicio
  d: Carregando...
  u: Aplicação carregada
  -> Menu

scene Menu
  d: Menu com 3 opções
  u: Selecionei uma opção
  -> end
```

### Fluxo com Decisões

```
start: Loja

scene Carrinho
  u: Adicionei itens ao carrinho
  -> Revisao

scene Revisao
  system: Revise seus itens

  if: Desejo prosseguir?
    -> Pagamento
  else:
    -> Carrinho

scene Pagamento
  external: Gateway de pagamento
  -> Confirmacao

scene Confirmacao
  d: Pedido confirmado!
  . effect: Email de confirmação enviado
  -> end
```

> [!success] Dica: Use nomes descritivos para suas cenas. Isso torna o diagrama mais legível e fácil de manter!
