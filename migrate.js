import banco from "./banco/banco.js";
import models from "./banco/models/index.js";
import views from './banco/views/index.js'
import functions from "./banco/functions/index.js";

console.log("Iniciando migração do banco de dados...");
console.log("Destruindo views...");
const existingViews = await banco.query("SELECT table_name FROM information_schema.views WHERE table_schema = 'public';");
for (const view of existingViews[0]) {
    await banco.query(`DROP VIEW IF EXISTS ${view.table_name};`);
}
console.log("Views destruídas com sucesso!");

console.log("Criando tabelas...");
await banco.sync({ alter: true});
console.log("Tabelas criadas com sucesso");

console.log('Criando views...');
for (const view in views) {
    await banco.query(`DROP TABLE IF EXISTS ${views[view].Model.getTableName()};`);
    await banco.query(views[view].sql);
}
console.log('Views criadas com sucesso!');

console.log('Criando funções...');
for (const func in functions) {
    await banco.query(functions[func].sql);
}
console.log('Funções criadas com sucesso!');