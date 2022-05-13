const conexao = require('../conexao');
const securePassword = require('secure-password');
const pwd = securePassword();
const jwt = require('jsonwebtoken');
const  chaveToken  = require('../controladores/chaveToken');


const listarCategorias = async (req, res) => {
    const token = req.headers.authorization.replace('Bearer', '').trim();
    jwt.verify(token, chaveToken);

    try {
        const { rows, rowCount } = await conexao.query('select * from categorias');

        if (rowCount === 0){
            return res.status(404).json('Não há categorias cadastradas.');
        };
        
        return res.status(200).json(rows);

    } catch (error) {

        return res.status(400).json(error.message);

    };
    
};







module.exports = {
    listarCategorias
};