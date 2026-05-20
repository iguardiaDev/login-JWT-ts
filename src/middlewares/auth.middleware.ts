import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

//Extendemos el Request y ahora tendra un objeto usuario, que podria o no existir
export interface RequestconUsuario extends Request
{
    usuario?:{
        id: number;
        email: string;
        rol: string
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
        ) as {id: number; email: string; rol: string };

        //Guardamos decoded y sabemos que usuario podria tener id y email
        req.usuario = decoded;
        next();
    }
    catch (error)
    {
        res.status(401).json({mensaje: 'Token incorrecto'});
    }
};

//Funcion para verificar roles, tenemos un arreglo string "rolesPermitidos" que guarda los roles
export const verificarRol = (...rolesPermitidos: string[]) => {

    //Returnamos otra funcion, la cual verifica el rol que guardamos en la funcion anterior
    return (req: RequestconUsuario, res: Response, next: NextFunction): void => {
        
        //Agarramos el rolo del usuario
        const rolUsuario = req.usuario?.rol;

        //Si no tiene rol
        if (!rolUsuario)
        {
            res.status(401).json({mensaje: 'No se asigno un rol'});
            return;
        }
        //Esta es para verificar si el rol del usuario tiene los permisos necesarios
        if (!rolesPermitidos.includes(rolUsuario))
        {
            //403 significa que sabemos quien es, pero no tiene acceso
            res.status(403).json({mensaje: `Acceso denegado. Se requiere rol ${rolesPermitidos.join(' o ')}`});
            return;
        }
        next();
    };
};

