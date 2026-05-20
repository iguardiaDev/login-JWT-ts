import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/connections';
import { RequestconUsuario } from "../middlewares/auth.middleware";
import { promises } from "node:dns";

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
            'SELECT id FROM usuarios WHERE email = $1', [email]
        );

        //Si encuentra al menos un usuario 
        if (usuarioExiste.rows.length > 0)
        {
            res.status(400).json({mensaje: 'El email ya esta registrado'});
            return;
        }
        
        //Recordemos que saltRaunds es para setear el nivel de seguridad de la contraseña
        const saltRaunds = 10;
        const passHash = await bcrypt.hash(password, saltRaunds); //Hasheamos la contraseña

        const resultado = await pool.query
        (
            'INSERT INTO usuarios (email, password) VALUES ($1, $2) RETURNING id, email',
            [email, passHash]
        );

        //Guaradamos el nuevo usuario en nuevoUsuario, 
        const nuevoUsuario = resultado.rows[0];

        //Mensaje para confirmar que si se regustro correctamente
        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuario: nuevoUsuario
        });
        return;
    }
    catch (error)
    {
       res.status(500).json({mensaje: 'Error en el servidor'});
       return;
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    
    const {email, password} = req.body;

    if(!email || !password)
    {
        res.status(401).json({mensaje: 'Se requieren credenciales'});
        return;
    }
    try
    {
        //Vamos a la base de datos y vemos si existe el email
        const usuarioExiste = await pool.query
        (
            'SELECT * FROM usuarios WHERE email = $1', [email]
        );

        //Si no encuentra el email ingresado
        if(usuarioExiste.rows.length === 0)
        {
            res.status(400).json({mensaje: 'Credenciales incorrectas'});
            return;
        }

        //Recordemos que estamos esperando el email, 
        //entonces se entiende como el primer email con el email que ingresamos
        const usuario = usuarioExiste.rows[0]

        //Comparamos la password ingresada con la del usuario
        const passValida = await bcrypt.compare(password, usuario.password);

        if(!passValida)
        {
            res.status(400).json({mensaje: 'Credenciales incorrectas'});
            return;
        }

        //Aqui es donde creamos el token
        const token = jwt.sign
        (
            {id: usuario.id, email: usuario.email, rol: usuario.rol}, //Payload: lo que llevara el token
            process.env.JWT_SECRET as string, //Creamos el token a base de la llave sercreta y sera un string
            {expiresIn: '1h'} //lo que el token durara
        );

        res.json({mensaje: 'login exitoso', token});
        return;
    }
    catch(error)
    {
        res.status(500).json({mensaje: 'Error en el servidor'});
        return;
    }
};

export const perfil = async (req: RequestconUsuario, res: Response): Promise<void> =>
{
    try
    {
        const resultado = await pool.query
    (
        'SELECT id, email FROM usuarios WHERE id = $1', [req.usuario?.id] //Arreglo de valores, ? es para ver si usuario existe
    );

    //Si no encuentra ninguno
    if(resultado.rows.length === 0)
    {
        res.status(404).json({mensaje: 'usuario no encontrado'});
        return;
    }

    res.json({
        mensaje: 'Bienvenido',
        usuario: resultado.rows[0]
    });
    return;
    }
    catch (error)
    {
        res.status(500).json({mensaje: 'Error en el servidor'});
        return;
    }

}

export const listarUsuarios = async (req: RequestconUsuario, res: Response): Promise<void> => 
{
    try
    {
        const resultado = await pool.query(
            'SELECT id, email, rol, created_at FROM usuarios ORDER BY created_at DESC'
        );

        res.json({usuarios: resultado.rows});
    }
    catch(err)
    {
        res.status(500).json({mensaje: 'Error en el servidor'});
    }
};

export const cambiarRol = async (req: RequestconUsuario, res: Response): Promise<void> =>
{
    const{id} = req.params;
    const{rol} = req.body;

    const rolesPermitidos = ['admin', 'usuario', 'vista'];

    if (!rolesPermitidos.includes(rol))
    {
        res.status(400).json({mensaje: `Rol invalido. los roles validos son ${rolesPermitidos.join(', ')}`});
        return;
    }

    try
    {
        const resultado = await pool.query(
            'UPDATE usuarios SET rol = $1 WHERE id = $2 RETURNING id, email, rol', [rol, id]
        );

        if (resultado.rows.length === 0)
        {
            res.status(404).json({mensaje: 'usuario no encontrado'});
            return;
        }
        
        res.json({
            mensaje: 'Usuario actualizado correctamente',
            usuario: resultado.rows[0]
        });
   }
   catch (err)
   {
        res.status(500).json({mensaje: 'Error en el servidor'});
   }
};