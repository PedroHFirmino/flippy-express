const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'flippy-secret-key';

const authMiddleware = {
    // Verifica token   
    verifyToken(req, res, next) {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acesso não fornecido'
            });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            console.error('Erro na verificação do token:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Token inválido ou expirado'
            });
        }
    },

    // Verificar se é usuário
    verifyUser(req, res, next) {
        if (req.user.tipo !== 'usuario') {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Apenas usuários podem acessar este recurso.'
            });
        }
        next();
    },

    // Verificar se é motoboy
    verifyMotoboy(req, res, next) {
        if (req.user.tipo !== 'motoboy') {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Apenas motoboys podem acessar este recurso.'
            });
        }
        next();
    },

};

module.exports = authMiddleware; 