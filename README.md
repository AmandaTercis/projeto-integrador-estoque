FACULDADE GRAN (https://faculdade.grancursosonline.com.br/)
Projeto Disciplina Projeto Integrador

# Controle de Estoque (Full Stack)

Sistema com cadastro de **fornecedores**, cadastro de **produtos** e **associação produto/fornecedor** (muitos-para-muitos).

- `backend/`: Node.js + Express + SQLite (módulo nativo `node:sqlite`, requer Node 22.5+; testado no Node 24)
- `frontend/`: React (Vite)

## Como rodar

```bash
# terminal 1 - API em http://localhost:3000
cd backend
npm install
npm start

# terminal 2 - interface em http://localhost:5173
cd frontend
npm install
npm start
```

Testes do backend: `cd backend && npm test`

## Rotas da API (para testar no Insomnia)

| Método | Rota | Descrição |
|---|---|---|
| GET/POST | `/produtos` | listar / cadastrar produto |
| GET/PUT/DELETE | `/produtos/:id` | obter / atualizar / remover |
| GET/POST | `/fornecedores` | listar / cadastrar fornecedor |
| GET/PUT/DELETE | `/fornecedores/:id` | obter / atualizar / remover |
| GET | `/produtos/:id/fornecedores` | fornecedores de um produto |
| POST | `/produtos/:id/fornecedores` | associar (`{ "fornecedorId": 1 }`) |
| DELETE | `/produtos/:id/fornecedores/:fornecedorId` | desassociar |
| GET | `/fornecedores/:id/produtos` | produtos de um fornecedor |

Exemplo de fornecedor: `{"nome":"ACME","cnpj":"11.222.333/0001-81","endereco":"Rua A, 1","telefone":"(11) 3333-4444","email":"a@acme.com","contatoPrincipal":"João"}`

Exemplo de produto: `{"nome":"Teclado","codigoBarras":"7891234567895","descricao":"Teclado USB","quantidade":5,"preco":99.9,"categoria":"Eletrônicos"}`

## Regras das histórias de usuário

- CNPJ validado (dígitos verificadores) e único; duplicado retorna 409 com "Fornecedor com esse CNPJ já está cadastrado!".
- Código de barras único; duplicado retorna 409 com "Produto com este código de barras já está cadastrado!".
- Campos inválidos/obrigatórios vazios retornam 400 com `erros` por campo, exibidos ao lado dos campos no formulário.
- Associar fornecedor repetido retorna 409 com "Fornecedor já está associado a este produto!".
