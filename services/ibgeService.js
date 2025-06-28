const IBGE_API_BASE = 'https://servicodados.ibge.gov.br/api/v1/localidades';

// Checar disponibilidade da API do IBGE
const checarDisponibilidade = async () => {
    try {
        const response = await fetch(`${IBGE_API_BASE}`);
        return response.ok;
    } catch (error) {
        console.error('Erro ao checar disponibilidade da API do IBGE:', error);
        return false;
    }
}

// Listar estados
const listarEstados = async () => {
    try {
        // Verifica se a API do IBGE está disponível
        const disponivel = await checarDisponibilidade();
        if (!disponivel) {
            throw new Error('API do IBGE não está disponível');
        }
        
        const response = await fetch(`${IBGE_API_BASE}/estados`);
        if (!response.ok) {
            throw new Error('Erro ao buscar estados');
        }
        return await response.json();
    } catch (error) {
        console.error('Erro ao listar estados:', error);
        throw error;
    }
};

const listarCidades = async () => {
    try {
        // Verifica se a API do IBGE está disponível
        const disponivel = await checarDisponibilidade();
        if (!disponivel) {
            throw new Error('API do IBGE não está disponível');
        }

        const response = await fetch(`${IBGE_API_BASE}/cidades`);
        if (!response.ok) {
            throw new Error('Erro ao buscar cidades');
        }
        return await response.json();
    } catch (error) {
        console.error('Erro ao listar cidades:', error);
        throw error;
    }
};
// Listar cidades por estado
const listarCidadesPorEstado = async (sigla) => {
    try {
        // Verifica se a API do IBGE está disponível
        const disponivel = await checarDisponibilidade();
        if (!disponivel) {
            throw new Error(`API do IBGE não está disponível para o estado ${sigla}`);
        }

        const response = await fetch(`${IBGE_API_BASE}/estados/${sigla}/municipios`);
        if (!response.ok) {
            throw new Error(`Erro ao buscar cidades para o estado ${sigla}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Erro ao listar cidades por estado ${sigla}:`, error);
        throw error;
    }
};

export default {
    listarEstados,
    listarCidades,
    listarCidadesPorEstado,
    checarDisponibilidade
};