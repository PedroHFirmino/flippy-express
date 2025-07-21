-- Criação do banco de dados
CREATE DATABASE flippy;
USE flippy;

-- Tabela de usuários (clientes)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    sexo ENUM('masculino', 'feminino', 'outro', 'null') NULL,
    cpf_cnpj VARCHAR(18) NOT NULL UNIQUE,
    endereco VARCHAR(255) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('pessoa_fisica', 'pessoa_juridica') DEFAULT 'pessoa_fisica',
    status ENUM('ativo', 'inativo', 'bloqueado') DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de motoboys
CREATE TABLE motoboys (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    sexo ENUM('masculino', 'feminino', 'outro') NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    data_nascimento DATE NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    status ENUM('online', 'offline', 'em_entrega', 'bloqueado') DEFAULT 'offline',
    avaliacao_media DECIMAL(3,2) DEFAULT 0.00,
    total_entregas INT DEFAULT 0,
    total_ganhos DECIMAL(10,2) DEFAULT 0.00,
    latitude DECIMAL(10,8) NULL,
    longitude DECIMAL(11,8) NULL,
    ultima_atualizacao_posicao TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de pedidos
CREATE TABLE pedidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    motoboy_id INT NULL,
    origem_latitude DECIMAL(10,8) NOT NULL,
    origem_longitude DECIMAL(11,8) NOT NULL,
    origem_endereco VARCHAR(255) NOT NULL,
    destino_latitude DECIMAL(10,8) NOT NULL,
    destino_longitude DECIMAL(11,8) NOT NULL,
    destino_endereco VARCHAR(255) NOT NULL,
    descricao_item TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    distancia_km DECIMAL(8,2) NULL,
    tempo_estimado_minutos INT NULL,
    status ENUM('pendente', 'aceito', 'em_andamento', 'entregue', 'cancelado') DEFAULT 'pendente',
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_aceito TIMESTAMP NULL,
    data_inicio_entrega TIMESTAMP NULL,
    data_entrega TIMESTAMP NULL,
    observacoes TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (motoboy_id) REFERENCES motoboys(id) ON DELETE SET NULL
);

-- Tabela de histórico de entregas
CREATE TABLE historico_entregas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    motoboy_id INT NOT NULL,
    user_id INT NOT NULL,
    valor_entrega DECIMAL(10,2) NOT NULL,
    data_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    avaliacao INT NULL CHECK (avaliacao >= 1 AND avaliacao <= 5),
    comentario TEXT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (motoboy_id) REFERENCES motoboys(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de ganhos dos motoboys
CREATE TABLE ganhos_motoboy (
    id INT PRIMARY KEY AUTO_INCREMENT,
    motoboy_id INT NOT NULL,
    pedido_id INT NOT NULL,
    valor_ganho DECIMAL(10,2) NOT NULL,
    comissao_percentual DECIMAL(5,2) DEFAULT 80.00,
    data_ganho TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pendente', 'pago', 'cancelado') DEFAULT 'pendente',
    FOREIGN KEY (motoboy_id) REFERENCES motoboys(id) ON DELETE CASCADE,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
);

-- Tabela de ranking dos motoboys
CREATE TABLE ranking_motoboy (
    id INT PRIMARY KEY AUTO_INCREMENT,
    motoboy_id INT NOT NULL,
    posicao INT NOT NULL,
    total_entregas INT DEFAULT 0,
    avaliacao_media DECIMAL(3,2) DEFAULT 0.00,
    total_ganhos DECIMAL(10,2) DEFAULT 0.00,
    periodo ENUM('diario', 'semanal', 'mensal') DEFAULT 'mensal',
    data_ranking DATE NOT NULL,
    FOREIGN KEY (motoboy_id) REFERENCES motoboys(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ranking (motoboy_id, periodo, data_ranking)
);

-- Tabela de configurações do sistema
CREATE TABLE configuracoes_sistema (
    id INT PRIMARY KEY AUTO_INCREMENT,
    chave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descricao TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de notificações
CREATE TABLE notificacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    motoboy_id INT NULL,
    tipo ENUM('pedido_novo', 'pedido_aceito', 'pedido_entregue', 'sistema') NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    data_notificacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (motoboy_id) REFERENCES motoboys(id) ON DELETE CASCADE
);

-- Tabela de sessões de usuários
CREATE TABLE sessoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    motoboy_id INT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    dispositivo VARCHAR(255) NULL,
    ip_address VARCHAR(45) NULL,
    expira_em TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (motoboy_id) REFERENCES motoboys(id) ON DELETE CASCADE
);

-- Tabela de solicitações de saque
CREATE TABLE solicitacoes_saque (
    id INT PRIMARY KEY AUTO_INCREMENT,
    motoboy_id INT NOT NULL,
    nome_solicitante VARCHAR(255) NOT NULL,
    chave_pix VARCHAR(255) NOT NULL,
    banco VARCHAR(100) NOT NULL,
    valor_disponivel DECIMAL(10,2) NOT NULL,
    valor_solicitado DECIMAL(10,2) NULL,
    status ENUM('pendente', 'aprovada', 'rejeitada', 'processada') DEFAULT 'pendente',
    observacoes TEXT NULL,
    data_processamento TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (motoboy_id) REFERENCES motoboys(id) ON DELETE CASCADE
);

-- Inserir configurações padrão do sistema
INSERT INTO configuracoes_sistema (chave, valor, descricao) VALUES
('comissao_motoboy', '80', 'Percentual de comissão para motoboys (%)'),
('valor_minimo_entrega', '5.00', 'Valor mínimo para entrega'),
('taxa_entrega_base', '3.00', 'Taxa base de entrega'),
('preco_por_km', '2.00', 'Preço por quilômetro de entrega (R$)'),
('taxa_aplicativo', '1.50', 'Taxa fixa do aplicativo (R$)'),
('raio_busca_km', '10', 'Raio de busca para motoboys (km)'),
('tempo_maximo_espera', '300', 'Tempo máximo de espera para aceite (segundos)');


