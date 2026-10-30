import prisma from "@database";
import { Luminosidade, Prisma } from "@prisma/client";

export class PlantaRepository {
  async create(data: Prisma.PlantaCreateInput) {
    return await prisma.planta.create({ data });
  }

  async findAll(filters?: { luminosidade?: Luminosidade; petFriendly?: boolean }) {
    return await prisma.planta.findMany({
      where: filters,
    });
  }

  async findById(id: number) {
    return await prisma.planta.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: Prisma.PlantaUpdateInput) {
    return await prisma.planta.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await prisma.planta.delete({
      where: { id },
    });
  }

  async diminuirEstoque(id: number, quantidade: number) {
    return await prisma.planta.update({
      where: { id },
      data: {
        estoque: { decrement: quantidade },
      },
    });
  }

  async findAllPrecoEEstoque() {
    return await prisma.planta.findMany({
      select: {
        preco: true,
        estoque: true,
      },
    });
  }
}