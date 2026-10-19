// Em desenvolvimento a API roda na porta 3000; em produção o backend serve o frontend (mesma origem).
const BASE = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3000' : '');

async function request(method, path, body) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw { mensagem: 'Não foi possível conectar ao servidor.', erros: {} };
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { mensagem: data.mensagem || 'Erro inesperado.', erros: data.erros || {} };
  return data;
}

export const api = {
  produtos: {
    listar: () => request('GET', '/produtos'),
    criar: (d) => request('POST', '/produtos', d),
    atualizar: (id, d) => request('PUT', `/produtos/${id}`, d),
    remover: (id) => request('DELETE', `/produtos/${id}`),
  },
  fornecedores: {
    listar: () => request('GET', '/fornecedores'),
    criar: (d) => request('POST', '/fornecedores', d),
    atualizar: (id, d) => request('PUT', `/fornecedores/${id}`, d),
    remover: (id) => request('DELETE', `/fornecedores/${id}`),
  },
  associacao: {
    doProduto: (produtoId) => request('GET', `/produtos/${produtoId}/fornecedores`),
    doFornecedor: (fornecedorId) => request('GET', `/fornecedores/${fornecedorId}/produtos`),
    associar: (produtoId, fornecedorId) => request('POST', `/produtos/${produtoId}/fornecedores`, { fornecedorId }),
    desassociar: (produtoId, fornecedorId) => request('DELETE', `/produtos/${produtoId}/fornecedores/${fornecedorId}`),
  },
};
