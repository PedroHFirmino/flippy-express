/**
 * Calculadora de preços para entregas do Flippy Express
 */

const PRECO_POR_KM = 2.00; // R$ 2,00 por km
const TAXA_APLICATIVO = 1.50; // R$ 1,50 taxa fixa do aplicativo
const COMISSAO_MOTOBOY = 0.80; // 80% para o motoboy

/**
 
 * @param {number} distanciaKm 
 * @returns {object} 
 */
function calcularValorEntrega(distanciaKm) {
    if (!distanciaKm || distanciaKm <= 0) {
        throw new Error('Distância deve ser maior que zero');
    }

    const valorPorDistancia = distanciaKm * PRECO_POR_KM;
    const valorTotal = valorPorDistancia + TAXA_APLICATIVO;
    const valorMotoboy = valorTotal * COMISSAO_MOTOBOY;
    const valorAplicativo = valorTotal - valorMotoboy;

    return {
        distancia_km: parseFloat(distanciaKm.toFixed(2)),
        valor_por_distancia: parseFloat(valorPorDistancia.toFixed(2)),
        taxa_aplicativo: TAXA_APLICATIVO,
        valor_total: parseFloat(valorTotal.toFixed(2)),
        valor_motoboy: parseFloat(valorMotoboy.toFixed(2)),
        valor_aplicativo: parseFloat(valorAplicativo.toFixed(2)),
        comissao_percentual: COMISSAO_MOTOBOY * 100
    };
}

/**
 
 * @param {number} lat1 - Latitude do ponto 1
 * @param {number} lon1 - Longitude do ponto 1
 * @param {number} lat2 - Latitude do ponto 2
 * @param {number} lon2 - Longitude do ponto 2
 * @returns {number} Distância em quilômetros
 */
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distancia = R * c;
    
    return parseFloat(distancia.toFixed(2));
}

/**
 *
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {boolean} 
 */
function validarCoordenadas(latitude, longitude) {
    return latitude >= -90 && latitude <= 90 && 
           longitude >= -180 && longitude <= 180;
}

module.exports = {
    calcularValorEntrega,
    calcularDistancia,
    validarCoordenadas,
    PRECO_POR_KM,
    TAXA_APLICATIVO,
    COMISSAO_MOTOBOY
}; 