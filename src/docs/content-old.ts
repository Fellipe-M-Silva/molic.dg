// Import markdown files directly
// Using ?raw to import as plain text
import gettingStartedMd from './getting-started.md?raw';
import syntaxConceptsMd from './syntax-concepts.md?raw';
import apiReferenceMd from './api-reference.md?raw';
import recipesMd from './recipes.md?raw';

export const documentationContent = {
	'getting-started': gettingStartedMd,
	'syntax-concepts': syntaxConceptsMd,
	'api-reference': apiReferenceMd,
	'recipes': recipesMd,
} as const;
 é uma notação visual poderosa para especificar e modelar cenários de interação em sistemas computacionais. Diferente de outras abordagens tradicionais, MoLIC oferece uma representação clara das conversações entre usuários e sistemas.

### Principais Características

- **Notação clara e intuitiva** para representar fluxos de interação
- **Suporte para decisões e bifurcações** de fluxo
- **Representação de falas e ações** de usuários e sistema
- **Metadata rica** para documentação e racionalização de decisões
- **Exportação para múltiplos formatos** (SVG, PDF)

## Instalação e Uso

### Como usar o MoLIC.dg

1. **Abra a aplicação** - Você já está aqui! 🎉
2. **Comece a digitar** no bloco de código à esquerda
3. **Veja o diagrama** atualizar em tempo real à direita
4. **Exporte seu trabalho** usando o botão "Export" no topo

### Salvamento Automático

Seu código é salvo automaticamente no navegador. Não se preocupe em perder seu trabalho!

## Seu Primeiro Diagrama

Vamos criar um exemplo simples de um usuário fazendo login:

\`\`\`
start Login {
  u: "entrar" -> Login
}

scene Login {
  topic: "Login"

  and {
    u: "e-mail, senha"
  }

  u: "continuar" -> Auth
}

main scene Home {
  topic: "Início"
}

process Auth {
  d: "credenciais corretas" -> Home
  d: "e-mail ou senha incorretos"
    if: ""
    ..> Login
}
\`\`\`

> [!info] Dica: digite \`stsc\` criar um ponto de início e uma cena inicial. Use \`Ctrl+S\` para forçar a compilação.

## Próximos Passos

- Aprenda sobre a **sintaxe completa** em "Sintaxe & Conceitos"
- Explore os **tipos de nós** em "Referência de API"
- Veja **exemplos prontos** em "Exemplos Práticos"`,

	"syntax-concepts": `# Sintaxe & Conceitos

## Estrutura Básica

Todo diagrama MoLIC segue uma estrutura hierárquica simples:

\`\`\`
start: NomeDaCena
  
scene NomeDaCena
  [conteúdo]
  
scene OutraCena
  [conteúdo]
  
-> end
\`\`\`

### Os Três Blocos Fundamentais

#### **1. Start (Início)**

Define o ponto de entrada do diagrama:

\`\`\`
start: MinhaAplicacao
\`\`\`

#### **2. Scene (Cena)**

Uma cena representa um estado ou contexto da interação:

\`\`\`
scene Dashboard
  system: Bem-vindo ao painel!
\`\`\`

#### **3. End (Fim)**

Marca o término de um fluxo:

\`\`\`
-> end
\`\`\`

## Falas (Utterances)

As falas representam as mensagens ou ações trocadas entre usuário e sistema:

### Fala do Sistema

Use \`d:\` ou \`system:\` para mensagens do designer/sistema:

\`\`\`
scene Menu
  d: O sistema exibe um menu com três opções
\`\`\`

### Fala do Usuário

Use \`u:\` ou \`user:\` para ações e falas do usuário:

\`\`\`
scene Menu
  u: Cliquei em "Perfil"
\`\`\`

### Fala Mista

Use \`du:\` ou \`mixed:\` para descrever interações bidirecional:

\`\`\`
scene Busca
  du: Usuário digita na caixa de busca enquanto o sistema filtra resultados em tempo real
\`\`\`

## Fluxos e Decisões

### If / Else (Decisões Bifurcadas)

Use \`if\` e \`else\` para criar desvios de fluxo:

\`\`\`
scene Checkout
  u: Verifiquei meu carrinho
  
  if: Carrinho vazio?
    system: Seu carrinho está vazio
    -> ShoppingPreco
  else:
    system: Prossiga para o pagamento
    -> Payment
\`\`\`

### When (Transições Condicionais)

\`when\` define uma condição sem bifurcação explícita:

\`\`\`
scene Atendimento
  when: Atendente disponível?
    -> Atendimento
  when: Fila grande?
    -> Agendamento
\`\`\`

## Metadados

### Topic (Tópico)

Agrupa uma ou mais falas sob um tópico:

\`\`\`
scene Configurações
  topic: Privacidade
    system: Ajustes de privacidade
    u: Marcar como privado
\`\`\`

### Let (Variáveis)

Define variáveis ou estados para documentação:

\`\`\`
scene PerfilUsuario
  let: userName = "João Silva"
  let: userRole = "Admin"
  system: Bem-vindo, {userName}!
\`\`\`

### Why (Racionalização)

Documenta por que uma decisão foi tomada:

\`\`\`
scene Carrinho
  if: Estoque disponível?
    -> Checkout
    why: Verifica estoque antes de prosseguir para ordem de compra
\`\`\`

### Effect (Efeito)

Descreve o que acontece como resultado:

\`\`\`
scene Pedido
  u: Finalizei a compra
  -> PedidoConfirmado
  effect: Estoque é decrementado e email de confirmação é enviado
\`\`\`

## Transições

Use \`->\` para indicar transições entre cenas:

\`\`\`
scene A
  system: Ação na cena A
  -> B

scene B
  system: Ação na cena B
  -> end
\`\`\`

### Transições Globais

Use \`break\` para sair do fluxo atual:

\`\`\`
scene Processo
  when: Usuário cancela?
    -> break
\`\`\`

> [!warning] Todas as falas devem estar indentadas corretamente. Inconsistências de indentação causarão erros de sintaxe!`,

	"api-reference": `# Referência de API

## Tipos de Nós

MoLIC oferece diferentes tipos de nós para representar diferentes aspectos da interação:

## Scene (Cena)

A cena é o bloco fundamental. Representa um estado ou contexto conversacional.

\`\`\`
scene NomeDaCena
  system: Mensagem do sistema
  user: Ação do usuário
\`\`\`

### Características

- Pode conter múltiplas falas
- Suporta decisões internas (if/else)
- Pode transicionar para outras cenas
- Pode ser global (acessível de qualquer lugar)

### Exemplo

\`\`\`
scene Dashboard
  d: Sistema exibe o painel principal
  u: Usuário visualiza seus dados
  -> end
\`\`\`

## Global Scene

Uma cena global pode ser acessada de qualquer outra cena, sem necessidade de transição explícita:

\`\`\`
global scene Help
  d: Abre o painel de ajuda
  -> Help
\`\`\`

## Process (Processo)

Um \`process\` é uma representação de um fluxo de sistema mais complexo, sem interação direta com o usuário:

\`\`\`
process SendEmail
  effect: Email é enviado e log é registrado
  when: Email enviado com sucesso?
    -> NotificationSent
\`\`\`

## Fork (Bifurcação)

Um \`fork\` representa múltiplos fluxos paralelos que acontecem simultaneamente:

\`\`\`
fork: ProcessoPagamento
  -> ProcessarPagamento
  -> EnviarNotificacao
  -> AtualizarInventario
\`\`\`

## Nós Terminais

### Start (Início)

Define o ponto de entrada do diagrama:

\`\`\`
start: AplicacaoWeb
\`\`\`

### End (Fim)

Marca o término de um fluxo:

\`\`\`
scene Final
  system: Obrigado por usar nosso serviço!
  -> end
\`\`\`

### Break

Interrompe um fluxo atual e retorna para o nível anterior:

\`\`\`
scene Processo
  when: Usuário pressiona ESC?
    -> break
\`\`\`

## External (Externo)

Representa uma interação com um sistema externo:

\`\`\`
scene Pagamento
  external: Integração com Stripe
  -> PagamentoProcessado
\`\`\`

## Contact (Contato)

Referencia um agente externo (atendente, suporte, etc.):

\`\`\`
scene Suporte
  contact: Agente de suporte
  -> ConversaComAgente
\`\`\`

## Transições de Controle

### -> (Transição Normal)

Descreve uma transição clara entre cenas:

\`\`\`
scene A
  -> B
\`\`\`

### if / else (Decisão)

Bifurca baseado em uma condição:

\`\`\`
scene Validacao
  if: Dados válidos?
    -> Sucesso
  else:
    -> Erro
\`\`\`

### when (Condição)

Define uma transição condicional:

\`\`\`
scene Monitor
  when: Evento disparado?
    -> Processar
\`\`\`

## Exemplos Completos

### Fluxo Simples

\`\`\`
start: App

scene Inicio
  d: Carregando...
  u: Aplicação carregada
  -> Menu

scene Menu
  d: Menu com 3 opções
  u: Selecionei uma opção
  -> end
\`\`\`

### Fluxo com Decisões

\`\`\`
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
\`\`\`

> [!success] Dica: Use nomes descritivos para suas cenas. Isso torna o diagrama mais legível e fácil de manter!`,

	recipes: `# Exemplos Práticos (Recipes)

Aqui você encontrará exemplos completos e prontos para usar em seus próprios projetos!

## 1. Autenticação Completa

Um fluxo típico de login e registro:

\`\`\`
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
\`\`\`

## 2. Carrinho de Compras

Fluxo completo de um e-commerce:

\`\`\`
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
\`\`\`

## 3. Assistente (Wizard) Passo-a-Passo

Um formulário multipassos para coleta de dados:

\`\`\`
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
\`\`\`

## 4. Sistema de Suporte com Escalonamento

Suporte técnico com histórico e escalação:

\`\`\`
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
\`\`\`

> [!info] Dica Profissional: Sempre defina variáveis com \`let:\` para rastrear estado importante. Use \`effect:\` para documentar ações que acontecem behind-the-scenes!

---

## Boas Práticas

### ✓ Faça Sempre
- Use nomes de cenas **descritivos** e **usando PascalCase**
- **Documente decisões** com \`why:\`
- **Agrupe falas relacionadas** com \`topic:\`
- **Defina variáveis** que rastreiam estado importante

### ✗ Evite
- Nomes de cenas muito genéricos (\`Tela1\`, \`Passo2\`)
- Cenas com lógica excessivamente complexa
- Deixar transições sem contexto
- Ignorar efeitos colaterais importantes

Divirta-se modelando! 🎨`,
};
