import banco from "./banco/banco.js";
import models from "./banco/models/index.js";
import views from "./banco/views/index.js";

console.log("Removendo views existentes...");
for (const view in views) {
  try {
    await banco.query(
      `DROP VIEW IF EXISTS ${views[view].Model.getTableName()} CASCADE;`
    );
    console.log(
      `View ${views[view].Model.getTableName()} removida com sucesso.`
    );
  } catch (error) {
    console.error(
      `Erro ao remover view ${views[view].Model.getTableName()}:`,
      error
    );
  }
}
console.log("Views removidas com sucesso!");

console.log("Criando ou alterando tabelas...");
await banco.sync({ alter: true });
console.log("Tabelas criadas/alteradas com sucesso");

console.log("Criando views...");
for (const view in views) {
  try {
    await banco.query(views[view].sql);
    console.log(`View ${views[view].Model.getTableName()} criada com sucesso.`);
  } catch (error) {
    console.error(
      `Erro ao criar view ${views[view].Model.getTableName()}:`,
      error
    );
    console.error("SQL:", views[view].sql);
  }
}
console.log("Views criadas com sucesso!");
