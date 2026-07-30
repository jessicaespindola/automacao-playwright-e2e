# language: pt
@acessibilidade
Funcionalidade: Acessibilidade WCAG no SauceDemo
  Como equipe de qualidade
  Quero analisar as páginas com axe-core e validar navegação por teclado
  Para garantir WCAG 2.0 Nível A/AA (critical/serious) e WCAG 2.1.1 (TAB)

  # Política axe: falha apenas em critical/serious.
  # select-name desabilitado somente na página Products.
  # Setup autenticado usa storageState; jornadas longas usam steps compostos.

  @smoke @axe
  Cenário: Página de login sem violações critical ou serious
    Dado que estou na página de login do SauceDemo
    Quando eu executo a análise de acessibilidade na página "Login"
    Então a página deve estar livre de violações critical e serious segundo WCAG 2 nivel A e AA

  @axe
  Cenário: Página de produtos sem violações critical ou serious
    Dado que estou autenticado como "standard_user"
    Quando eu executo a análise de acessibilidade na página "Products"
    Então a página deve estar livre de violações critical e serious segundo WCAG 2 nivel A e AA

  @axe
  Cenário: Página do carrinho sem violações critical ou serious
    Dado que estou na página do carrinho com o produto "Sauce Labs Backpack"
    Quando eu executo a análise de acessibilidade na página "Cart"
    Então a página deve estar livre de violações critical e serious segundo WCAG 2 nivel A e AA

  @axe
  Cenário: Página de informações do checkout sem violações critical ou serious
    Dado que estou na etapa de informações do checkout com o produto "Sauce Labs Backpack"
    Quando eu executo a análise de acessibilidade na página "Checkout Info"
    Então a página deve estar livre de violações critical e serious segundo WCAG 2 nivel A e AA

  @axe
  Cenário: Página de resumo do checkout sem violações critical ou serious
    Dado que estou na etapa de informações do checkout com o produto "Sauce Labs Backpack"
    E eu preencho os dados de entrega do cliente "valido"
    E eu continuo para o resumo do pedido
    Quando eu executo a análise de acessibilidade na página "Checkout Overview"
    Então a página deve estar livre de violações critical e serious segundo WCAG 2 nivel A e AA

  @axe
  Cenário: Página de compra concluída sem violações critical ou serious
    Dado que estou na etapa de informações do checkout com o produto "Sauce Labs Backpack"
    E eu preencho os dados de entrega do cliente "valido"
    E eu continuo para o resumo do pedido
    E eu finalizo a compra
    Então eu devo ver a confirmação da compra
    Quando eu executo a análise de acessibilidade na página "Checkout Complete"
    Então a página deve estar livre de violações critical e serious segundo WCAG 2 nivel A e AA

  @teclado @smoke
  Cenário: Login — campos focáveis na ordem correta com TAB
    Dado que estou na página de login do SauceDemo
    Quando eu navego com TAB na ordem "username, password, login-button"
    Então a navegação por TAB deve estar aprovada

  @teclado
  Cenário: Checkout — campos de entrega focáveis na ordem correta com TAB
    Dado que estou na etapa de informações do checkout com o produto "Sauce Labs Backpack"
    Quando eu navego com TAB na ordem "firstName, lastName, postalCode, cancel, continue"
    Então a navegação por TAB deve estar aprovada
