const db = require('./db');
const { validarProduto, vazio } = require('./validators');

const paraApi = (r) => r && ({
  id: r.id, nome: r.nome, codigoBarras: r.codigo_barras, descricao: r.descricao,
  quantidade: r.quantidade, preco: r.preco, categoria: r.categoria,
  dataValidade: r.data_validade, imagem: r.imagem,
});

const MSG_DUP = 'Produto com este código de barras já está cadastrado!';

const codigoExiste = (codigo, ignorarId = -1) =>
  codigo && db.prepare('SELECT id FROM produtos WHERE codigo_barras = ? AND id <> ?').get(codigo, ignorarId);

function valores(b) {
  return [
    b.nome.trim(),
    vazio(b.codigoBarras) ? null : String(b.codigoBarras).trim(),
    b.descricao.trim(),
    vazio(b.quantidade) ? 0 : Number(b.quantidade),
    vazio(b.preco) ? null : Number(b.preco),
    b.categoria.trim(),
    vazio(b.dataValidade) ? null : b.dataValidade,
    vazio(b.imagem) ? null : b.imagem,
  ];
}

exports.listar = (req, res) => {
  res.json(db.prepare('SELECT * FROM produtos ORDER BY nome').all().map(paraApi));
};

exports.obter = (req, res) => {
  const p = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ mensagem: 'Produto não encontrado.' });
  res.json(paraApi(p));
};

exports.criar = (req, res) => {
  const b = req.body || {};
  const erros = validarProduto(b);
  if (Object.keys(erros).length) return res.status(400).json({ mensagem: 'Dados inválidos.', erros });
  const v = valores(b);
  if (codigoExiste(v[1])) return res.status(409).json({ mensagem: MSG_DUP, erros: { codigoBarras: MSG_DUP } });
  const r = db.prepare(
    'INSERT INTO produtos (nome, codigo_barras, descricao, quantidade, preco, categoria, data_validade, imagem) VALUES (?,?,?,?,?,?,?,?)'
  ).run(...v);
  const novo = db.prepare('SELECT * FROM produtos WHERE id = ?').get(r.lastInsertRowid);
  res.status(201).json({ mensagem: 'Produto cadastrado com sucesso!', produto: paraApi(novo) });
};

exports.atualizar = (req, res) => {
  const id = Number(req.params.id);
  if (!db.prepare('SELECT id FROM produtos WHERE id = ?').get(id))
    return res.status(404).json({ mensagem: 'Produto não encontrado.' });
  const b = req.body || {};
  const erros = validarProduto(b);
  if (Object.keys(erros).length) return res.status(400).json({ mensagem: 'Dados inválidos.', erros });
  const v = valores(b);
  if (codigoExiste(v[1], id)) return res.status(409).json({ mensagem: MSG_DUP, erros: { codigoBarras: MSG_DUP } });
  db.prepare(
    'UPDATE produtos SET nome=?, codigo_barras=?, descricao=?, quantidade=?, preco=?, categoria=?, data_validade=?, imagem=? WHERE id=?'
  ).run(...v, id);
  const atual = db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);
  res.json({ mensagem: 'Produto atualizado com sucesso!', produto: paraApi(atual) });
};

exports.remover = (req, res) => {
  const r = db.prepare('DELETE FROM produtos WHERE id = ?').run(req.params.id);
  if (!r.changes) return res.status(404).json({ mensagem: 'Produto não encontrado.' });
  res.json({ mensagem: 'Produto removido com sucesso!' });
};
