const soDigitos = (v) => String(v ?? '').replace(/\D/g, '');
const vazio = (v) => v === undefined || v === null || String(v).trim() === '';

function cnpjValido(valor) {
  const c = soDigitos(valor);
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
  const dv = (base) => {
    let soma = 0;
    let peso = base.length - 7;
    for (const d of base) {
      soma += Number(d) * peso--;
      if (peso < 2) peso = 9;
    }
    const r = soma % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = dv(c.slice(0, 12));
  const d2 = dv(c.slice(0, 12) + d1);
  return c.endsWith(`${d1}${d2}`);
}

function validarFornecedor(b) {
  const erros = {};
  if (vazio(b.nome)) erros.nome = 'Nome da empresa é obrigatório.';
  if (vazio(b.cnpj)) erros.cnpj = 'CNPJ é obrigatório.';
  else if (!cnpjValido(b.cnpj)) erros.cnpj = 'CNPJ inválido.';
  if (vazio(b.endereco)) erros.endereco = 'Endereço é obrigatório.';
  if (vazio(b.telefone)) erros.telefone = 'Telefone é obrigatório.';
  else if (![10, 11].includes(soDigitos(b.telefone).length)) erros.telefone = 'Telefone inválido.';
  if (vazio(b.email)) erros.email = 'E-mail é obrigatório.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(b.email).trim())) erros.email = 'E-mail inválido.';
  if (vazio(b.contatoPrincipal)) erros.contatoPrincipal = 'Contato principal é obrigatório.';
  return erros;
}

function validarProduto(b) {
  const erros = {};
  if (vazio(b.nome)) erros.nome = 'Nome do produto é obrigatório.';
  if (!vazio(b.codigoBarras) && !/^\d{8,14}$/.test(String(b.codigoBarras).trim()))
    erros.codigoBarras = 'Código de barras deve conter de 8 a 14 dígitos numéricos.';
  if (vazio(b.descricao)) erros.descricao = 'Descrição é obrigatória.';
  if (!vazio(b.quantidade) && !/^\d+$/.test(String(b.quantidade).trim()))
    erros.quantidade = 'Quantidade deve ser um número inteiro não negativo.';
  if (!vazio(b.preco) && (isNaN(Number(b.preco)) || Number(b.preco) < 0))
    erros.preco = 'Preço deve ser um número não negativo.';
  if (vazio(b.categoria)) erros.categoria = 'Categoria é obrigatória.';
  if (!vazio(b.dataValidade) && isNaN(Date.parse(b.dataValidade)))
    erros.dataValidade = 'Data de validade inválida.';
  return erros;
}

module.exports = { cnpjValido, validarFornecedor, validarProduto, soDigitos, vazio };
