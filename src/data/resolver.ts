import usersData from './users.json';
import checkoutData from './checkout.json';

export type Credenciais = { username: string; password: string };
export type Produto = { nome: string; dataTestId: string; preco: string };
export type DadosCliente = { firstName: string; lastName: string; postalCode: string };

type PerfilUsuario = keyof typeof usersData.usuarios;
type ChaveMensagemLogin = keyof typeof usersData.mensagensErro;
type ChaveMensagemCheckout = keyof typeof checkoutData.mensagensErro;
type ChaveClienteIncompleto = keyof typeof checkoutData.clienteIncompleto;

export function obterCredenciais(perfil: string): Credenciais {
  const chave = perfil as PerfilUsuario;
  const credenciais = usersData.usuarios[chave];
  if (!credenciais) {
    const disponiveis = Object.keys(usersData.usuarios).join(', ');
    throw new Error(`Perfil de usuário desconhecido: "${perfil}". Disponíveis: ${disponiveis}`);
  }
  // SENHA do .env só substitui a senha canônica do demo — não mascara senhas de cenários negativos
  const senhaCanonica = usersData.usuarios.valido.password;
  const password =
    credenciais.password === senhaCanonica
      ? process.env.SENHA || credenciais.password
      : credenciais.password;
  return {
    username: credenciais.username,
    password,
  };
}

export function obterMensagemErroLogin(chave: string): string {
  const msg = usersData.mensagensErro[chave as ChaveMensagemLogin];
  if (!msg) {
    const disponiveis = Object.keys(usersData.mensagensErro).join(', ');
    throw new Error(`Mensagem de login desconhecida: "${chave}". Disponíveis: ${disponiveis}`);
  }
  return msg;
}

export function obterProdutoPorNome(nomeProduto: string): Produto {
  const produto = Object.values(checkoutData.produtos).find((p) => p.nome === nomeProduto);
  if (!produto) {
    const disponiveis = Object.values(checkoutData.produtos)
      .map((p) => p.nome)
      .join(', ');
    throw new Error(`Produto não mapeado: "${nomeProduto}". Disponíveis: ${disponiveis}`);
  }
  return produto;
}

export function obterCliente(chave: string): DadosCliente {
  if (chave === 'valido') {
    return { ...checkoutData.clienteValido };
  }
  if (chave === 'alternativo') {
    return { ...checkoutData.clienteAlternativo };
  }
  return obterClienteIncompleto(chave);
}

export function obterClienteIncompleto(chave: string): DadosCliente {
  const dados = checkoutData.clienteIncompleto[chave as ChaveClienteIncompleto];
  if (!dados) {
    const disponiveis = Object.keys(checkoutData.clienteIncompleto).join(', ');
    throw new Error(`Cliente incompleto desconhecido: "${chave}". Disponíveis: ${disponiveis}`);
  }
  return { ...dados };
}

export function obterMensagemErroCheckout(chave: string): string {
  const msg = checkoutData.mensagensErro[chave as ChaveMensagemCheckout];
  if (!msg) {
    const disponiveis = Object.keys(checkoutData.mensagensErro).join(', ');
    throw new Error(`Mensagem de checkout desconhecida: "${chave}". Disponíveis: ${disponiveis}`);
  }
  return msg;
}

export function obterConfirmacaoCompra(): string {
  return checkoutData.confirmacaoCompra;
}

/** Resolve username literal (ex.: standard_user) ou perfil (ex.: valido). */
export function resolverUsuarioParaLogin(usuarioOuPerfil: string): Credenciais {
  const perfis = usersData.usuarios as Record<string, Credenciais>;
  if (perfis[usuarioOuPerfil]) {
    return obterCredenciais(usuarioOuPerfil);
  }
  const porUsername = Object.values(perfis).find((u) => u.username === usuarioOuPerfil);
  if (porUsername) {
    return {
      username: porUsername.username,
      password: process.env.SENHA || porUsername.password,
    };
  }
  return {
    username: usuarioOuPerfil,
    password: process.env.SENHA || 'secret_sauce',
  };
}
