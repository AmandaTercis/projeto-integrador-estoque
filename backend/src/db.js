const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const file = process.env.DB_FILE || path.join(__dirname, '..', 'estoque.db');
const db = new DatabaseSync(file);

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS fornecedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cnpj TEXT NOT NULL UNIQUE,
    endereco TEXT NOT NULL,
    telefone TEXT NOT NULL,
    email TEXT NOT NULL,
    contato_principal TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    codigo_barras TEXT UNIQUE,
    descricao TEXT NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 0,
    preco REAL,
    categoria TEXT NOT NULL,
    data_validade TEXT,
    imagem TEXT
  );

  CREATE TABLE IF NOT EXISTS produto_fornecedor (
    produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    fornecedor_id INTEGER NOT NULL REFERENCES fornecedores(id) ON DELETE CASCADE,
    PRIMARY KEY (produto_id, fornecedor_id)
  );
`);

module.exports = db;
