const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const path = require('path');

//Solicitud de los servicios de AWS S3 (Subir archivos a S3)
const {
    S3Client,
    PutObjectCommand
} = require('@aws-sdk/client-s3');

//Cargar variables de entorno
dotenv.config();

//Habilitar Framework Backend Express
const app = express();

//Leer algunas configuraciones
const PORT = process.env.PORT || 3000;
const BUCKET = process.env.AWS_S3_BUCKET;
const PREFIX = process.env.AWS_S3_PREFIX || '';

//Configuracion de multer (gestionar|subir archivos)
//Backend conservara una copia de manera temporal
const upload = multer({
    storage: multer.memoryStorage(),
})

//Cliente S3
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    endpoint: process.env.AWS_ENDPOINT_URL,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    forcePathStyle: true, // Necesario para LocalStack
})

//Archivo estatico aplicacion => Frontend
app.use(express.static(path.join(__dirname, 'public')));

//Ruta => http://localhost:3000/
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//Ruta para subir archivos
app.post('/upload', upload.single('archivo'), async (req, res) => {
    try {

        //Verificar que se haya seleccionado un archivo
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se ha seleccionado ningún archivo'
            });
        }

        //NOTA: hace falta considerar otros tipos de validacion
        // Por ejemplo: validar el tamaño del archivo, el tipo de archivo, etc.

        //Obtener el nombre del archivo
        const fileName = req.file.originalname;

        //Ruta del archivo
        //mi-aplicacion/archivos/documento.pdf
        const key = `${PREFIX}${fileName}`;

        //Subir el archivo a S3
        const command = new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        })

        //Ejecutar el comando para subir el archivo
        await s3Client.send(command);

        console.log(`Archivo subido a S3: ${key}`);

        //Respuesta al cliente
        res.json({
            success: true,
            message: 'Archivo subido correctamente',
            bucket: BUCKET,
            key: key
        });


    } catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: 'Error al subir el archivo',
            error: e.message
        })
    }
})

//Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});