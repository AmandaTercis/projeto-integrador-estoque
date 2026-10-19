const db = require('./db');

const fornecedorApi = (r) => ({ id: r.id, nome: r.nome, cnpj: r.cnpj });
const produtoApi = (r) => ({ id: r.id, nome: r.nome, codigoBarras: r.codigo_barras });

const produtoExiste = (id) => db.prepare('SELECT id FROM produtos WHERE id = ?').get(id);
const fornecedorExiste = (id) => db.prepare('SELECT id FROM fornecedores WHERE id = ?').get(id);

exports.fornecedoresDoProduto = (req, res) => {
  if (!produtoExiste(req.params.produtoId)) return res.status(404).json({ mensagem: 'Produto não encontrado.' });
  const rows = db.prepare(
    `SELECT f.* FROM fornecedores f JOIN produto_fornecedor pf ON pf.fornecedor_id = f.id
     WHERE pf.produto_id = ? ORDER BY f.nome`
  ).all(req.params.produtoId);
  res.json(rows.map(fornecedorApi));
};

exports.produtosDoFornecedor = (req, res) => {
  if (!fornecedorExiste(req.params.fornecedorId)) return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
  const rows = db.prepare(
    `SELECT p.* FROM produtos p JOIN produto_fornecedor pf ON pf.produto_id = p.id
     WHERE pf.fornecedor_id = ? ORDER BY p.nome`
  ).all(req.params.fornecedorId);
  res.json(rows.map(produtoApi));
};

exports.associar = (req, res) => {
  const { produtoId } = req.params;
  const { fornecedorId } = req.body || {};
  if (!produtoExiste(produtoId)) return res.status(404).json({ mensagem: 'Produto não encontrado.' });
  if (!fornecedorId || !fornecedorExiste(fornecedorId))
    return res.status(400).json({ mensagem: 'Selecione um fornecedor válido.' });
  const ja = db.prepare('SELECT 1 FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?').get(produtoId, fornecedorId);
  if (ja) return res.status(409).json({ mensagem: 'Fornecedor já está associado a este produto!' });
  db.prepare('INSERT INTO produto_fornecedor (produto_id, fornecedor_id) VALUES (?, ?)').run(produtoId, fornecedorId);
  res.status(201).json({ mensagem: 'Fornecedor associado com sucesso ao produto!' });
};

exports.desassociar = (req, res) => {
  const { produtoId, fornecedorId } = req.params;
  const r = db.prepare('DELETE FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?').run(produtoId, fornecedorId);
  if (!r.changes) return res.status(404).json({ mensagem: 'Associação não encontrada.' });
  res.json({ mensagem: 'Fornecedor desassociado com sucesso!' });
};
