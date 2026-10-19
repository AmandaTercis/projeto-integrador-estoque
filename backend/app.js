const express = require('express');
const cors = require('cors');
const produtos = require('./src/produtoController');
const fornecedores = require('./src/fornecedorController');
const assoc = require('./src/associacaoController');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' })); // imagens do produto chegam em base64

app.get('/', (req, res) => res.send('API de Controle de Estoque rodando!'));

app.get('/produtos', produtos.listar);
app.get('/produtos/:id', produtos.obter);
app.post('/produtos', produtos.criar);
app.put('/produtos/:id', produtos.atualizar);
app.delete('/produtos/:id', produtos.remover);

app.get('/fornecedores', fornecedores.listar);
app.get('/fornecedores/:id', fornecedores.obter);
app.post('/fornecedores', fornecedores.criar);
app.put('/fornecedores/:id', fornecedores.atualizar);
app.delete('/fornecedores/:id', fornecedores.remover);

app.get('/produtos/:produtoId/fornecedores', assoc.fornecedoresDoProduto);
app.post('/produtos/:produtoId/fornecedores', assoc.associar);
app.delete('/produtos/:produtoId/fornecedores/:fornecedorId', assoc.desassociar);
app.get('/fornecedores/:fornecedorId/produtos', assoc.produtosDoFornecedor);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    mensagem: err.status === 400 ? 'JSON inválido.' : 'Erro interno do servidor.',
  });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}/`));
}
