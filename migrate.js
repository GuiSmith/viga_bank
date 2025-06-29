import banco from "./banco.js";
import models from "./models/index.js";
import views from "./views/index.js";

// console.log(models);

console.log("Criando tabelas...");
await banco.sync({ alter: true});
console.log("Tabelas criadas com sucesso");

console.log('Criando views...');
for (const view in views) {
    await banco.query(`DROP TABLE IF EXISTS ${views[view].Model.getTableName()};`);
    await banco.query(views[view].sql);
}
console.log('Views criadas com sucesso!');