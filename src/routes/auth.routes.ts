import { Router } from "express";
import {registro, login, perfil, listarUsuarios, cambiarRol} from '../controllers/auth.controller';
import {verificarRol, verificarToken} from '../middlewares/auth.middleware';

const router = Router();

//rutas publicas
router.post('/registro', registro);
router.post('/login', login);

//rutas autenticadas - cualquier rol
router.get('/perfil', verificarToken ,perfil);

//rutas de administrador
router.get('/usuarios', verificarToken, verificarRol('admin'), listarUsuarios);
router.put('/usuarios/:id/rol', verificarToken, verificarRol('admin'), cambiarRol);

export default router;