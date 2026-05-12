import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { json } from "node:stream/consumers";

//Extendemos el Request y ahora tendra un objeto usuario, que podria o no existir
export interface RequestconUsuario extends Request
{
    usuario?:{
        id: number;
        email: string;
    };
}

//Declaramos funcion para verificar token y sera void ya que no nos retornara nada
export const verificarToken = (
    req: RequestconUsuario,
    res: Response,
    next: NextFunction
): void => {

    //Aqui buscamos el token dentro de headers en authorization
    const token = req.headers['authorization'];

    if (!token)
    {
        res.status(401).json({Mensaje: 'Token requerido'});
        return;
    }

    try
    {
        //Verficamos el token y le estamos diciendo a decoded que tendra id y email
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string //Type assertion    
        ) as {id: number; email: string };

        //Guardamos decoded y sabemos que usuario podria tener id y email
        req.usuario = decoded;
        next();
    }
    catch (error)
    {
        res.status(401).json({mensaje: 'Token incorrecto'});
    }
};

