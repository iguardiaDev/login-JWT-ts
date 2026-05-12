import express, { Application } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '..routes/auth.routers.ts'

//Esta linea activa dotenv, sin ella el puerto serian UNDEFINED 
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
//Esto convierte las peticiones JSON en objetos JavaScript
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) =>{
        res.json({Mensaje: "Servidor corriendo con TypeScript"});
});

app.listen(PORT, () =>{
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});