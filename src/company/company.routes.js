import { Router } from "express";
import { check } from "express-validator";
import { getCompanies, registerCompany, updateCompany, generateCompaniesReport } from "./company.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

router.get("/",getCompanies);

router.post(
    "/",
    [
        validarJWT,
        check("name", "Company name is required ✋").not().isEmpty(),
        check("impactLevel", "Impact Level is required ✋").not().isEmpty(),
        check("trajectoryYears", "Trajectory Years must be a number 🔢").isNumeric(),
        check("category", "Category is required ✋").not().isEmpty(),
        validarCampos
    ],
    registerCompany
);

router.put(
    "/:id",
    [
        validarJWT,
        check("id", "Invalid ID ❌").isMongoId(),
        check("name", "Company name is required ✋").optional().not().isEmpty(),
        check("impactLevel", "Impact Level is required ✋").optional().not().isEmpty(),
        check("trajectoryYears", "Trajectory Years must be a number 🔢").optional().isNumeric(),
        check("category", "Category is required ✋").optional().not().isEmpty(),
        validarCampos
    ],
    updateCompany
);

router.get(
    "/report",
    generateCompaniesReport
);

export default router;
