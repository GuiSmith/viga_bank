import banco from '../banco.js';

// SQL que será usado na migração para criar a função de log
const sql = `
CREATE OR REPLACE FUNCTION insert_request_log(
  p_method VARCHAR,
  p_path VARCHAR,
  p_body JSONB,
  p_params JSONB,
  p_query JSONB,
  p_status_code INT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO requests_logs(method, path, body, params, query, status_code, data_cadastro)
  VALUES (p_method, p_path, p_body, p_params, p_query, p_status_code, NOW());
END;
$$ LANGUAGE plpgsql`;

// Criar logs com base nos dados passados
const criar = async ({ method, path, body = {}, params = {}, query = {}, statusCode }) => {
  try {
    const result = await banco.query(
      `SELECT insert_request_log(
        $1::VARCHAR,
        $2::VARCHAR,
        $3::JSONB,
        $4::JSONB,
        $5::JSONB,
        $6::INT
      )`,
      {
        bind: [
          method,
          path,
          JSON.stringify(body),
          JSON.stringify(params),
          JSON.stringify(query),
          statusCode
        ]
      }
    );
  } catch (error) {
    console.error('Erro ao criar log:', error);
  }
};

export default { sql, criar };