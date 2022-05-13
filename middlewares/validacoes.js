const conexao = require('../conexao');
const chaveToken = require('../controladores/chaveToken');
const jwt = require('jsonwebtoken');


const verificarLogin = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json('Para acessar este recurso um token de autenticação válido deve ser enviado.');
    }

    try {
        const token = authorization.replace('Bearer', '').trim();
        const { id } = jwt.verify(token, chaveToken);
        const query = 'select * from usuarios where id = $1';
        const {rowCount, rows} = await conexao.query(query, [id]);

        if (rowCount === 0){
            return res.status(404).json('O usuário não foi encontrado.')
        }

        const { senha: senhaUsuario, ...usuario} = rows[0];

        req.usuario = usuario;
        next();

    } catch (error) {
        return res.status(401).json('Para acessar este recurso um token de autenticação válido deve ser enviado.');
    }

}




module.exports = {
    verificarLogin
};