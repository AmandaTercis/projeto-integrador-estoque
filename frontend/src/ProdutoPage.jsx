import React, { useEffect, useState } from 'react';
import { api } from './api.js';
import Field, { Aviso } from './Field.jsx';

const CATEGORIAS = ['Eletrônicos', 'Alimentos', 'Vestuário', 'Limpeza', 'Papelaria', 'Outro'];
const vazio = {
  nome: '', codigoBarras: '', descricao: '', quantidade: '', preco: '',
  categoria: '', categoriaOutro: '', dataValidade: '', imagem: '',
};

function validar(f) {
  const e = {};
  if (!f.nome.trim()) e.nome = 'Nome do produto é obrigatório.';
  if (f.codigoBarras && !/^\d{8,14}$/.test(f.codigoBarras)) e.codigoBarras = 'Use de 8 a 14 dígitos numéricos.';
  if (!f.descricao.trim()) e.descricao = 'Descrição é obrigatória.';
  if (f.quantidade !== '' && !/^\d+$/.test(String(f.quantidade))) e.quantidade = 'Informe um número inteiro não negativo.';
  if (f.preco !== '' && (isNaN(Number(f.preco)) || Number(f.preco) < 0)) e.preco = 'Informe um preço válido.';
  if (!f.categoria) e.categoria = 'Categoria é obrigatória.';
  else if (f.categoria === 'Outro' && !f.categoriaOutro.trim()) e.categoria = 'Especifique a categoria.';
  return e;
}

export default function ProdutoPage() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(vazio);
  const [editId, setEditId] = useState(null);
  const [erros, setErros] = useState({});
  const [aviso, setAviso] = useState(null);

  const carregar = () => api.produtos.listar().then(setLista).catch((e) => setAviso({ tipo: 'erro', texto: e.mensagem }));
  useEffect(() => { carregar(); }, []);

  const set = (campo) => (ev) => setForm({ ...form, [campo]: ev.target.value });

  function lerImagem(ev) {
    const arq = ev.target.files[0];
    if (!arq) return;
    if (!arq.type.startsWith('image/') || arq.size > 2 * 1024 * 1024) {
      setErros({ ...erros, imagem: 'Envie uma imagem de até 2 MB.' });
      ev.target.value = '';
      return;
    }
    const leitor = new FileReader();
    leitor.onload = () => { setForm((f) => ({ ...f, imagem: leitor.result })); setErros((e) => ({ ...e, imagem: undefined })); };
    leitor.readAsDataURL(arq);
  }

  function payload() {
    const categoria = form.categoria === 'Outro' ? form.categoriaOutro.trim() : form.categoria;
    const { categoriaOutro, ...resto } = form;
    return { ...resto, categoria };
  }

  async function enviar(ev) {
    ev.preventDefault();
    setAviso(null);
    const e = validar(form);
    setErros(e);
    if (Object.keys(e).length) return;
    try {
      const r = editId ? await api.produtos.atualizar(editId, payload()) : await api.produtos.criar(payload());
      setAviso({ tipo: 'ok', texto: r.mensagem });
      cancelar(false);
      carregar();
    } catch (err) {
      setErros(err.erros || {});
      setAviso({ tipo: 'erro', texto: err.mensagem });
    }
  }

  function cancelar(limparAviso = true) {
    setForm(vazio); setEditId(null); setErros({});
    if (limparAviso) setAviso(null);
  }

  function editar(p) {
    const conhecida = CATEGORIAS.includes(p.categoria);
    setEditId(p.id); setErros({}); setAviso(null);
    setForm({
      nome: p.nome, codigoBarras: p.codigoBarras ?? '', descricao: p.descricao,
      quantidade: p.quantidade ?? '', preco: p.preco ?? '',
      categoria: conhecida ? p.categoria : 'Outro', categoriaOutro: conhecida ? '' : p.categoria,
      dataValidade: p.dataValidade ?? '', imagem: p.imagem ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remover(p) {
    if (!window.confirm(`Remover o produto "${p.nome}"?`)) return;
    try {
      const r = await api.produtos.remover(p.id);
      setAviso({ tipo: 'ok', texto: r.mensagem });
      carregar();
    } catch (err) {
      setAviso({ tipo: 'erro', texto: err.mensagem });
    }
  }

  return (
    <section>
      <h2>{editId ? 'Editar Produto' : 'Cadastro de Produto'}</h2>
      <Aviso aviso={aviso} />
      <form className="card form" onSubmit={enviar} noValidate>
        <Field label="Nome do Produto" required error={erros.nome}>
          <input value={form.nome} onChange={set('nome')} placeholder="Insira o nome do produto" />
        </Field>
        <Field label="Código de Barras" error={erros.codigoBarras}>
          <input value={form.codigoBarras} onChange={(e) => setForm({ ...form, codigoBarras: e.target.value.replace(/\D/g, '') })}
            placeholder="Insira o código de barras" inputMode="numeric" />
        </Field>
        <Field label="Descrição" required error={erros.descricao}>
          <textarea rows={3} value={form.descricao} onChange={set('descricao')} placeholder="Descreva brevemente o produto" />
        </Field>
        <Field label="Quantidade em Estoque" error={erros.quantidade}>
          <input value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value.replace(/\D/g, '') })}
            placeholder="Quantidade disponível" inputMode="numeric" />
        </Field>
        <Field label="Preço (R$)" error={erros.preco}>
          <input type="number" min="0" step="0.01" value={form.preco} onChange={set('preco')} placeholder="0,00" />
        </Field>
        <Field label="Categoria" required error={erros.categoria}>
          <select value={form.categoria} onChange={set('categoria')}>
            <option value="">Selecione uma categoria</option>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        {form.categoria === 'Outro' && (
          <Field label="Especifique a categoria" required>
            <input value={form.categoriaOutro} onChange={set('categoriaOutro')} placeholder="Nome da categoria" />
          </Field>
        )}
        <Field label="Data de Validade (se aplicável)" error={erros.dataValidade}>
          <input type="date" value={form.dataValidade} onChange={set('dataValidade')} title="Selecione a data de validade" />
        </Field>
        <Field label="Imagem do Produto (se aplicável)" error={erros.imagem}>
          <input type="file" accept="image/*" onChange={lerImagem} />
          {form.imagem && <img className="miniatura" src={form.imagem} alt="Pré-visualização" />}
        </Field>
        <div className="acoes">
          <button type="submit" className="primario">{editId ? 'Salvar' : 'Cadastrar'}</button>
          {editId && <button type="button" onClick={() => cancelar()}>Cancelar</button>}
        </div>
      </form>

      <h3>Produtos cadastrados</h3>
      <div className="card tabela">
        <table>
          <thead><tr><th /><th>Produto</th><th>Código</th><th>Categoria</th><th>Estoque</th><th>Preço</th><th>Validade</th><th /></tr></thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.id}>
                <td>{p.imagem && <img className="miniatura" src={p.imagem} alt="" />}</td>
                <td>{p.nome}<br /><small>{p.descricao}</small></td>
                <td>{p.codigoBarras}</td><td>{p.categoria}</td><td>{p.quantidade}</td>
                <td>{p.preco != null ? p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}</td>
                <td>{p.dataValidade ? new Date(p.dataValidade + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                <td className="acoes">
                  <button onClick={() => editar(p)}>Editar</button>
                  <button className="perigo" onClick={() => remover(p)}>Excluir</button>
                </td>
              </tr>
            ))}
            {!lista.length && <tr><td colSpan={8} className="vazio">Nenhum produto cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
