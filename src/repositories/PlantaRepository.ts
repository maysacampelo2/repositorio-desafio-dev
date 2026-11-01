import { Luminosidade, Prisma } from "@prisma/client";
import prisma from "@database";

export const createPlanta = async (data: Prisma.Planta.CreateInput) => {
    return await prisma.Planta.create({
        data: data,
    });
};

export const findAllPlantas = async (
    luminosidade?: Luminosidade,
    petFriendly?: boolean
) => {
    return await prisma.Planta.findMany({
        where: {
            luminosidade: luminosidade,
            petFriendly: petFriendly,
        },
    });
};

export const findPlantaById = async (id: number) => {
    return await prisma.Planta.findUnique({
        where: { id: id }
    });
};

export const updatePlanta = async (id: number, data: Prisma.PlantaUpdateInput) => {
    return await prisma.Planta.update({
        where: { id: id },
        data: data,
    });
};

export const deletePlanta = async (id: number) => {
    return await prisma.Planta.delete({
        where: { id: id }
    });
};