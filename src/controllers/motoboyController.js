const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../database/connection');
const { calcularValorEntrega, calcularDistancia } = require('../utils/priceCalculator');
const emailService = require('../utils/emailService');

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

            // Validações 
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

            // Inserrt na table
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
                message: 'Motoboy registrado com sucesso. Aguardando aprovação.',
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

            // Alteração de senha
            let senhaHash = null;
            if (updateData.senha) {
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
    },


    async getAllMotoboys(req, res) {
        try {
            const pool = getConnection();

            const [motoboys] = await pool.execute(
                `SELECT 
                    id, nome, email, telefone, cidade, estado, status,
                    COALESCE(total_entregas, 0) as total_entregas,
                    COALESCE(total_ganhos, 0) as total_ganhos,
                    COALESCE(avaliacao_media, 0) as avaliacao_media,
                    created_at
                FROM motoboys 
                WHERE status != 'bloqueado'
                ORDER BY nome ASC`
            );

            res.json({
                success: true,
                data: motoboys
            });

        } catch (error) {
            console.error('Erro ao buscar motoboys:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },

    
    async getRanking(req, res) {
        try {
            const { periodo = 'semanal' } = req.query;
            const pool = getConnection();

            let dateFilter = '';
            let params = [];

            
            switch (periodo) {
                case 'semanal':
                    dateFilter = 'AND DATE(he.data_entrega) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
                    break;
                case 'mensal':
                    dateFilter = 'AND DATE(he.data_entrega) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
                    break;
                case 'anual':
                    dateFilter = 'AND DATE(he.data_entrega) >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
                    break;
                default:
                    dateFilter = 'AND DATE(he.data_entrega) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
            }

            // Query para usar historico_entregas 
            const [ranking] = await pool.execute(
                `SELECT 
                    m.id,
                    m.nome,
                    m.telefone,
                    m.cidade,
                    m.estado,
                    COALESCE(COUNT(he.id), 0) as total_entregas,
                    COALESCE(AVG(he.avaliacao), 0) as avaliacao_media,
                    COALESCE(SUM(gm.valor_ganho), 0) as total_ganhos,
                    ROW_NUMBER() OVER (ORDER BY COALESCE(COUNT(he.id), 0) DESC) as posicao
                FROM motoboys m
                LEFT JOIN historico_entregas he ON m.id = he.motoboy_id ${dateFilter}
                LEFT JOIN ganhos_motoboy gm ON he.pedido_id = gm.pedido_id
                WHERE m.status != 'bloqueado'
                GROUP BY m.id, m.nome, m.telefone, m.cidade, m.estado
                ORDER BY total_entregas DESC
                LIMIT 5`,
                params
            );

            console.log(`Ranking gerado com ${ranking.length} motoboys para período: ${periodo}`);
            console.log('Itens do ranking:', ranking.map(item => `${item.posicao}º - ${item.nome} (${item.total_entregas} entregas)`));

            res.json({
                success: true,
                data: ranking,
                periodo: periodo,
                total_motoboys: ranking.length
            });

        } catch (error) {
            console.error('Erro ao buscar ranking dos motoboys:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },

    
    async updateStats(req, res) {
        try {
            const { motoboy_id, total_entregas, total_ganhos, avaliacao_media } = req.body;
            const pool = getConnection();

            
            if (!motoboy_id || total_entregas === undefined || total_ganhos === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'motoboy_id, total_entregas e total_ganhos são obrigatórios'
                });
            }

            
            const [motoboys] = await pool.execute(
                'SELECT id FROM motoboys WHERE id = ?',
                [motoboy_id]
            );

            if (motoboys.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Motoboy não encontrado'
                });
            }

            // Atualizar estatísticas
            await pool.execute(
                `UPDATE motoboys SET 
                    total_entregas = ?,
                    total_ganhos = ?,
                    avaliacao_media = ?
                WHERE id = ?`,
                [total_entregas, total_ganhos, avaliacao_media || 0, motoboy_id]
            );

            console.log(' Estatísticas do motoboy atualizadas:', motoboy_id);

            res.json({
                success: true,
                message: 'Estatísticas atualizadas com sucesso',
                data: {
                    motoboy_id,
                    total_entregas,
                    total_ganhos,
                    avaliacao_media: avaliacao_media || 0
                }
            });

        } catch (error) {
            console.error(' Erro ao atualizar estatísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },

    
    async insertDeliveryHistory(req, res) {
        try {
            const { motoboy_id, user_id, distancia_km, avaliacao, comentario, dias_atras = 0 } = req.body;
            const pool = getConnection();

            // Validar dados obrigatórios
            if (!motoboy_id || !user_id || !distancia_km) {
                return res.status(400).json({
                    success: false,
                    message: 'motoboy_id, user_id e distancia_km são obrigatórios'
                });
            }

            // Verificar se motoboy existe
            const [motoboys] = await pool.execute(
                'SELECT id FROM motoboys WHERE id = ?',
                [motoboy_id]
            );

            if (motoboys.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Motoboy não encontrado'
                });
            }

            // Verificar se usuário existe
            const [users] = await pool.execute(
                'SELECT id FROM users WHERE id = ?',
                [user_id]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            // Calcular valor da entrega baseado na distância
            const calculoEntrega = calcularValorEntrega(distancia_km);
            const valorEntrega = calculoEntrega.valor_total;
            const valorGanho = calculoEntrega.valor_motoboy;

            // Criar um pedido fictício para referência
            const [pedidoResult] = await pool.execute(
                `INSERT INTO pedidos (
                    user_id, motoboy_id, origem_latitude, origem_longitude, origem_endereco,
                    destino_latitude, destino_longitude, destino_endereco, descricao_item,
                    valor, distancia_km, status, data_pedido, data_entrega
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'entregue', DATE_SUB(NOW(), INTERVAL ? DAY), DATE_SUB(NOW(), INTERVAL ? DAY))`,
                [
                    user_id, motoboy_id, -23.5505, -46.6333, 'Origem', 
                    -23.5505, -46.6333, 'Destino', 'Entrega', 
                    valorEntrega, distancia_km, dias_atras, dias_atras
                ]
            );

            const pedidoId = pedidoResult.insertId;

            // Inserir no histórico de entregas
            const [historicoResult] = await pool.execute(
                `INSERT INTO historico_entregas (
                    pedido_id, motoboy_id, user_id, valor_entrega, data_entrega, avaliacao, comentario
                ) VALUES (?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY), ?, ?)`,
                [pedidoId, motoboy_id, user_id, valorEntrega, dias_atras, avaliacao || null, comentario || null]
            );

            // Inserir ganho do motoboy
            await pool.execute(
                `INSERT INTO ganhos_motoboy (
                    motoboy_id, pedido_id, valor_ganho, comissao_percentual, status
                ) VALUES (?, ?, ?, ?, 'pago')`,
                [motoboy_id, pedidoId, valorGanho, calculoEntrega.comissao_percentual]
            );

            // Atualizar estatísticas na tabela motoboys
            await pool.execute(
                `UPDATE motoboys SET 
                    total_entregas = total_entregas + 1,
                    total_ganhos = total_ganhos + ?,
                    avaliacao_media = CASE 
                        WHEN ? IS NOT NULL THEN 
                            ((avaliacao_media * total_entregas) + ?) / (total_entregas + 1)
                        ELSE avaliacao_media
                    END
                WHERE id = ?`,
                [valorGanho, avaliacao, avaliacao, motoboy_id]
            );

            console.log('Dados inseridos no histórico:', historicoResult.insertId);
            console.log(`💰 Entrega: ${distancia_km}km - R$ ${valorEntrega.toFixed(2)} (Motoboy: R$ ${valorGanho.toFixed(2)})`);

            res.status(201).json({
                success: true,
                message: 'Dados inseridos no histórico com sucesso',
                data: {
                    pedido_id: pedidoId,
                    historico_id: historicoResult.insertId,
                    distancia_km: distancia_km,
                    valor_entrega: valorEntrega,
                    valor_motoboy: valorGanho,
                    calculo_detalhado: calculoEntrega
                }
            });

        } catch (error) {
            console.error('Erro ao inserir dados no histórico:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },

    // trazer dados para o ranking com base no histórico
    async updateAllStats(req, res) {
        try {
            const pool = getConnection();

            await pool.execute(`
                UPDATE motoboys m SET 
                    total_entregas = (
                        SELECT COUNT(*) FROM historico_entregas he 
                        WHERE he.motoboy_id = m.id
                    ),
                    total_ganhos = (
                        SELECT COALESCE(SUM(gm.valor_ganho), 0) 
                        FROM ganhos_motoboy gm 
                        JOIN historico_entregas he ON gm.pedido_id = he.pedido_id
                        WHERE he.motoboy_id = m.id AND gm.status = 'pago'
                    ),
                    avaliacao_media = (
                        SELECT COALESCE(AVG(he.avaliacao), 0) 
                        FROM historico_entregas he 
                        WHERE he.motoboy_id = m.id AND he.avaliacao IS NOT NULL
                    )
            `);

            console.log('Todas as estatísticas dos motoboys atualizadas');

            res.json({
                success: true,
                message: 'Estatísticas de todos os motoboys atualizadas com sucesso'
            });

        } catch (error) {
            console.error('Erro ao atualizar estatísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },

   
    async testarCalculoPrecos(req, res) {
        try {
            const distancias = [1, 2, 5, 10, 15, 20]; // km
            const resultados = [];

            distancias.forEach(distancia => {
                const calculo = calcularValorEntrega(distancia);
                resultados.push({
                    distancia_km: distancia,
                    valor_total: calculo.valor_total,
                    valor_motoboy: calculo.valor_motoboy,
                    valor_aplicativo: calculo.valor_aplicativo,
                    detalhes: calculo
                });
            });

            console.log(' Teste de cálculo de preços realizado');

            res.json({
                success: true,
                message: 'Teste de cálculo de preços',
                data: {
                    configuracoes: {
                        preco_por_km: 2.00,
                        taxa_aplicativo: 1.50,
                        comissao_motoboy: '80%'
                    },
                    resultados: resultados
                }
            });

        } catch (error) {
            console.error('Erro ao testar cálculo de preços:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },

    // Solicitar saque
    async solicitarSaque(req, res) {
        try {
            const motoboyId = req.user.id;
            const { nome, chavePix, banco } = req.body;

            if (!nome || !chavePix || !banco) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome, chave PIX e banco são obrigatórios'
                });
            }

            const pool = getConnection();

            // Buscar dados do motoboy
            const [motoboys] = await pool.execute(
                'SELECT nome, email, total_ganhos FROM motoboys WHERE id = ?',
                [motoboyId]
            );

            if (motoboys.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Motoboy não encontrado'
                });
            }

            const motoboy = motoboys[0];

            // Salvar solicitação no banco
            const [result] = await pool.execute(
                `INSERT INTO solicitacoes_saque (
                    motoboy_id, nome_solicitante, chave_pix, banco, 
                    valor_disponivel, status, created_at
                ) VALUES (?, ?, ?, ?, ?, 'pendente', NOW())`,
                [motoboyId, nome, chavePix, banco, motoboy.total_ganhos || 0]
            );

            // Enviar e-mail
            const emailData = {
                nomeMotoboy: motoboy.nome,
                emailMotoboy: motoboy.email,
                nomeSolicitante: nome,
                chavePix: chavePix,
                banco: banco,
                valorDisponivel: Number(motoboy.total_ganhos || 0),
                dataSolicitacao: new Date().toLocaleString('pt-BR'),
                idSolicitacao: result.insertId
            };

            const emailResult = await emailService.enviarSolicitacaoSaque(emailData);
            
            if (!emailResult.success) {
                console.error('Erro ao enviar e-mail:', emailResult.error);
            
            }

            res.json({
                success: true,
                message: 'Solicitação de saque enviada com sucesso',
                data: {
                    id: result.insertId,
                    valor_disponivel: motoboy.total_ganhos || 0
                }
            });

        } catch (error) {
            console.error('Erro ao solicitar saque:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },

    async setStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const pool = getConnection();

            if (!['online', 'offline'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Status inválido' });
            }

            await pool.execute('UPDATE motoboys SET status = ? WHERE id = ?', [status, id]);
            res.json({ success: true, message: `Status atualizado para ${status}` });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Erro ao atualizar status' });
        }
    },

    async getStatsDia(req, res) {
        try {
            const { id } = req.params;
            console.log('Buscando stats para motoboy ID:', id);
            const pool = getConnection();
            // Entregas e ganhos do dia (sem filtro de data para debug)
            const [result] = await pool.execute(
                `SELECT COUNT(*) as entregasHoje, COALESCE(SUM(gm.valor_ganho),0) as ganhosHoje
                 FROM pedidos p
                 JOIN ganhos_motoboy gm ON gm.pedido_id = p.id
                 WHERE p.motoboy_id = ?
                   AND p.status = 'entregue'`,
                [id]
            );
            
            // Debug: verificar se há pedidos entregues hoje
            const [pedidosHoje] = await pool.execute(
                `SELECT id, status, data_entrega, valor FROM pedidos 
                 WHERE motoboy_id = ? AND status = 'entregue'`,
                [id]
            );
            console.log('Pedidos entregues pelo motoboy:', pedidosHoje);
            
            // Debug: verificar ganhos do motoboy
            const [ganhos] = await pool.execute(
                `SELECT * FROM ganhos_motoboy WHERE motoboy_id = ?`,
                [id]
            );
            console.log('Ganhos do motoboy:', ganhos);
            console.log('Resultado da query stats:', result[0]);
            res.json({
                success: true,
                data: {
                    ...result[0],
                    ganhosHoje: Number(result[0].ganhosHoje)
                }
            });
        } catch (error) {
            console.error('Erro ao buscar stats do dia:', error);
            res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas do dia' });
        }
    },

    async getPedidoEmAndamento(req, res) {
        try {
            const { id } = req.params;
            const pool = getConnection();
            const [pedidos] = await pool.execute(
                'SELECT * FROM pedidos WHERE motoboy_id = ? AND status = "em_andamento" LIMIT 1',
                [id]
            );
            if (pedidos.length === 0) {
                return res.json({ success: true, data: null });
            }
            const pedido = pedidos[0];
            res.json({
                success: true,
                data: {
                    ...pedido,
                    origem_latitude: Number(pedido.origem_latitude),
                    origem_longitude: Number(pedido.origem_longitude),
                    destino_latitude: Number(pedido.destino_latitude),
                    destino_longitude: Number(pedido.destino_longitude),
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Erro ao buscar entrega em andamento' });
        }
    },

    
    async testarDados(req, res) {
        try {
            const { id } = req.params;
            const pool = getConnection();
            
       
            const [pedidos] = await pool.execute(
                'SELECT id, status, valor, data_entrega FROM pedidos WHERE motoboy_id = ? AND status = "entregue"',
                [id]
            );


            const [ganhos] = await pool.execute(
                'SELECT * FROM ganhos_motoboy WHERE motoboy_id = ?',
                [id]
            );
            
      
            const [historico] = await pool.execute(
                'SELECT * FROM historico_entregas WHERE motoboy_id = ?',
                [id]
            );
            
            res.json({
                success: true,
                data: {
                    pedidos_entregues: pedidos,
                    ganhos: ganhos,
                    historico: historico
                }
            });
        } catch (error) {
            console.error('Erro no teste de dados:', error);
            res.status(500).json({ success: false, message: 'Erro ao testar dados' });
        }
    }
};

module.exports = motoboyController;