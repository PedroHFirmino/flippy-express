const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../database/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'flippy-secret-key';

const userController = {
    // Registrar novo usuário
    async register(req, res) {
        try {
            const {
                nome,
                telefone,
                sexo,
                cpf_cnpj,
                endereco,
                cep,
                cidade,
                estado,
                email,
                senha
            } = req.body;

            // Validações 
            if (!nome || !telefone || !email || !senha) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome, telefone, email e senha são obrigatórios'
                });
            }

            const pool = getConnection();

            // Verificar se email já existe
            const [existingUsers] = await pool.execute(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (existingUsers.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email já cadastrado'
                });
            }

            
            const hashedPassword = await bcrypt.hash(senha, 10);

            // Insert
            const [result] = await pool.execute(
                `INSERT INTO users (
                    nome, telefone, sexo, cpf_cnpj, endereco, 
                    cep, cidade, estado, email, senha, 
                    created_at, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'ativo')`,
                [nome, telefone, sexo || null, cpf_cnpj || null, endereco || null,
                 cep || null, cidade || null, estado || null, email, hashedPassword]
            );

            console.log('Usuário registrado com sucesso:', result.insertId);

            res.status(201).json({
                success: true,
                message: 'Usuário registrado com sucesso',
                data: {
                    id: result.insertId,
                    nome,
                    email
                }
            });

        } catch (error) {
            console.error(' Erro ao registrar usuário:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },

    // Login 
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

          
            const [users] = await pool.execute(
                'SELECT * FROM users WHERE email = ? AND status = "ativo"',
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou senha inválidos'
                });
            }

            const user = users[0];

            
            const isValidPassword = await bcrypt.compare(senha, user.senha);

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou senha inválidos'
                });
            }

          
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email, 
                    tipo: 'usuario' 
                },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            console.log('Login realizado com sucesso:', user.email);

            res.json({
                success: true,
                message: 'Login realizado com sucesso',
                data: {
                    token,
                    user: {
                        id: user.id,
                        nome: user.nome,
                        email: user.email,
                        telefone: user.telefone
                    }
                }
            });

        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },

    
    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const pool = getConnection();

            const [users] = await pool.execute(
                'SELECT id, nome, email, telefone, sexo, cpf_cnpj, endereco, cep, cidade, estado, created_at FROM users WHERE id = ?',
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            res.json({
                success: true,
                data: users[0]
            });

        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },

    
    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const updateData = req.body;
            const pool = getConnection();

            //    atualizar dados
            const allowedFields = ['nome', 'telefone', 'endereco', 'cep', 'cidade', 'estado'];
            const fieldsToUpdate = {};

            allowedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    fieldsToUpdate[field] = updateData[field];
                }
            });

            // Permitir alteração de senha
            let senhaHash = null;
            if (updateData.senha) {
                const bcrypt = require('bcryptjs');
                senhaHash = await bcrypt.hash(updateData.senha, 10);
                fieldsToUpdate['senha'] = senhaHash;
            }

            if (Object.keys(fieldsToUpdate).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Nenhum campo válido para atualização'
                });
            }

            const setClause = Object.keys(fieldsToUpdate).map(field => `${field} = ?`).join(', ');
            const values = [...Object.values(fieldsToUpdate), userId];

            await pool.execute(
                `UPDATE users SET ${setClause} WHERE id = ?`,
                values
            );

            console.log(' Perfil atualizado com sucesso:', userId);

            res.json({
                success: true,
                message: 'Perfil atualizado com sucesso'
            });

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
};

module.exports = userController; 