import { Request, Response } from "express";
import { Luminosidade } from "@schema.prisma";
import * as PlantaRepository from "@repositories/PlantaRepository";

// O controller recebe a requisição, valida os dados, chama o repository
// e decide qual status HTTP e qual corpo devolver.

const CAMPOS_OBRIGATORIOS = [
  "nome",
  "especie",
  "preco",
  "estoque",
  "luminosidade",
  "petFriendly",
  "regaACadaDias",
];

const ehInteiro = (valor: unknown): valor is number =>
  typeof valor === "number" && Number.isInteger(valor);

// O id chega da URL como texto: convertemos e conferimos se é um inteiro positivo.
// Devolve null quando o id é inválido (ex.: "abc", 0, -3).
const lerId = (valor: string): number | null => {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
};

// Valida apenas os campos que foram enviados.
// No cadastro (obrigatorios = true), todos os campos precisam existir.
// Na edição (obrigatorios = false), nenhum é obrigatório, mas os que vierem
// passam pelas mesmas regras. Devolve a mensagem de erro, ou null se estiver tudo certo.
// Obs.: comparamos com undefined (e não com !campo), porque 0 e false são valores válidos.
const validarPlanta = (
  body: Record<string, unknown>,
  obrigatorios: boolean
): string | null => {
  if (obrigatorios) {
    for (const campo of CAMPOS_OBRIGATORIOS) {
      if (body[campo] === undefined) {
        return `O campo ${campo} é obrigatório.`;
      }
    }
  }

  const { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias } = body;

  if (nome !== undefined && (typeof nome !== "string" || nome.trim() === "")) {
    return "O campo nome deve ser um texto não vazio.";
  }
  if (especie !== undefined && (typeof especie !== "string" || especie.trim() === "")) {
    return "O campo especie deve ser um texto não vazio.";
  }
  if (preco !== undefined && (!ehInteiro(preco) || preco <= 0)) {
    return "O campo preco deve ser um número inteiro maior que zero (em centavos).";
  }
  if (estoque !== undefined && (!ehInteiro(estoque) || estoque < 0)) {
    return "O campo estoque deve ser um número inteiro maior ou igual a zero.";
  }
  if (
    luminosidade !== undefined &&
    !Object.values(Luminosidade).includes(luminosidade as Luminosidade)
  ) {
    return "O campo luminosidade deve ser SOMBRA, MEIA_SOMBRA ou SOL_PLENO.";
  }
  if (petFriendly !== undefined && typeof petFriendly !== "boolean") {
    return "O campo petFriendly deve ser true ou false.";
  }
  if (regaACadaDias !== undefined && (!ehInteiro(regaACadaDias) || regaACadaDias < 1)) {
    return "O campo regaACadaDias deve ser um número inteiro maior ou igual a 1.";
  }

  return null;
};

export const createPlanta = async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};

    // 400 Bad Request: o cliente mandou dados faltando ou inválidos
    const erro = validarPlanta(body, true);
    if (erro) {
      return res.status(400).json({ message: erro });
    }

    // Enviamos só os campos da planta, nunca o req.body inteiro
    const { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias } = body;

    const planta = await PlantaRepository.createPlanta({
      nome: nome,
      especie: especie,
      preco: preco,
      estoque: estoque,
      luminosidade: luminosidade,
      petFriendly: petFriendly,
      regaACadaDias: regaACadaDias,
    });

    // 201 Created: algo novo foi criado
    return res.status(201).json(planta);
  } catch (error) {
    console.error(error);
    // 500 Internal Server Error: o problema foi nosso, não do cliente
    return res.status(500).json({ message: "Erro ao criar planta." });
  }
};

export const readAllPlantas = async (req: Request, res: Response) => {
  try {
    // Filtros opcionais: chegam em req.query e são sempre texto
    const { luminosidade, petFriendly } = req.query;

    if (
      luminosidade !== undefined &&
      (typeof luminosidade !== "string" ||
        !Object.values(Luminosidade).includes(luminosidade as Luminosidade))
    ) {
      return res.status(400).json({
        message: "O filtro luminosidade deve ser SOMBRA, MEIA_SOMBRA ou SOL_PLENO.",
      });
    }

    if (petFriendly !== undefined && petFriendly !== "true" && petFriendly !== "false") {
      return res.status(400).json({
        message: "O filtro petFriendly deve ser true ou false.",
      });
    }

    // Filtro não enviado continua undefined, e o Prisma ignora condições undefined.
    // Um filtro válido sem resultado devolve 200 com lista vazia, nunca 404.
    const plantas = await PlantaRepository.findAllPlantas(
      luminosidade as Luminosidade | undefined,
      petFriendly === undefined ? undefined : petFriendly === "true"
    );

    return res.status(200).json(plantas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar plantas." });
  }
};

export const readPlantaById = async (req: Request, res: Response) => {
  try {
    const id = lerId(req.params.id);

    if (id === null) {
      return res.status(400).json({ message: "O id deve ser um número inteiro positivo." });
    }

    const Planta = await PlantaRepository.findPlantaById(id);

    // 404 Not Found: o id não existe
    if (!Planta) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    return res.status(200).json(Planta);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar Planta." });
  }
};

export const updatePlanta = async (req: Request, res: Response) => {
  try {
    const id = lerId(req.params.id);

    if (id === null) {
      return res.status(400).json({ message: "O id deve ser um número inteiro positivo." });
    }

    const body = req.body ?? {};

    // Na edição nenhum campo é obrigatório, mas os enviados precisam ser válidos
    const erro = validarPlanta(body, false);
    if (erro) {
      return res.status(400).json({ message: erro });
    }

    const { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias } = body;

    const dados = { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias };

    // Editar sem enviar nenhum campo não faz sentido
    if (Object.values(dados).every((valor) => valor === undefined)) {
      return res.status(400).json({ message: "Envie ao menos um campo para editar." });
    }

    // Antes de editar, garantimos que a planta existe
    const Planta = await PlantaRepository.findPlantaById(id);

    if (!Planta) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    // PATCH = atualização parcial: campos não enviados (undefined) não são alterados
    const updatedPlanta = await PlantaRepository.updatePlanta(id, dados);

    return res.status(200).json(updatedPlanta);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao atualizar Planta." });
  }
};

export const deletePlanta = async (req: Request, res: Response) => {
  try {
    const id = lerId(req.params.id);

    if (id === null) {
      return res.status(400).json({ message: "O id deve ser um número inteiro positivo." });
    }

    const Planta = await PlantaRepository.findPlantaById(id);

    if (!Planta) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    await PlantaRepository.deletePlanta(id);

    // 204 No Content: deu certo e não há nada para devolver
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao deletar planta." });
  }
}