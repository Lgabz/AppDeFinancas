const conexao = require('../conexao');
const securePassword = require('secure-password');
const pwd = securePassword();
const jwt = require('jsonwebtoken');
const  chaveToken  = require('../controladores/chaveToken');



const listarTransacoes = async (req, res) => {
    const token = req.headers.authorization.replace('Bearer', '').trim();
    const { id } = jwt.verify(token, chaveToken);

    try {
        const query = 'select * from transacoes where usuario_id = $1';
        const {rowCount, rows} = await conexao.query(query, [id]);

        return res.status(200).json(rows);

    } catch (error) {
        return res.status(400).json(error.message);
    }

};

const detalharTransacao = async (req, res) => { 
    const token = req.headers.authorization.replace('Bearer', '').trim();
    const { id } = jwt.verify(token, chaveToken);
    const { id:idTransacao } = req.params;    

    try {
        
        const query = 'select * from transacoes where id = $1 and usuario_id = $2'; 
        const categoria = await conexao.query('select categorias.descricao from categorias, transacoes where transacoes.id = $1 and usuario_id = $2 and categoria_id = categorias.id',[idTransacao, id]) 
        const {rows, rowCount} = await conexao.query(query, [idTransacao, id]);
    
        if(rowCount === 0){
            return res.status(404).json('Transação não encontrada.');
        }
        const { rows:linha } = categoria;
        const {descricao:categoria_nome} = linha[0]
        
        const {
            id:idCadastro,
            descricao:descricaoCadastro,
            valor,
            data,
            categoria_id,
            usuario_id,
            tipo} = rows[0];
        
        return res.status(200).json({
            id: idCadastro,
            tipo: tipo,
            descricao: descricaoCadastro,
            valor: valor,
            data: data,
            usuario_id: usuario_id,
            categoria_id: categoria_id,
            categoria_nome: categoria_nome
        });

    } catch (error) {
        return res.status(400).json(error.message);
    }
};

const cadastrarTransacao = async (req, res) => {
    const token = req.headers.authorization.replace('Bearer', '').trim();
    const { id } = jwt.verify(token, chaveToken);
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    if (!descricao || !valor || !data || !categoria_id || !tipo){
        return res.status(400).json('Todos os campos obrigatórios devem ser informados');
    }

    try {
        const query = 'select * from categorias where id = $1';
        const {rowCount} = await conexao.query(query, [categoria_id]);
        
        if(rowCount === 0){
            return res.status(404).json('Não há categoria cadastrada neste ID.')
        }
        
    } catch (error) {
        return res.status(400).json(error.message);
    }
    
    if (tipo !== 'entrada' && tipo !== 'saida'){
        return res.status(400).json('Formato do campo tipo é inválido.')
    };
   
    try { 
        
        const query = 'insert into transacoes (descricao, valor, data, categoria_id, usuario_id, tipo) values ($1, $2, $3, $4, $5, $6)';
        const transacao = await conexao.query(query, [descricao, valor, data, categoria_id, id, tipo]);
        const categoria = await conexao.query('select categorias.descricao from categorias, transacoes where usuario_id = $1 and categoria_id = categorias.id',[id])
        const {rows} = await conexao.query('select * from transacoes where usuario_id = $1 order by id asc',[id])
  
        if(transacao.rowCount === 0) {
            return res.status(400).json('Não foi possível cadastrar esta transação.')
        }
        

        const { rows:linha } = categoria;
        const {descricao:categoria_nome} = linha[linha.length-1];
        
        const {
            id:idTransacao,
            descricao:descricaoCadastro,
           } = rows[rows.length-1];

        return res.status(200).json({
            id: idTransacao,
            tipo: tipo,
            descricao: descricaoCadastro,
            valor: valor,
            data: data,
            usuario_id: id,
            categoria_id: categoria_id,
            categoria_nome: categoria_nome
        });

    } catch (error) {
        return res.status(400).json(error.message);
    }

};

const atualizarTransacao = async (req, res) => {
    const token = req.headers.authorization.replace('Bearer', '').trim();
    const { id } = jwt.verify(token, chaveToken);
    const {id:idTransacao} = req.params;
    const {descricao, valor, data, categoria_id, tipo} = req.body;

    if(!descricao || !valor || !data || !categoria_id || !tipo){
        return res.status(400).json('Todos os campos obrigatórios devem ser informados.');
    };    

    try {
        const query = 'select * from transacoes where id = $1 and usuario_id = $2';
        const {rowCount} = await conexao.query(query, [idTransacao, id]);

        if(rowCount === 0){
            return res.status(404).json('Não há transações cadastradas com este ID.')
        }
    } catch (error) {
        return res.status(400).json(error.message);
    }

    try {
        const query = 'select * from categorias where id = $1';
        const {rowCount} = await conexao.query(query, [categoria_id]);

        if(rowCount === 0){
            return res.status(404).json('Não há categoria cadastrada com esse ID')
        }
    } catch (error) {
        return res.status(400).json(error.message);
    }

    if (tipo !== 'entrada' && tipo !== 'saida'){
        return res.status(400).json('Formato do campo tipo é inválido.')
    };

    try {
        const query = 'update transacoes set descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5 where usuario_id = $6 and id = $7';
        const { rowCount } = await conexao.query(query, [descricao, valor, data, categoria_id, tipo, id, idTransacao]);

        if(rowCount === 0){
            return res.status(400).json('Não foi possível atualizar a transação');
        }

        return res.status(204).json();
    } catch (error) {
        return res.status(400).json(error.message);
    };

};

const excluirTransacao = async (req, res) => {
    const token = req.headers.authorization.replace('Bearer', '').trim();
    const { id } = jwt.verify(token, chaveToken);
    const { id:idTransacao } = req.params;

    try {
        const query = 'select * from transacoes where id = $1 and usuario_id = $2';
        const {rowCount} = await conexao.query(query, [idTransacao, id]);

        if(rowCount === 0){
            return res.status(404).json('Transação não encontrada.');
        }
    } catch (error) {
        return res.status(400).json(error.message);
    };

    try {
        const query = await conexao.query('delete from transacoes where id = $1 and usuario_id = $2',[idTransacao, id]);
        
        query;

        return res.status(204).json();

    } catch (error) {
        return res.status(400).json(error.message);
    };

};

const obterExtrato = async (req, res) => {
    const token = req.headers.authorization.replace('Bearer', '').trim();
    const { id } = jwt.verify(token, chaveToken);

    try {
        const query = 'select * from transacoes where usuario_id = $1';
        const {rowCount} = await conexao.query(query, [id]);
        if (rowCount === 0){
            return res.status(404).json('Não há transações cadastradas com esse ID.');
        }
    } catch (error) {
        return res.status(400).json(error.message);
    };

    try {
        const query = 'select transacoes.tipo, sum(transacoes.valor) from transacoes group by transacoes.tipo, transacoes.usuario_id  having transacoes.usuario_id = $1';
        const {rows, rowCount} = await conexao.query(query,[id]);
        
        if(rowCount === 1 && rows[0].tipo === "entrada"){
            
            rows.unshift({tipo: "saida", sum: 0});   
        }
        if(rowCount === 1 && rows[0].tipo === "saida"){
            
            rows.push({tipo: "entrada", sum: 0});   
        }
    
        return res.status(200).json({
            'entrada': rows[0].sum,
            'saida': rows[1].sum
        })

    } catch (error) {
        return res.status(400).json(error.message);
    }

};


module.exports = {
    listarTransacoes, 
    detalharTransacao,
    cadastrarTransacao,
    atualizarTransacao,
    excluirTransacao,
    obterExtrato
};