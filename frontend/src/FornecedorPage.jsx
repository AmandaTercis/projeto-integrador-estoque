import React, { useEffect, useState } from 'react';
import { api } from './api.js';
import { maskCnpj, maskTelefone } from './masks.js';
import Field, { Aviso } from './Field.jsx';

const vazio = { nome: '', cnpj: '', endereco: '', telefone: '', email: '', contatoPrincipal: '' };

function validar(f) {
  const e = {};
  if (!f.nome.trim()) e.nome = 'Nome da empresa é obrigatório.';
  if (f.cnpj.replace(/\D/g, '').length !== 14) e.cnpj = 'Informe um CNPJ completo.';
  if (!f.endereco.trim()) e.endereco = 'Endereço é obrigatório.';
  if (![10, 11].includes(f.telefone.replace(/\D/g, '').length)) e.telefone = 'Informe um telefone válido.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Informe um e-mail válido.';
  if (!f.contatoPrincipal.trim()) e.contatoPrincipal = 'Contato principal é obrigatório.';
  return e;
}

export default function FornecedorPage() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(vazio);
  const [editId, setEditId] = useState(null);
  const [erros, setErros] = useState({});
  const [aviso, setAviso] = useState(null);

  const carregar = () => api.fornecedores.listar().then(setLista).catch((e) => setAviso({ tipo: 'erro', texto: e.mensagem }));
  useEffect(() => { carregar(); }, []);

  const set = (campo, mask) => (ev) =>
    setForm({ ...form, [campo]: mask ? mask(ev.target.value) : ev.target.value });

  async function enviar(ev) {
    ev.preventDefault();
    setAviso(null);
    const e = validar(form);
    setErros(e);
    if (Object.keys(e).length) return;
    try {
      const r = editId ? await api.fornecedores.atualizar(editId, form) : await api.fornecedores.criar(form);
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

  function editar(f) {
    setEditId(f.id); setErros({}); setAviso(null);
    setForm({ ...f, cnpj: maskCnpj(f.cnpj), telefone: maskTelefone(f.telefone) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remover(f) {
    if (!window.confirm(`Remover o fornecedor "${f.nome}"?`)) return;
    try {
      const r = await api.fornecedores.remover(f.id);
      setAviso({ tipo: 'ok', texto: r.mensagem });
      carregar();
    } catch (err) {
      setAviso({ tipo: 'erro', texto: err.mensagem });
    }
  }

  return (
    <section>
      <h2>{editId ? 'Editar Fornecedor' : 'Cadastro de Fornecedor'}</h2>
      <Aviso aviso={aviso} />
      <form className="card form" onSubmit={enviar} noValidate>
        <Field label="Nome da Empresa" required error={erros.nome}>
          <input value={form.nome} onChange={set('nome')} placeholder="Insira o nome da empresa" />
        </Field>
        <Field label="CNPJ" required error={erros.cnpj}>
          <input value={form.cnpj} onChange={set('cnpj', maskCnpj)} placeholder="00.000.000/0000-00" inputMode="numeric" />
        </Field>
        <Field label="Endereço" required error={erros.endereco}>
          <textarea rows={2} value={form.endereco} onChange={set('endereco')} placeholder="Insira o endereço completo da empresa" />
        </Field>
        <Field label="Telefone" required error={erros.telefone}>
          <input value={form.telefone} onChange={set('telefone', maskTelefone)} placeholder="(00) 0000-0000" inputMode="tel" />
        </Field>
        <Field label="E-mail" required error={erros.email}>
          <input type="email" value={form.email} onChange={set('email')} placeholder="exemplo@fornecedor.com" />
        </Field>
        <Field label="Contato Principal" required error={erros.contatoPrincipal}>
          <input value={form.contatoPrincipal} onChange={set('contatoPrincipal')} placeholder="Nome do contato principal" />
        </Field>
        <div className="acoes">
          <button type="submit" className="primario">{editId ? 'Salvar' : 'Cadastrar'}</button>
          {editId && <button type="button" onClick={() => cancelar()}>Cancelar</button>}
        </div>
      </form>

      <h3>Fornecedores cadastrados</h3>
      <div className="card tabela">
        <table>
          <thead><tr><th>Empresa</th><th>CNPJ</th><th>Telefone</th><th>E-mail</th><th>Contato</th><th /></tr></thead>
          <tbody>
            {lista.map((f) => (
              <tr key={f.id}>
                <td>{f.nome}</td><td>{maskCnpj(f.cnpj)}</td><td>{f.telefone}</td><td>{f.email}</td><td>{f.contatoPrincipal}</td>
                <td className="acoes">
                  <button onClick={() => editar(f)}>Editar</button>
                  <button className="perigo" onClick={() => remover(f)}>Excluir</button>
                </td>
              </tr>
            ))}
            {!lista.length && <tr><td colSpan={6} className="vazio">Nenhum fornecedor cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
