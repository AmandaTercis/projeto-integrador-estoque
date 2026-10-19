process.env.DB_FILE = ':memory:';
const test = require('node:test');
const assert = require('node:assert');
const app = require('./app');

let base, server;
test.before(() => new Promise((r) => {
  server = app.listen(0, () => { base = `http://localhost:${server.address().port}`; r(); });
}));
test.after(() => server.close());

const call = async (method, path, body) => {
  const res = await fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};
const forn = { nome: 'ACME', cnpj: '11.222.333/0001-81', endereco: 'Rua A, 1', telefone: '(11) 3333-4444', email: 'a@acme.com', contatoPrincipal: 'João' };
const prod = { nome: 'Teclado', codigoBarras: '7891234567895', descricao: 'Teclado USB', quantidade: 5, categoria: 'Eletrônicos' };

test('fornecedor: sucesso, duplicado e inválido', async () => {
  let r = await call('POST', '/fornecedores', forn);
  assert.equal(r.status, 201);
  assert.equal(r.body.mensagem, 'Fornecedor cadastrado com sucesso!');
  r = await call('POST', '/fornecedores', forn);
  assert.equal(r.status, 409);
  assert.equal(r.body.mensagem, 'Fornecedor com esse CNPJ já está cadastrado!');
  r = await call('POST', '/fornecedores', { ...forn, cnpj: '123', nome: '' });
  assert.equal(r.status, 400);
  assert.ok(r.body.erros.cnpj && r.body.erros.nome);
});

test('produto: sucesso, duplicado e inválido', async () => {
  let r = await call('POST', '/produtos', prod);
  assert.equal(r.status, 201);
  assert.equal(r.body.mensagem, 'Produto cadastrado com sucesso!');
  r = await call('POST', '/produtos', prod);
  assert.equal(r.status, 409);
  assert.equal(r.body.mensagem, 'Produto com este código de barras já está cadastrado!');
  r = await call('POST', '/produtos', { ...prod, codigoBarras: '99999999', nome: '', categoria: '' });
  assert.equal(r.status, 400);
  assert.ok(r.body.erros.nome && r.body.erros.categoria);
});

test('associação: associar, duplicar, listar nos dois sentidos e desassociar', async () => {
  const p = (await call('GET', '/produtos')).body[0];
  const f = (await call('GET', '/fornecedores')).body[0];
  let r = await call('POST', `/produtos/${p.id}/fornecedores`, { fornecedorId: f.id });
  assert.equal(r.status, 201);
  assert.equal(r.body.mensagem, 'Fornecedor associado com sucesso ao produto!');
  r = await call('POST', `/produtos/${p.id}/fornecedores`, { fornecedorId: f.id });
  assert.equal(r.status, 409);
  assert.equal(r.body.mensagem, 'Fornecedor já está associado a este produto!');
  assert.equal((await call('GET', `/produtos/${p.id}/fornecedores`)).body.length, 1);
  assert.equal((await call('GET', `/fornecedores/${f.id}/produtos`)).body.length, 1);
  r = await call('DELETE', `/produtos/${p.id}/fornecedores/${f.id}`);
  assert.equal(r.body.mensagem, 'Fornecedor desassociado com sucesso!');
});
