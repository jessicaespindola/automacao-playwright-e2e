# language: pt
@checkout
Funcionalidade: Checkout no e-commerce SauceDemo
  Como um cliente autenticado
  Quero adicionar produtos ao carrinho e finalizar a compra
  Para concluir o fluxo de checkout com sucesso

  # Nota sobre "pagamento / cartão":
  # O SauceDemo NÃO possui campos de cartão de crédito.
  # Dados de cliente e mensagens: src/data/checkout.json
  # Chaves de cliente: valido | alternativo | semNome | semSobrenome | semCep

  Contexto:
    Dado que estou autenticado como "standard_user"

  @positivo @smoke
  Cenário: Compra completa com dados válidos
    Quando eu adiciono o produto "Sauce Labs Backpack" ao carrinho
    E eu abro o carrinho
    Então o produto "Sauce Labs Backpack" deve estar no carrinho
    Quando eu inicio o checkout
    E eu preencho os dados de entrega do cliente "valido"
    E eu continuo para o resumo do pedido
    Então o resumo deve exibir o produto "Sauce Labs Backpack"
    Quando eu finalizo a compra
    Então eu devo ver a confirmação da compra

  @positivo
  Cenário: Adicionar múltiplos produtos e concluir compra
    Quando eu adiciono o produto "Sauce Labs Backpack" ao carrinho
    E eu adiciono o produto "Sauce Labs Bike Light" ao carrinho
    Então o badge do carrinho deve exibir "2"
    Quando eu abro o carrinho
    Então o carrinho deve conter 2 itens
    Quando eu inicio o checkout
    E eu preencho os dados de entrega do cliente "alternativo"
    E eu continuo para o resumo do pedido
    Quando eu finalizo a compra
    Então eu devo ver a confirmação da compra

  @negativo
  Cenário: Checkout com endereço de entrega incompleto - nome em branco
    Quando eu adiciono o produto "Sauce Labs Backpack" ao carrinho
    E eu abro o carrinho
    E eu inicio o checkout
    E eu preencho os dados de entrega do cliente "semNome"
    E eu continuo para o resumo do pedido
    Então eu devo permanecer na etapa de informações do checkout
    E deve ser exibida a mensagem de erro do checkout "firstNameObrigatorio"

  @negativo
  Cenário: Checkout com endereço de entrega incompleto - sobrenome em branco
    Quando eu adiciono o produto "Sauce Labs Backpack" ao carrinho
    E eu abro o carrinho
    E eu inicio o checkout
    E eu preencho os dados de entrega do cliente "semSobrenome"
    E eu continuo para o resumo do pedido
    Então eu devo permanecer na etapa de informações do checkout
    E deve ser exibida a mensagem de erro do checkout "lastNameObrigatorio"

  @negativo
  Cenário: Checkout com endereço de entrega incompleto - CEP em branco
    Quando eu adiciono o produto "Sauce Labs Backpack" ao carrinho
    E eu abro o carrinho
    E eu inicio o checkout
    E eu preencho os dados de entrega do cliente "semCep"
    E eu continuo para o resumo do pedido
    Então eu devo permanecer na etapa de informações do checkout
    E deve ser exibida a mensagem de erro do checkout "postalCodeObrigatorio"

  @negativo
  # Equivalente funcional a "dados de pagamento inválidos" no SauceDemo
  # (site sem campo de cartão): formulário de checkout totalmente vazio.
  Cenário: Checkout com dados de pagamento/entrega inválidos - formulário vazio
    Quando eu adiciono o produto "Sauce Labs Backpack" ao carrinho
    E eu abro o carrinho
    E eu inicio o checkout
    E eu continuo para o resumo do pedido
    Então eu devo permanecer na etapa de informações do checkout
    E deve ser exibida a mensagem de erro do checkout "firstNameObrigatorio"
