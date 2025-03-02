import { response } from "express";
import Company from "./company.model.js";
import exceljs from "exceljs";

export const getCompanies = async (req, res = response) => {
    try {
        const { category, order, trajectoryYears } = req.query;

        let filter = { status: true };

        if (category) filter.category = category;
        if (trajectoryYears) filter.trajectoryYears = { $gte: Number(trajectoryYears) }; 

        let sort = {};
        if (order === "A-Z") sort.name = 1;
        if (order === "Z-A") sort.name = -1;

        const companies = await Company.find(filter).sort(sort);

        res.status(200).json({
            success: true,
            companies,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Error fetching companies ❌",
            error,
        });
    }
};

export const registerCompany = async (req, res = response) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                msg: "Unauthorized ❌ Token required",
            });
        }

        const { name, impactLevel, trajectoryYears, category } = req.body;

        const company = await Company.create({
            name,
            impactLevel,
            trajectoryYears,
            category,
        });

        res.status(201).json({
            success: true,
            msg: "Company registered successfully 🎉",
            company,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Error registering company ❌",
            error,
        });
    }
};

export const updateCompany = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { name, impactLevel, trajectoryYears, category } = req.body;

        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                msg: "Unauthorized ❌ Token required",
            });
        }

        const updatedCompany = await Company.findByIdAndUpdate(
            id,
            { name, impactLevel, trajectoryYears, category },
            { new: true }
        );

        if (!updatedCompany) {
            return res.status(404).json({
                success: false,
                msg: "Company not found ❌",
            });
        }

        res.status(200).json({
            success: true,
            msg: "Company updated successfully ✅",
            updatedCompany,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Error updating company ❌",
            error,
        });
    }
};

export const generateCompaniesReport = async (req, res = response) => {
    try {
        const companies = await Company.find({ status: true });

        if (companies.length === 0) {
            return res.status(404).json({
                success: false,
                msg: "No companies found ❌",
            });
        }

        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet("Companies Report");

        worksheet.columns = [
            { header: "ID", key: "_id", width: 30 },
            { header: "Name", key: "name", width: 30 },
            { header: "Impact Level", key: "impactLevel", width: 15 },
            { header: "Trajectory Years", key: "trajectoryYears", width: 20 },
            { header: "Category", key: "category", width: 20 },
            { header: "Registration Date", key: "registrationDate", width: 25 },
        ];

        companies.forEach((company) => {
            worksheet.addRow(company.toObject());
        });

        const fileName = "Companies_Report.xlsx";

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

        const buffer = await workbook.xlsx.writeBuffer();
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error("Error generating report ❌", error);
        res.status(500).json({
            success: false,
            msg: "Error generating report ❌",
            error,
        });
    }
};