# Exemplos Práticos (Recipes)

Aqui você encontrará exemplos completos e prontos para usar em seus próprios projetos!

## 1. Autenticação Completa

Um fluxo típico de login e registro:

```
start: SistemaAutenticacao

scene Inicial
  d: Usuário visualiza página de boas-vindas
  u: Cliquei em "Entrar"
  -> Login

scene Login
  d: Exibe formulário de login
  u: Digitei email e senha
  system: Enviando credenciais...

  if: Login bem-sucedido?
    d: Usuário autenticado
    -> Dashboard
  else:
    d: Erro nas credenciais
    u: Recebi mensagem de erro
    when: Desejo tentar novamente?
      -> Login
    when: Desejo me registrar?
      -> Registro

scene Registro
  d: Exibe formulário de registro
  u: Preenchi formulário com dados
  system: Validando dados...

  if: Email já existe?
    -> Registro
  else:
    system: Conta criada com sucesso!
    -> Dashboard

scene Dashboard
  d: Painel principal com dados do usuário
  u: Navegando pelo aplicativo
  u: Cliquei em "Sair"
  -> Logout

scene Logout
  system: Limpando sessão...
  d: Redirecionando para página inicial
  -> Inicial
```

## 2. Carrinho de Compras

Fluxo completo de um e-commerce:

```
start: Loja

scene Catalogo
  d: Produtos são exibidos em grid
  u: Cliquei em um produto
  -> DetalhesProduto

scene DetalhesProduto
  d: Imagens e descrição do produto
  u: Selecionei quantidade e cor

  when: Adicionei ao carrinho?
    system: Produto adicionado!
    -> Catalogo
  when: Comprei agora?
    -> Carrinho

scene Carrinho
  d: Listando itens do carrinho

  let: total = 399.90
  let: qtdItens = 3

  u: Revisando itens

  if: Carrinho vazio?
    -> Catalogo
  else:
    u: Prossegui para checkout
    -> Endereco

scene Endereco
  d: Formulário de endereço de entrega
  u: Selecionei endereço salvo

  if: Endereço válido?
    system: Endereço confirmado
    -> Pagamento
  else:
    -> Endereco

scene Pagamento
  external: Gateway de pagamento (Stripe/Square)
  d: Integrando com processador
  u: Selecionei método de pagamento

  if: Pagamento aprovado?
    -> Confirmacao
  else:
    d: Pagamento recusado
    u: Tentei novamente
    -> Pagamento

scene Confirmacao
  d: Número do pedido gerado
  system: Email de confirmação enviado
  effect: Inventário atualizado e pedido criado
  u: Cliquei em "Voltar à loja"
  -> Catalogo
```

## 3. Assistente (Wizard) Passo-a-Passo

Um formulário multipassos para coleta de dados:

```
start: FormularioInscrição

scene BemVindo
  d: Exibe mensagem de boas-vindas
  d: "Vamos completar seu perfil em 4 passos"
  u: Cliquei em "Começar"
  -> Passo1

scene Passo1
  d: "Passo 1/4: Dados Pessoais"
  d: Formulário com nome e email
  u: Preenchí os dados

  if: Dados válidos?
    system: Dados salvos!
    -> Passo2
  else:
    -> Passo1

scene Passo2
  d: "Passo 2/4: Endereço"
  d: Formulário com endereço
  u: Preenchí o endereço

  topic: Validação
    system: Verificando CEP...

  if: Endereço válido?
    system: Endereço confirmado
    -> Passo3
  else:
    system: CEP inválido, tente novamente
    -> Passo2

scene Passo3
  d: "Passo 3/4: Preferências"
  d: Checkboxes e seletores
  u: Selecionei minhas preferências
  system: Preferências salvas
  -> Passo4

scene Passo4
  d: "Passo 4/4: Revisão Final"
  d: Resumo de todos os dados coletados
  u: Revisei meus dados

  when: Dados corretos?
    u: Cliquei em "Finalizar"
    -> Conclusao
  when: Preciso editar?
    u: Retornei ao passo anterior
    -> Passo3

scene Conclusao
  system: Inscrição completada com sucesso!
  d: Email de confirmação enviado
  effect: Usuário é adicionado ao banco de dados
  u: Fui redirecionado ao dashboard
  -> end
```

## 4. Sistema de Suporte com Escalonamento

Suporte técnico com histórico e escalação:

```
start: SuporteTecnico

scene MenuSuporte
  d: Menu inicial com opções
  u: Selecionei "Abrir Ticket"
  -> CriarTicket

scene CriarTicket
  d: Formulário para novo ticket
  u: Descrevi meu problema
  system: Ticket #12345 criado
  -> AnalisaTicket

scene AnalisaTicket
  process: IA analisa o problema

  when: Problema é comum?
    -> SolucaoAutomatica
  when: Problema é complexo?
    -> EscalacaoAgente

scene SolucaoAutomatica
  d: Sugestões baseadas em IA
  let: confidence = 87%

  when: Solução funcionou?
    u: Problema resolvido!
    -> TicketFechado
  when: Preciso falar com humano?
    -> EscalacaoAgente

scene EscalacaoAgente
  d: Conectando com próximo agente disponível...
  system: Aguardando agente...

  when: Agente disponível?
    -> ChatAoVivo
  when: Nenhum agente disponível?
    -> Agendamento

scene ChatAoVivo
  contact: Agente de Suporte
  u: Explicando meu problema

  when: Problema resolvido?
    -> TicketFechado
  when: Preciso acompanhamento?
    -> FollowUp

scene Agendamento
  d: Agendador de callback
  u: Agendei uma ligação
  effect: Email de confirmação é enviado
  -> TicketEmAberto

scene FollowUp
  effect: Email será enviado em 24 horas
  -> TicketEmAberto

scene TicketEmAberto
  d: Ticket está aberto e aguardando
  u: Voltei mais tarde para acompanhamento
  -> MenuSuporte

scene TicketFechado
  system: Ticket foi fechado
  d: Avaliação de satisfação
  u: Avaliei o atendimento
  effect: Feedback é registrado
  -> MenuSuporte
```

> [!info] Dica Profissional: Sempre defina variáveis com `let:` para rastrear estado importante. Use `effect:` para documentar ações que acontecem behind-the-scenes!

---

## 5. Editor Completo (MoLIC.dg)

Um exemplo real e completo do fluxo de interação do próprio MoLIC.dg com múltiplos diálogos, cenas globais e controle de estado:

```
start ini {
  u: "Entrar" let: "code = localStorage.code"-> EditarMolic
}

main scene EditarMolic {
  topic: "Editar MoLIC"

  and {
    or {
      subtopic: "Mostrar código e diagrama"
        d: "código, diagrama" if: "code"
        d: "código de exemplo, diagrama" if: "!code"

    }
    subtopic: "Editar código"
      u: "escrever código"
      d: "gerar diagrama"
    subtopic: "Editar diagrama"
      d: "diagrama"
    subtopic: "Desfazer ação"
      u: "Desfazer"
        if: "diagram.lastUndos <= 30 ações"
    subtopic: "Refazer ação"
      u: "Refazer"
        if: "diagram.lastRedos > 0"
    subtopic: "Alterar zoom"
      du: "list (aumentar, diminuir, ajustar, valor manual)"
  }

  preferred d: "Parsear código"
    when: "300ms sem digitar" -> AttMolic
}

process AttMolic {
  preferred d: "Atualizar MoLIC"
    if: "código válido"
    effect: "localStorage.code = code"-> EditarMolic
  d: "Erro"
    if: "erro de sintaxe " ..> EditarMolic
}

global G {
  u: "Fechar" -> Fim
  u: "Importar" -> ImportarMolic
  u: "Exportar" -> ExportarMolic
  u: "Mudar tema" -> MudarTema
  u: "Ver docs" -> ViewDocs
}

scene ImportarMolic {
  topic: "Importar Molic"

  and {
    subtopic: "Informar arquivo"
    du: "caminho, nome"
  }

  u: "Confirmar" -> ImportMolic
}

process ImportMolic {
  d: "Arquivo ou caminho inválido"
    if: "" ..> ImportarMolic
  d: "Arquivo carregado"
    if: "Arqivo válido" -> EditarMolic
}

scene ExportarMolic {
  topic: "Exportar Molic"

  and {
    subtopic: "Escolher opção de exportação"
    du: "list (exportar, imprimir)"
    or {
      subtopic: "Escolher formato"
      du: "list (.molic, .svg, .png, .pdf)"
        if: "exportar"
      du: "caminho, nome"
        if: "imprimir"
    }
  }

  u: "Confirmar" -> ExportMolic
}

process ExportMolic {
  d: "Arquivo ou caminho inválido"
    if: "" ..> ExportarMolic
  d: "Arquivo gerado"
    if: "" -> F
}

fork F {
  d: "Arquivo gerado" -> SavedFile
  d: "Abrir janela de impressão"
    if: "imprimir" -> Ext
}

scene MudarTema {
  topic: "Mudar tema"

  and {
    subtopic: "Escolher tema"
    du: "list (claro, escuro, sistema)"
  }

  u: "Escolher" -> ChangeTheme
}

scene ViewDocs {
  topic: "Visualizar documentação"

}

break SavedFile
break ChangeTheme

external Ext

end Fim
```

> [!success] Este é um exemplo real do próprio MoLIC.dg! Ele demonstra o uso de: **cenas globais** para ações sempre disponíveis, **preferências** para parsing automático, **múltiplos diálogos** com `and`, **bifurcações** com `or`, **transições para tipos diferentes de nós** (process, fork, external), e **salvamento automático** com `effect:`.

---

## Boas Práticas

### ✓ Faça Sempre

- Use nomes de cenas **descritivos** e **usando PascalCase**
- **Documente decisões** com `why:`
- **Agrupe falas relacionadas** com `topic:`
- **Defina variáveis** que rastreiam estado importante

### ✗ Evite

- Nomes de cenas muito genéricos (`Tela1`, `Passo2`)
- Cenas com lógica excessivamente complexa
- Deixar transições sem contexto
- Ignorar efeitos colaterais importantes

Divirta-se modelando! 🎨
