import React, { useEffect, useState } from 'react';
import { api } from './api.js';
import { maskCnpj } from './masks.js';
import Field, { Aviso } from './Field.jsx';

export default function AssociacaoPage() {
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [produtoId, setProdutoId] = useState('');
  const [fornecedorId, setFornecedorId] = useState('');
  const [associados, setAssociados] = useState([]);
  const [aviso, setAviso] = useState(null);

  const [consultaId, setConsultaId] = useState('');
  const [produtosDoFornecedor, setProdutosDoFornecedor] = useState([]);

  useEffect(() => {
    Promise.all([api.produtos.listar(), api.fornecedores.listar()])
      .then(([p, f]) => { setProdutos(p); setFornecedores(f); })
      .catch((e) => setAviso({ tipo: 'erro', texto: e.mensagem }));
  }, []);

  const produto = produtos.find((p) => String(p.id) === produtoId);

  const carregarAssociados = (id) =>
    id ? api.associacao.doProduto(id).then(setAssociados).catch((e) => setAviso({ tipo: 'erro', texto: e.mensagem })) : setAssociados([]);

  useEffect(() => { carregarAssociados(produtoId); setFornecedorId(''); }, [produtoId]);

  useEffect(() => {
    if (!consultaId) { setProdutosDoFornecedor([]); return; }
    api.associacao.doFornecedor(consultaId).then(setProdutosDoFornecedor).catch(() => setProdutosDoFornecedor([]));
  }, [consultaId, associados]);

  async function associar() {
    setAviso(null);
    if (!fornecedorId) return setAviso({ tipo: 'erro', texto: 'Selecione um fornecedor.' });
    try {
      const r = await api.associacao.associar(produtoId, fornecedorId);
      setAviso({ tipo: 'ok', texto: r.mensagem });
      setFornecedorId('');
      carregarAssociados(produtoId);
    } catch (err) {
      setAviso({ tipo: 'erro', texto: err.mensagem });
    }
  }

  async function desassociar(f) {
    setAviso(null);
    try {
      const r = await api.associacao.desassociar(produtoId, f.id);
      setAviso({ tipo: 'ok', texto: r.mensagem });
      carregarAssociados(produtoId);
    } catch (err) {
      setAviso({ tipo: 'erro', texto: err.mensagem });
    }
  }

  return (
    <section>
      <h2>Associação de Fornecedor a Produto</h2>
      <Aviso aviso={aviso} />

      <div className="card form">
        <Field label="Produto">
          <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
            <option value="">Selecione um produto</option>
            {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </Field>

        {produto && (
          <>
            <div className="detalhes">
              {produto.imagem && <img className="miniatura grande" src={produto.imagem} alt="" />}
              <div>
                <Field label="Nome do Produto"><input readOnly value={produto.nome} /></Field>
                <Field label="Código de Barras"><input readOnly value={produto.codigoBarras ?? ''} /></Field>
                <Field label="Descrição"><textarea readOnly rows={2} value={produto.descricao} /></Field>
              </div>
            </div>

            <h3>Associar fornecedor</h3>
            <Field label="Seleção de Fornecedor">
              <select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)}>
                <option value="">Selecione um fornecedor</option>
                {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome} — {maskCnpj(f.cnpj)}</option>)}
              </select>
            </Field>
            <div className="acoes"><button className="primario" onClick={associar}>Associar Fornecedor</button></div>

            <h3>Fornecedores associados</h3>
            <table>
              <thead><tr><th>Nome do Fornecedor</th><th>CNPJ</th><th /></tr></thead>
              <tbody>
                {associados.map((f) => (
                  <tr key={f.id}>
                    <td>{f.nome}</td><td>{maskCnpj(f.cnpj)}</td>
                    <td className="acoes"><button className="perigo" onClick={() => desassociar(f)}>Desassociar</button></td>
                  </tr>
                ))}
                {!associados.length && <tr><td colSpan={3} className="vazio">Nenhum fornecedor associado.</td></tr>}
              </tbody>
            </table>
          </>
        )}
      </div>

      <h3>Consultar produtos por fornecedor</h3>
      <div className="card form">
        <Field label="Fornecedor">
          <select value={consultaId} onChange={(e) => setConsultaId(e.target.value)}>
            <option value="">Selecione um fornecedor</option>
            {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
        </Field>
        {consultaId && (
          <table>
            <thead><tr><th>Produto</th><th>Código de Barras</th></tr></thead>
            <tbody>
              {produtosDoFornecedor.map((p) => <tr key={p.id}><td>{p.nome}</td><td>{p.codigoBarras}</td></tr>)}
              {!produtosDoFornecedor.length && <tr><td colSpan={2} className="vazio">Este fornecedor não possui produtos associados.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
