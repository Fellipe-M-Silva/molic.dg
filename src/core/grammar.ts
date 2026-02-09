export const grammarSource = `
Molic {
  // --- Raiz ---
  Diagram
    = Element*

  Element
    = Scene
    | Global
    // REMOVIDO: | Comment (Não é mais necessário aqui, pois o space cuida disso)

  // --- Estruturas Principais ---
  Scene
    = "scene" identifier "{" BlockContent* "}"

  Global
    = "global" identifier "{" BlockContent* "}"

  // Conteúdo recursivo
  BlockContent
    = Topic
    | FlowControl
    | Dialog
    | Utterance
    | Event
    | Condition

  // --- Elementos Atômicos ---
  Topic
    = "topic:" string

  Dialog
    = "dialog" identifier "{" BlockContent* "}"

  FlowControl
    = ("seq" | "xor" | "or") "{" BlockContent* "}"

  Utterance
    = SystemUtterance
    | UserUtterance
    | MixedUtterance

  // Falas
  SystemUtterance
    = "d:" string Transition?
  
  UserUtterance
    = "u:" string Transition?

  MixedUtterance
    = "du:" FieldList

  Event
    = "when:" string Transition?

  Condition
    = "if:" string

  // --- Transições ---
  Transition
    = Arrow identifier

  Arrow
    = "->"   -- normal
    | "..>"  -- repair

  // --- Primitivos ---
  FieldList
    = NonemptyListOf<Field, ",">

  Field
    = identifier "?"?

  identifier
    = letter (alnum | "_")*

  string
    = "\\"" (~"\\"" any)* "\\""  -- doubleQuote
    | "'" (~"'" any)* "'"     -- singleQuote

  // CORREÇÃO 1: Renomeado para minúsculo (regra lexical)
  comment
    = "//" (~"\\n" any)* ("\\n" | end)  -- singleLine
    | "/*" (~"*/" any)* "*/"          -- multiLine

  // CORREÇÃO 2: Agora funciona porque lexical chama lexical
  space += comment
}
`;
