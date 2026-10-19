const db = require('./db');
const { validarFornecedor, soDigitos } = require('./validators');

const paraApi = (r) => r && ({
  id: r.id, nome: r.nome, cnpj: r.cnpj, endereco: r.endereco,
  telefone: r.telefone, email: r.email, contatoPrincipal: r.contato_principal,
});

const MSG_DUP = 'Fornecedor com esse CNPJ já está cadastrado!';

const cnpjExiste = (cnpj, ignorarId = -1) =>
  db.prepare('SELECT id FROM fornecedores WHERE cnpj = ? AND id <> ?').get(cnpj, ignorarId);

exports.listar = (req, res) => {
  res.json(db.prepare('SELECT * FROM fornecedores ORDER BY nome').all().map(paraApi));
};

exports.obter = (req, res) => {
  const f = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(req.params.id);
  if (!f) return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
  res.json(paraApi(f));
};

exports.criar = (req, res) => {
  const b = req.body || {};
  const erros = validarFornecedor(b);
  if (Object.keys(erros).length) return res.status(400).json({ mensagem: 'Dados inválidos.', erros });
  const cnpj = soDigitos(b.cnpj);
  if (cnpjExiste(cnpj)) return res.status(409).json({ mensagem: MSG_DUP, erros: { cnpj: MSG_DUP } });
  const r = db.prepare(
    'INSERT INTO fornecedores (nome, cnpj, endereco, telefone, email, contato_principal) VALUES (?,?,?,?,?,?)'
  ).run(b.nome.trim(), cnpj, b.endereco.trim(), b.telefone.trim(), b.email.trim(), b.contatoPrincipal.trim());
  const novo = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(r.lastInsertRowid);
  res.status(201).json({ mensagem: 'Fornecedor cadastrado com sucesso!', fornecedor: paraApi(novo) });
};

exports.atualizar = (req, res) => {
  const id = Number(req.params.id);
  if (!db.prepare('SELECT id FROM fornecedores WHERE id = ?').get(id))
    return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
  const b = req.body || {};
  const erros = validarFornecedor(b);
  if (Object.keys(erros).length) return res.status(400).json({ mensagem: 'Dados inválidos.', erros });
  const cnpj = soDigitos(b.cnpj);
  if (cnpjExiste(cnpj, id)) return res.status(409).json({ mensagem: MSG_DUP, erros: { cnpj: MSG_DUP } });
  db.prepare(
    'UPDATE fornecedores SET nome=?, cnpj=?, endereco=?, telefone=?, email=?, contato_principal=? WHERE id=?'
  ).run(b.nome.trim(), cnpj, b.endereco.trim(), b.telefone.trim(), b.email.trim(), b.contatoPrincipal.trim(), id);
  const atual = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(id);
  res.json({ mensagem: 'Fornecedor atualizado com sucesso!', fornecedor: paraApi(atual) });
};

exports.remover = (req, res) => {
  const r = db.prepare('DELETE FROM fornecedores WHERE id = ?').run(req.params.id);
  if (!r.changes) return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
  res.json({ mensagem: 'Fornecedor removido com sucesso!' });
};
