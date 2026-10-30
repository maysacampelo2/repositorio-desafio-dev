import { Request, Response } from "express";
import { PlantaRepository } from "../repositories/PlantaRepository";
import { Luminosidade } from "@prisma/client";

const plantaRepository = new PlantaRepository();

export class PlantaController {
  // 1. Cadastrar Planta (POST /plantas)
  async create(req: Request, res: Response) {
    try {
      const { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias } = req.body;

      if (
        !nome || !especie || preco === undefined || estoque === undefined ||
        !luminosidade || petFriendly === undefined || regaACadaDias === undefined
      ) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
      }

      if (
        typeof nome !== "string" || nome.trim() === "" ||
        typeof especie !== "string" || especie.trim() === "" ||
        !Number.isInteger(preco) || preco <= 0 ||
        !Number.isInteger(estoque) || estoque < 0 ||
        !Object.values(Luminosidade).includes(luminosidade) ||
        typeof petFriendly !== "boolean" ||
        !Number.isInteger(regaACadaDias) || regaACadaDias < 1
      ) {
        return res.status(400).json({ error: "Dados inválidos informados." });
      }

      const planta = await plantaRepository.create({
        nome: nome.trim(),
        especie: especie.trim(),
        preco,
        estoque,
        luminosidade,
        petFriendly,
        regaACadaDias,
      });

      return res.status(201).json(planta);
    } catch (error) {
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  }

  // 2. Listar Plantas com Filtros Opcionais (GET /plantas)
  async findAll(req: Request, res: Response) {
    try {
      const { luminosidade, petFriendly } = req.query;
      const filters: any = {};

      if (luminosidade !== undefined) {
        if (!Object.values(Luminosidade).includes(luminosidade as Luminosidade)) {
          return res.status(400).json({ error: "Filtro de luminosidade inválido." });
        }
        filters.luminosidade = luminosidade as Luminosidade;
      }

      if (petFriendly !== undefined) {
        if (petFriendly !== "true" && petFriendly !== "false") {
          return res.status(400).json({ error: "Filtro petFriendly inválido." });
        }
        filters.petFriendly = petFriendly === "true";
      }

      const plantas = await plantaRepository.findAll(filters);
      return res.status(200).json(plantas);
    } catch (error) {
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  }

  // 3. Buscar Planta por ID (GET /plantas/:id)
  async findById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "ID inválido." });
      }

      const planta = await plantaRepository.findById(id);
      if (!planta) {
        return res.status(404).json({ error: "Planta não encontrada." });
      }

      return res.status(200).json(planta);
    } catch (error) {
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  }

  // 4. Editar Planta (PATCH /plantas/:id)
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "ID inválido." });
      }

      const plantaExistente = await plantaRepository.findById(id);
      if (!plantaExistente) {
        return res.status(404).json({ error: "Planta não encontrada." });
      }

      const { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias } = req.body;

      if (nome !== undefined && (typeof nome !== "string" || nome.trim() === "")) {
        return res.status(400).json({ error: "Nome inválido." });
      }
      if (especie !== undefined && (typeof especie !== "string" || especie.trim() === "")) {
        return res.status(400).json({ error: "Espécie inválida." });
      }
      if (preco !== undefined && (!Number.isInteger(preco) || preco <= 0)) {
        return res.status(400).json({ error: "Preço inválido." });
      }
      if (estoque !== undefined && (!Number.isInteger(estoque) || estoque < 0)) {
        return res.status(400).json({ error: "Estoque inválido." });
      }
      if (luminosidade !== undefined && !Object.values(Luminosidade).includes(luminosidade)) {
        return res.status(400).json({ error: "Luminosidade inválida." });
      }
      if (petFriendly !== undefined && typeof petFriendly !== "boolean") {
        return res.status(400).json({ error: "petFriendly inválido." });
      }
      if (regaACadaDias !== undefined && (!Number.isInteger(regaACadaDias) || regaACadaDias < 1)) {
        return res.status(400).json({ error: "regaACadaDias inválido." });
      }

      const plantaAtualizada = await plantaRepository.update(id, {
        ...(nome && { nome: nome.trim() }),
        ...(especie && { especie: especie.trim() }),
        preco,
        estoque,
        luminosidade,
        petFriendly,
        regaACadaDias,
      });

      return res.status(200).json(plantaAtualizada);
    } catch (error) {
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  }

  // 5. Deletar Planta (DELETE /plantas/:id)
  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "ID inválido." });
      }

      const planta = await plantaRepository.findById(id);
      if (!planta) {
        return res.status(404).json({ error: "Planta não encontrada." });
      }

      await plantaRepository.delete(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  }

  // 6. Venda de Planta (POST /plantas/:id/venda)
  async vender(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { quantidade } = req.body;

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "ID inválido." });
      }

      if (!Number.isInteger(quantidade) || quantidade <= 0) {
        return res.status(400).json({ error: "Quantidade inválida para venda." });
      }

      const planta = await plantaRepository.findById(id);
      if (!planta) {
        return res.status(404).json({ error: "Planta não encontrada." });
      }

      if (planta.estoque < quantidade) {
        return res.status(400).json({ error: `Estoque insuficiente. Temos só ${planta.estoque} vasos.` });
      }

      const plantaAtualizada = await plantaRepository.diminuirEstoque(id, quantidade);
      return res.status(200).json(plantaAtualizada);
    } catch (error) {
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  }

  // 7. Valor Total do Estoque (GET /plantas/estoque/valor-total)
  async valorTotalEstoque(req: Request, res: Response) {
    try {
      const plantas = await plantaRepository.findAllPrecoEEstoque();

      const resultado = plantas.reduce(
        (
          acc: { valorTotalEmCentavos: number; totalDeVasos: number },
          item: { preco: number; estoque: number }
        ) => {
          acc.valorTotalEmCentavos += item.preco * item.estoque;
          acc.totalDeVasos += item.estoque;
          return acc;
        },
        { valorTotalEmCentavos: 0, totalDeVasos: 0 }
      );

      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  }
}