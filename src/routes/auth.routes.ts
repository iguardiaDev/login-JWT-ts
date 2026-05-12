import { Router } from "express";
import {registro, login, perfil} from '../controllers/auth.controllers';
import {verificarToken} from '../middlewares/auth.middleware';

const router = Router();

router.get('/registro', registro);
router.get('/login', login);
router.post('/perfil', verificarToken ,perfil);

export default router;