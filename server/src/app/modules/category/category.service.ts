import prisma from "../../config/prisma";

const createCategory = async (data: { name: string }) =>
  prisma.category.create({ data: { name: data.name } });

const getCategories = async () =>
  prisma.category.findMany({ orderBy: { createdAt: "desc" } });

const updateCategory = async (id: string, data: { name: string }) =>
  prisma.category.update({ where: { id }, data: { name: data.name } });

const deleteCategory = async (id: string) =>
  prisma.category.delete({ where: { id } });

export const categoryService = { createCategory, getCategories, updateCategory, deleteCategory };
