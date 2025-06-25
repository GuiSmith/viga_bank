import banco from "./banco.js";
import models from "./models/index.js";

console.log(models);

await banco.sync({ alter: true});
console.log("Tabelas criadas com sucesso");

