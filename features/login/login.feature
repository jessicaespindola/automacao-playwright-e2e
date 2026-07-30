# language: pt
@login
Funcionalidade: Login e navegação no SauceDemo
  Como um usuário da loja SauceDemo
  Quero autenticar e acessar a página de produtos
  Para que eu possa navegar e realizar compras

  # Credenciais e mensagens vêm de src/data/users.json (sem senha no Gherkin).
  # Perfis: valido | bloqueado | inexistente | senhaIncorreta

  Contexto:
    Dado que estou na página de login do SauceDemo

  @positivo @smoke
  Cenário: Login válido e navegação para a página de produtos
    Quando eu faço login com o perfil "valido"
    Então eu devo ser redirecionado para a página de produtos
    E o título "Products" deve estar visível

  @negativo
  Cenário: Login com senha incorreta
    Quando eu faço login com o perfil "senhaIncorreta"
    Então eu devo permanecer na página de login
    E deve ser exibida a mensagem de erro de login "credenciaisInvalidas"

  @negativo
  Cenário: Login com usuário inexistente
    Quando eu faço login com o perfil "inexistente"
    Então eu devo permanecer na página de login
    E deve ser exibida a mensagem de erro de login "credenciaisInvalidas"

  @negativo
  Cenário: Login com campos obrigatórios em branco
    Quando eu tento fazer login sem preencher usuário e senha
    Então eu devo permanecer na página de login
    E deve ser exibida a mensagem de erro de login "usuarioObrigatorio"

  @negativo
  Cenário: Login com usuário bloqueado
    Quando eu faço login com o perfil "bloqueado"
    Então eu devo permanecer na página de login
    E deve ser exibida a mensagem de erro de login "usuarioBloqueado"

  @negativo
  Cenário: Login apenas com usuário preenchido (senha em branco)
    Quando eu preencho apenas o usuário do perfil "valido" e deixo a senha em branco
    E eu clico no botão de login
    Então eu devo permanecer na página de login
    E deve ser exibida a mensagem de erro de login "senhaObrigatoria"
