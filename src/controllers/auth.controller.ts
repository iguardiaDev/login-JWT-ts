import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/connections';
import { RequestconUsuario } from "../middlewares/auth.middleware";

export const registro = async (req: Request, res: Response): Promise<void> => {

    const {email, password} = req.body;

    if (!email || !password)
    {
        res.status(400).json({mensaje: 'Email y password requeridos'});
        return;
    }
    try
    {
        const usuarioExiste = await pool.query
        (
            'SELECT id FROM usarios WHERE email = $1', [email]
        );

        if (usuarioExiste.rows.length > 0)
        {
            res.status(400).json({mensaje: 'El email ya existe registrado'});
            return;
        }
        
        const saltRaunds = 10;
        const passHash = await bcrypt.hash(password, saltRaunds);
    }
}