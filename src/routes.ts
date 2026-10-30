import express from "express";
import * as UserController from "@controllers/UserController";
import { PlantaController } from "@controllers/PlantaController";

const routes = express.Router();
const plantaController = new PlantaController();

routes.get("/", (req, res) => {
  res.status(200).json({ message: "API do treinamento de CRUD do CITI 🚀" });
});

// CRUD de usuários
routes.post("/users", UserController.createUser);
routes.get("/users", UserController.readAllUsers);
routes.get("/users/:id", UserController.readUserById);
routes.patch("/users/:id", UserController.updateUser);
routes.delete("/users/:id", UserController.deleteUser);

// CRUD de plantas
routes.post("/plantas", (req, res) => plantaController.create(req, res));
routes.get("/plantas", (req, res) => plantaController.findAll(req, res));

// Rota FIXA do Valor Total (deve vir OBRIGATORIAMENTE antes da rota com :id)
routes.get("/plantas/estoque/valor-total", (req, res) => plantaController.valorTotalEstoque(req, res));

routes.get("/plantas/:id", (req, res) => plantaController.findById(req, res));
routes.patch("/plantas/:id", (req, res) => plantaController.update(req, res));
routes.delete("/plantas/:id", (req, res) => plantaController.delete(req, res));
routes.post("/plantas/:id/venda", (req, res) => plantaController.vender(req, res));

export default routes;