const conexao = require('../conexao');
const securePassword = require('secure-password');
const pwd = securePassword();
const jwt = require('jsonwebtoken');
const  chaveToken  = require('../controladores/chaveToken');


const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    if(!nome){
        return res.status(400).json('Campo nome é obrigatório.')
    }
    if(!email){
        return res.status(400).json('Campo e-mail é obrigatório.')
    }
    if(!senha){
        return res.status(400).json('Campo senha é obrigatório.')
    }

    try {
        const emailCadastrado = await conexao.query("select * from usuarios where email = $1", [email])

        if (emailCadastrado.rowCount > 0){
            return res.status(400).json('Já existe um usuário cadastrado com o e-mail informado.');
        }
    } catch (error) {
        return res.status(400).json(error.message);
    }

    try {
        const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
        const cadastroUsuario = await conexao.query('insert into usuarios (nome, email, senha) values ($1, $2, $3)', [nome, email, hash]);
        const usuario =  await conexao.query('select id, nome, email from usuarios where nome = $1 and email = $2',[nome, email]);

        if (cadastroUsuario.rowCount === 0){
            return res.status(400).json('Não foi possível cadastrar o usuário.');
        }
        
        return res.status(200).json(usuario.rows[0]);

        } catch (error) {
            return res.status(400).json(error.message)
    }
};

const login = async (req, res) => {
    const { email, senha } = req.body;

    if(!email){
        return res.status(400).json('Campo e-mail é obrigatório.')
    }
    if(!senha){
        return res.status(400).json('Campo senha é obrigatório.')
    }

    try{  
        const usuario = await conexao.query('select * from usuarios where email = $1',[email]);
        const usuarioEncontrado = usuario.rows[0];
        if (usuario.rowCount === 0){
            return res.status(400).json('Usuário e/ou senha inválido(s)');
    }
    
    const result = await pwd.verify(Buffer.from(senha), Buffer.from(usuarioEncontrado.senha, 'hex'));
        
    switch (result) {
        case securePassword.INVALID_UNRECOGNIZED_HASH:
        case securePassword.INVALID:
            return res.status(400).json('Usuário e/ou senha inválido(s)');
        case securePassword.VALID:
            break;
        case securePassword.VALID_NEEDS_REHASH:
        try {
                const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
                const atualizarSenha = await conexao.query('update usuarios set senha = $1 where email = $2', [hash, email]);
        } catch {
        }
        break;
        }

        const token = jwt.sign({
            id: usuarioEncontrado.id,
        }, chaveToken, {expiresIn: '10h'});


        const { senha: senhaUsuarios, ...dadosUsuario } = usuarioEncontrado;
        return res.status(200).json({
        usuario: dadosUsuario, 
        token
    });
        } catch (error) {
            return res.status(400).json(error.message);
    }
};

const detalharUsuario = async (req, res) => {
    
    const token = req.headers.authorization.replace('Bearer', '').trim();
    const { id } = jwt.verify(token, chaveToken);

   try {
       const query = 'select * from usuarios where id = $1';
       const {rows} = await conexao.query(query, [id]);

       const {senha, ...usuarioEncontrado} = rows[0]
       return res.status(200).json(usuarioEncontrado);

   } catch (error) {
       return res.status(400).json(error.message);
   }
};

const atualizarUsuario = async (req, res) => {
    const token = req.headers.authorization.replace('Bearer', '').trim();
    const { id } = jwt.verify(token, chaveToken);

    const { nome, email, senha } = req.body;

    if(!nome){
        return res.status(400).json('Campo nome é obrigatório.')
    }
    if(!email){
        return res.status(400).json('Campo e-mail é obrigatório.')
    }
    if(!senha){
        return res.status(400).json('Campo senha é obrigatório.')
    }

    try {
        const query = 'select * from usuarios where email = $1';
        const usuarioEncontrado = await conexao.query(query, [email]);

        if (usuarioEncontrado.rowCount > 0){
            return res.status(400).json('O e-mail informado já está sendo utilizado por outro usuário.')
        }
    } catch (error) {
        return res.status(400).json(error.message);
    }

        try {
            const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
            const queryAtualizacao = 'update usuarios set nome = $1, email = $2, senha = $3 where id = $4';
            const dadosAtualizados = await conexao.query(queryAtualizacao, [nome, email, hash, id]);
    
            return res.status(204).json();
        } catch (error) {
            return res.status(400).json(error.message);
        }

};
    



module.exports = {
    cadastrarUsuario,
    login,
    detalharUsuario,
    atualizarUsuario
};