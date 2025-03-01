import { response } from "express";
import User from "./user.model.js";

export const getUsers = async (req, res = response) => {
    try {
        const users = await User.find({ estado: true });

        res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Error fetching users ❌",
            error,
        });
    }
};
