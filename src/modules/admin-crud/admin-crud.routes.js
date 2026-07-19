import express from "express";
import { ROLES } from "#constants/index.js";
import { validateDto, verifyAuthRole } from "#middleware/index.js";
import { inventoryDto, menuDto } from "#dtos/admin-crud.dto.js";
import { adminCrudController } from "./admin-crud.controllers.js";

const createRoutes = (dto) =>
  express.Router()
    .use(verifyAuthRole(ROLES.ADMIN))
    .get("/", adminCrudController.getAll)
    .post("/", validateDto(dto), adminCrudController.create)
    .get("/:id", adminCrudController.getById)
    .patch("/:id", validateDto(dto), adminCrudController.update)
    .delete("/:id", adminCrudController.remove);

export const menuRoutes = createRoutes(menuDto);
export const inventoryRoutes = createRoutes(inventoryDto);
