/**
 * Teste simples para o endpoint de listagem de PIX
 */
import fetch from "node-fetch";
import models from "./banco/models/index.js";

const API_URL = "http://localhost:5000";

async function testarListagemPIX() {
  try {
    console.log("=== TESTE DE LISTAGEM DE PIX ===");

    // 1. Obter token de API existente
    const { TokenApi, Beneficiario } = models;
    const tokenApi = await TokenApi.findOne({
      where: { ativo: true },
      include: [{ model: Beneficiario, as: "beneficiario" }],
    });

    if (!tokenApi) {
      console.error("Nenhum token de API ativo encontrado");
      return;
    }

    console.log(`Usando token de API: ${tokenApi.token}`);
    console.log(
      `Beneficiário: ${tokenApi.beneficiario.fantasia} (ID: ${tokenApi.id_beneficiario})`
    );

    // 2. Tentar acessar o endpoint de listagem de PIX
    console.log("\nTentando acessar o endpoint /pix...");
    const response = await fetch(`${API_URL}/pix`, {
      headers: {
        Authorization: `Bearer ${tokenApi.token}`,
      },
    });

    const contentType = response.headers.get("content-type");
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${contentType}`);

    if (contentType && contentType.indexOf("application/json") !== -1) {
      const data = await response.json();
      console.log(
        "Resposta JSON:",
        JSON.stringify(data, null, 2).substring(0, 300) + "..."
      );
    } else {
      const text = await response.text();
      console.log("Resposta não-JSON:", text.substring(0, 300) + "...");
    }
  } catch (error) {
    console.error("Erro no teste:", error);
  }
}

testarListagemPIX().then(() => console.log("Teste finalizado"));
