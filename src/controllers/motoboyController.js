const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../database/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'flippy-secret-key';

const motoboyController = {
    // Registrar novo motoboy
    async register(req, res) {
        try {
            const {
                nome,
                telefone,
                sexo,
                cpf,
                data_nascimento,
                endereco,
                cep,
                cidade,
                estado,
                email,
                senha
            } = req.body;

            // Validações básicas
            if (!nome || !telefone || !cpf || !data_nascimento || !email || !senha) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome, telefone, CPF, data de nascimento, email e senha são obrigatórios'
                });
            }

            const pool = getConnection();

            // Verificar se email já existe
            const [existingMotoboys] = await pool.execute(
                'SELECT id FROM motoboys WHERE email = ?',
                [email]
            );

            if (existingMotoboys.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email já cadastrado'
                });
            }

            // Verificar se CPF já existe
            const [existingCpf] = await pool.execute(
                'SELECT id FROM motoboys WHERE cpf = ?',
                [cpf]
            );

            if (existingCpf.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'CPF já cadastrado'
                });
            }

           
            const hashedPassword = await bcrypt.hash(senha, 10);

            // Inserrt
            const [result] = await pool.execute(
                `INSERT INTO motoboys (
                    nome, telefone, sexo, cpf, data_nascimento,
                    endereco, cep, cidade, estado, email, senha,
                    created_at, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'offline')`,
                [nome, telefone, sexo, cpf, data_nascimento,
                 endereco || null, cep || null, cidade || null, estado || null, 
                 email, hashedPassword]
            );

            console.log('Motoboy registrado com sucesso:', result.insertId);

            res.status(201).json({
                success: true,
                message: 'Motoboy registrado com sucesso.',
                data: {
                    id: result.insertId,
                    nome,
                    email
                }
            });

        } catch (error) {
            console.error(' Erro ao registrar motoboy:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },

    // Login de motoboy
    async login(req, res) {
        try {
            const { email, senha } = req.body;

            if (!email || !senha) {
                return res.status(400).json({
                    success: false,
                    message: 'Email e senha são obrigatórios'
                });
            }

            const pool = getConnection();

            
            const [motoboys] = await pool.execute(
                'SELECT * FROM motoboys WHERE email = ? AND status != "bloqueado"',
                [email]
            );

            if (motoboys.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou senha inválidos'
                });
            }

            const motoboy = motoboys[0];

           
            const isValidPassword = await bcrypt.compare(senha, motoboy.senha);

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou senha inválidos'
                });
            }

           
            const token = jwt.sign(
                { 
                    id: motoboy.id, 
                    email: motoboy.email, 
                    tipo: 'motoboy' 
                },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            console.log('Login de motoboy realizado com sucesso:', motoboy.email);

            res.json({
                success: true,
                message: 'Login realizado com sucesso',
                data: {
                    token,
                    motoboy: {
                        id: motoboy.id,
                        nome: motoboy.nome,
                        email: motoboy.email,
                        telefone: motoboy.telefone,
                        status: motoboy.status
                    }
                }
            });

        } catch (error) {
            console.error(' Erro no login do motoboy:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },

    
    async getProfile(req, res) {
        try {
            const motoboyId = req.user.id;
            const pool = getConnection();

            const [motoboys] = await pool.execute(
                `SELECT id, nome, email, telefone, sexo, cpf, data_nascimento,
                        endereco, cep, cidade, estado, created_at, status,
                        avaliacao_media, total_entregas, total_ganhos
                 FROM motoboys WHERE id = ?`,
                [motoboyId]
            );

            if (motoboys.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Motoboy não encontrado'
                });
            }

            res.json({
                success: true,
                data: motoboys[0]
            });

        } catch (error) {
            console.error(' Erro ao buscar perfil do motoboy:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },

    
    async updateProfile(req, res) {
        try {
            const motoboyId = req.user.id;
            const updateData = req.body;
            const pool = getConnection();

            
            const allowedFields = ['nome', 'telefone', 'endereco', 'cep', 'cidade', 'estado'];
            const fieldsToUpdate = {};

            allowedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    fieldsToUpdate[field] = updateData[field];
                }
            });

            if (Object.keys(fieldsToUpdate).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Nenhum campo válido para atualização'
                });
            }

            const setClause = Object.keys(fieldsToUpdate).map(field => `${field} = ?`).join(', ');
            const values = [...Object.values(fieldsToUpdate), motoboyId];

            await pool.execute(
                `UPDATE motoboys SET ${setClause} WHERE id = ?`,
                values
            );

            console.log(' Perfil do motoboy atualizado com sucesso:', motoboyId);

            res.json({
                success: true,
                message: 'Perfil atualizado com sucesso'
            });

        } catch (error) {
            console.error(' Erro ao atualizar perfil do motoboy:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },

    // Obter motoboys disponíveis
    async getAvailable(req, res) {
        try {
            const pool = getConnection();

            const [motoboys] = await pool.execute(
                `SELECT id, nome, telefone, cidade, estado, status, 
                        (SELECT COUNT(*) FROM pedidos WHERE motoboy_id = motoboys.id AND status = 'em_andamento') as entregas_ativas
                 FROM motoboys 
                 WHERE status = 'online'`
            );

            res.json({
                success: true,
                data: motoboys
            });

        } catch (error) {
            console.error('Erro ao buscar motoboys disponíveis:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
};

module.exports = motoboyController; 