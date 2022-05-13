const express = require('express');
const rotas = express();
const transacoes = require('./controladores/transacoes');
const usuarios = require('./controladores/usuarios');
const validarLogin = require('./middlewares/validacoes');
const categorias = require('./controladores/categorias');



rotas.post('/usuario', usuarios.cadastrarUsuario);
rotas.post('/login', usuarios.login);

rotas.use(validarLogin.verificarLogin);

rotas.get('/usuario', usuarios.detalharUsuario);
rotas.put('/usuario', usuarios.atualizarUsuario);

rotas.get('/categoria', categorias.listarCategorias);

rotas.get('/transacao', transacoes.listarTransacoes);
rotas.get('/transacao/extrato', transacoes.obterExtrato);
rotas.get('/transacao/:id', transacoes.detalharTransacao);
rotas.post('/transacao', transacoes.cadastrarTransacao);
rotas.put('/transacao/:id', transacoes.atualizarTransacao);
rotas.delete('/transacao/:id', transacoes.excluirTransacao);






module.exports = rotas;