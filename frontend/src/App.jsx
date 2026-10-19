import React, { useState } from 'react';
import ProdutoPage from './ProdutoPage.jsx';
import FornecedorPage from './FornecedorPage.jsx';
import AssociacaoPage from './AssociacaoPage.jsx';

const ABAS = [
  { id: 'produtos', titulo: 'Produtos', Pagina: ProdutoPage },
  { id: 'fornecedores', titulo: 'Fornecedores', Pagina: FornecedorPage },
  { id: 'associacao', titulo: 'Associação', Pagina: AssociacaoPage },
];

export default function App() {
  const [aba, setAba] = useState('produtos');
  const { Pagina } = ABAS.find((a) => a.id === aba);

  return (
    <>
      <header className="topo">
        <h1>📦 Controle de Estoque</h1>
        <nav>
          {ABAS.map((a) => (
            <button key={a.id} className={a.id === aba ? 'ativa' : ''} onClick={() => setAba(a.id)}>
              {a.titulo}
            </button>
          ))}
        </nav>
      </header>
      <main>
        <Pagina key={aba} />
      </main>
    </>
  );
}
