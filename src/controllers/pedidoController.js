const { getConnection } = require('../database/connection');
const { calcularValorEntrega, calcularDistancia, validarCoordenadas } = require('../utils/priceCalculator');

const pedidoController = {
    // Criar novo pedido
    async create(req, res) {
        try {
            const {
                user_id,
                origem_latitude,
                origem_longitude,
                origem_endereco,
                destino_latitude,
                destino_longitude,
                destino_endereco,
                descricao_item,
                observacoes
            } = req.body;

            // Validações obrigatórias
            if (!user_id || !origem_endereco || !destino_endereco || !descricao_item) {
                return res.status(400).json({
                    success: false,
                    message: 'Usuário, endereços e descrição do item são obrigatórios'
                });
            }

            // Validar coordenadas se fornecidas
            if (origem_latitude && origem_longitude && destino_latitude && destino_longitude) {
                if (!validarCoordenadas(origem_latitude, origem_longitude) || 
                    !validarCoordenadas(destino_latitude, destino_longitude)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Coordenadas inválidas fornecidas'
                    });
                }
            }

            const pool = getConnection();

            // Verificar se usuário existe e está ativo
            const [usuarios] = await pool.execute(
                'SELECT id FROM users WHERE id = ? AND status = "ativo"',
                [user_id]
            );

            if (usuarios.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Usuário não encontrado ou inativo'
                });
            }

            // Calcular distância e valor da entrega
            let distancia_km = null;
            let valor = null;
            let tempo_estimado_minutos = null;


            if (req.body.distancia_km) {
                distancia_km = parseFloat(req.body.distancia_km);
                const calculoEntrega = calcularValorEntrega(distancia_km);
                valor = calculoEntrega.valor_motoboy;
                tempo_estimado_minutos = Math.ceil(distancia_km * 3);
            } else if (origem_latitude && origem_longitude && destino_latitude && destino_longitude) {
        
                distancia_km = calcularDistancia(
                    origem_latitude, origem_longitude,
                    destino_latitude, destino_longitude
                );
                
                // Calcular valor da entrega
                const calculoEntrega = calcularValorEntrega(distancia_km);
                valor = calculoEntrega.valor_motoboy;
                
            
                tempo_estimado_minutos = Math.ceil(distancia_km * 3);
            } else {
                // Se não há coordenadas, usar valor padrão mínimo
                valor = 5.00;
                distancia_km = 1.75; 
                tempo_estimado_minutos = 5;
            }

            const [result] = await pool.execute(
                `INSERT INTO pedidos (
                    user_id, origem_latitude, origem_longitude, origem_endereco,
                    destino_latitude, destino_longitude, destino_endereco, descricao_item,
                    valor, distancia_km, tempo_estimado_minutos, observacoes, status, data_pedido
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente', NOW())`,
                [user_id, origem_latitude || null, origem_longitude || null, origem_endereco,
                 destino_latitude || null, destino_longitude || null, destino_endereco, descricao_item,
                 valor, distancia_km, tempo_estimado_minutos, observacoes || null]
            );

            console.log('Pedido criado com sucesso:', result.insertId);
            console.log(`💰 Valor calculado: R$ ${valor.toFixed(2)} (${distancia_km}km)`);

            res.status(201).json({
                success: true,
                message: 'Pedido criado com sucesso',
                data: {
                    id: result.insertId,
                    status: 'pendente',
                    valor: valor,
                    distancia_km: distancia_km,
                    tempo_estimado_minutos: tempo_estimado_minutos
                }
            });

        } catch (error) {
            console.error('Erro ao criar pedido:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },

 
    async getUserOrders(req, res) {
        try {
            const { userId } = req.params;
            const pool = getConnection();

            const [pedidos] = await pool.execute(
                `SELECT p.*, m.nome as motoboy_nome, m.telefone as motoboy_telefone
                 FROM pedidos p
                 LEFT JOIN motoboys m ON p.motoboy_id = m.id
                 WHERE p.user_id = ?
                 ORDER BY p.data_pedido DESC`,
                [userId]
            );

            res.json({
                success: true,
                data: pedidos
            });

        } catch (error) {
            console.error('Erro ao buscar pedidos do usuário:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },


    async getMotoboyOrders(req, res) {
        try {
            const { motoboyId } = req.params;
            const pool = getConnection();

            const [pedidos] = await pool.execute(
                `SELECT p.*, u.nome as user_nome, u.telefone as user_telefone
                 FROM pedidos p
                 LEFT JOIN users u ON p.user_id = u.id
                 WHERE p.motoboy_id = ?
                 ORDER BY p.data_pedido DESC`,
                [motoboyId]
            );

            res.json({
                success: true,
                data: pedidos
            });

        } catch (error) {
            console.error('Erro ao buscar pedidos do motoboy:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },

    async updateStatus(req, res) {
        try {
            console.log('PATCH /pedidos/:id/status', req.params, req.body);
            const { id } = req.params;
            const { status, motoboy_id } = req.body;
            const pool = getConnection();

            const validStatuses = ['pendente', 'aceito', 'em_andamento', 'entregue', 'cancelado'];
            if (!validStatuses.includes(status)) {
                console.log('Status inválido:', status);
                return res.status(400).json({
                    success: false,
                    message: 'Status inválido'
                });
            }

            const [pedidos] = await pool.execute(
                'SELECT * FROM pedidos WHERE id = ?',
                [id]
            );

            if (pedidos.length === 0) {
                console.log('Pedido não encontrado:', id);
                return res.status(404).json({
                    success: false,
                    message: 'Pedido não encontrado'
                });
            }

            const pedido = pedidos[0];

            if (status === 'aceito' && motoboy_id) {
                const [motoboys] = await pool.execute(
                    'SELECT status FROM motoboys WHERE id = ? AND status = "online"',
                    [motoboy_id]
                );

                if (motoboys.length === 0) {
                    console.log('Motoboy não encontrado ou não está online:', motoboy_id);
                    return res.status(400).json({
                        success: false,
                        message: 'Motoboy não encontrado ou não está online'
                    });
                }

                await pool.execute(
                    'UPDATE motoboys SET status = "em_entrega" WHERE id = ?',
                    [motoboy_id]
                );
            }

            if (status === 'entregue' && pedido.motoboy_id) {
                console.log('Finalizando entrega - Pedido:', pedido.id, 'Motoboy:', pedido.motoboy_id, 'Valor:', pedido.valor);
                
                await pool.execute(
                    'UPDATE motoboys SET status = "online" WHERE id = ?',
                    [pedido.motoboy_id]
                );
                
                // Inserir ganho do motoboy na tabela ganhos_motoboy
                const [ganhoResult] = await pool.execute(
                    'INSERT INTO ganhos_motoboy (motoboy_id, pedido_id, valor_ganho, data_ganho) VALUES (?, ?, ?, NOW())',
                    [pedido.motoboy_id, pedido.id, pedido.valor]
                );
                console.log('Ganho inserido com ID:', ganhoResult.insertId);
                
                // Inserir no histórico de entregas
                const [historicoResult] = await pool.execute(
                    'INSERT INTO historico_entregas (pedido_id, motoboy_id, user_id, valor_entrega, data_entrega) VALUES (?, ?, ?, ?, NOW())',
                    [pedido.id, pedido.motoboy_id, pedido.user_id, pedido.valor]
                );
                console.log('Histórico inserido com ID:', historicoResult.insertId);
                
                console.log('Entrega finalizada com sucesso!');
            }

            const updateData = { status };
            if (motoboy_id) {
                updateData.motoboy_id = motoboy_id;
            }

            const setClause = Object.keys(updateData).map(field => `${field} = ?`).join(', ');
            const values = [...Object.values(updateData), id];

            await pool.execute(
                `UPDATE pedidos SET ${setClause} WHERE id = ?`,
                values
            );

            console.log('Status do pedido atualizado:', id, status);

            res.json({
                success: true,
                message: 'Status do pedido atualizado com sucesso'
            });

        } catch (error) {
            console.error('Erro ao atualizar status do pedido:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },

  
    async getOrderById(req, res) {
        try {
            const { id } = req.params;
            const pool = getConnection();

            const [pedidos] = await pool.execute(
                `SELECT p.*, 
                        u.nome as user_nome, u.telefone as user_telefone,
                        m.nome as motoboy_nome, m.telefone as motoboy_telefone
                 FROM pedidos p
                 LEFT JOIN users u ON p.user_id = u.id
                 LEFT JOIN motoboys m ON p.motoboy_id = m.id
                 WHERE p.id = ?`,
                [id]
            );

            if (pedidos.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido não encontrado'
                });
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
                // ...outros campos se quiser garantir tipo
              }
            });

        } catch (error) {
            console.error(' Erro ao buscar pedido:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },

    
    async createSimulatedOrder(req, res) {
        try {
            const { user_id, motoboy_id, valor_pedido, endereco_entrega, avaliacao } = req.body;
            const pool = getConnection();

            
            if (!user_id || !motoboy_id || !valor_pedido || !endereco_entrega) {
                return res.status(400).json({
                    success: false,
                    message: 'user_id, motoboy_id, valor_pedido e endereco_entrega são obrigatórios'
                });
            }

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

            
            const [pedidoResult] = await pool.execute(
                `INSERT INTO pedidos (
                    user_id, motoboy_id, valor_pedido, endereco_entrega,
                    status, data_pedido, avaliacao
                ) VALUES (?, ?, ?, ?, 'entregue', NOW(), ?)`,
                [user_id, motoboy_id, valor_pedido, endereco_entrega, avaliacao || null]
            );

            const pedidoId = pedidoResult.insertId;

            const valorGanho = valor_pedido * 0.8;

            
            await pool.execute(
                `INSERT INTO ganhos_motoboy (
                    motoboy_id, pedido_id, valor_ganho, comissao_percentual, status
                ) VALUES (?, ?, ?, 80.00, 'pago')`,
                [motoboy_id, pedidoId, valorGanho]
            );

            
            await pool.execute(
                `UPDATE motoboys SET 
                    total_entregas = COALESCE(total_entregas, 0) + 1,
                    total_ganhos = COALESCE(total_ganhos, 0) + ?
                WHERE id = ?`,
                [valorGanho, motoboy_id]
            );

            console.log(' Pedido simulado criado com sucesso:', pedidoId);

            res.status(201).json({
                success: true,
                message: 'Pedido simulado criado com sucesso',
                data: {
                    id: pedidoId,
                    valor_pedido,
                    valor_ganho,
                    status: 'entregue'
                }
            });

        } catch (error) {
            console.error(' Erro ao criar pedido simulado:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },

    
    async calcularPreco(req, res) {
        try {
            const {
                origem_latitude,
                origem_longitude,
                destino_latitude,
                destino_longitude
            } = req.body;

        
            if (!origem_latitude || !origem_longitude || !destino_latitude || !destino_longitude) {
                return res.status(400).json({
                    success: false,
                    message: 'Todas as coordenadas (origem e destino) são obrigatórias'
                });
            }

         
            if (!validarCoordenadas(origem_latitude, origem_longitude) || 
                !validarCoordenadas(destino_latitude, destino_longitude)) {
                return res.status(400).json({
                    success: false,
                    message: 'Coordenadas inválidas fornecidas'
                });
            }

     
            const distancia_km = calcularDistancia(
                origem_latitude, origem_longitude,
                destino_latitude, destino_longitude
            );

            const calculoEntrega = calcularValorEntrega(distancia_km);
            
           
            const tempo_estimado_minutos = Math.ceil(distancia_km * 3);

            console.log(` Cálculo de preço: ${distancia_km}km - R$ ${calculoEntrega.valor_total.toFixed(2)}`);

            res.json({
                success: true,
                data: {
                    distancia_km: calculoEntrega.distancia_km,
                    tempo_estimado_minutos: tempo_estimado_minutos,
                    valor_total: calculoEntrega.valor_total,
                    detalhes: calculoEntrega
                }
            });

        } catch (error) {
            console.error('Erro ao calcular preço da entrega:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },

    async getPedidosPendentes(req, res) {
        try {
            const pool = getConnection();
            const [pedidos] = await pool.execute(
                'SELECT * FROM pedidos WHERE status = "pendente"'
            );
            console.log('Pedidos pendentes:', pedidos);
            res.json({ success: true, data: pedidos });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Erro ao buscar pedidos pendentes' });
        }
    },

    async aceitarPedido(req, res) {
        try {
            const { pedidoId } = req.params;
            const { motoboy_id } = req.body;
            const pool = getConnection();

            // Verifica se o pedido ainda está pendente
            const [pedidos] = await pool.execute(
                'SELECT status FROM pedidos WHERE id = ?',
                [pedidoId]
            );
            if (pedidos.length === 0) {
                return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
            }
            if (pedidos[0].status !== 'pendente') {
                return res.status(400).json({ success: false, message: 'Pedido já foi aceito por outro motoboy' });
            }

            // Atualiza o pedido para em_andamento e vincula o motoboy
            await pool.execute(
                'UPDATE pedidos SET status = ?, motoboy_id = ? WHERE id = ?',
                ['em_andamento', motoboy_id, pedidoId]
            );

            res.json({ success: true, message: 'Pedido aceito com sucesso' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Erro ao aceitar pedido' });
        }
    }
};

module.exports = pedidoController;