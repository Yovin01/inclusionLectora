const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const gtts = require('gtts');
const uuid = require('uuid');
const models = require('../models');

class AudioController {
    async guardar(req, res) {
        const transaction = await models.sequelize.transaction();

        try {
            const documentoNameCifrado = req.file.filename;
            const pdfFilePath = path.join(__dirname, '../public/documentos', documentoNameCifrado);
            const fileBuffer = fs.readFileSync(pdfFilePath);
            const pdfData = await pdfParse(fileBuffer);
            const textoPlano = pdfData.text;
            const txtFileName = documentoNameCifrado.replace(/\.pdf$/, '.txt');
            const carpetaName = documentoNameCifrado.replace(/\.pdf$/, '');
            const txtFilePath = path.join(__dirname, '../public/documentos', txtFileName);
            fs.writeFileSync(txtFilePath, textoPlano);

            // Crear directorio de audio si no existe
            const audioDir = path.join(__dirname, `../public/audio/partes/${carpetaName}`);
            if (!fs.existsSync(audioDir)) {
                fs.mkdirSync(audioDir, { recursive: true });
            }

            const chunks = [];
            for (let i = 0; i < textoPlano.length; i += 4000) {
                chunks.push(textoPlano.substring(i, i + 4000));
            }

            // Convertir cada chunk a audio
            for (let index = 0; index < chunks.length; index++) {
                const mp3FileName = documentoNameCifrado.replace(/\.pdf$/, `_${index + 1}.mp3`);
                const mp3FilePath = path.join(audioDir, mp3FileName);
                const gttsInstance = new gtts(chunks[index], 'es');

                await new Promise((resolve, reject) => {
                    gttsInstance.save(mp3FilePath, (err) => {
                        if (err) {
                            return reject(new Error("Error al guardar el archivo MP3: " + err.message));
                        }
                        console.log("Archivo MP3 guardado con éxito en " + mp3FilePath);
                        resolve();
                    });
                });
            }

           // const audioNames = chunks.map((_, index) => documentoNameCifrado.replace(/\.pdf$/, `_${index + 1}.mp3`));

            const data = {
                id_entidad: req.body.id,
                nombre: req.body.nombre,
                nombre_cifrado: documentoNameCifrado,
                external_id: uuid.v4(),
                audio: {
                    tiempo_reproduccion: '0:00'
                },
            };
console.log(data);
            const nuevoDocumento = await models.documento.create(data, {
                include: [ { model: models.audio, as: "audio" }],
                transaction
            });

            await transaction.commit();
            return res.status(200).json({
                msg: "SE HAN REGISTRADO LOS DATOS CON ÉXITO",
                code: 200
            });

        } catch (error) {
            // Eliminación completa en caso de error
            try {
                if (req.file && req.file.path) {
                    fs.unlinkSync(path.join(__dirname, '../public/documentos', req.file.filename));
                    const txtFileName = req.file.filename.replace(/\.pdf$/, '.txt');
                    fs.unlinkSync(path.join(__dirname, '../public/documentos', txtFileName));
                    
                    const audioDir = path.join(__dirname, `../public/audio/partes/${req.file.filename.replace(/\.pdf$/, '')}`);
                    if (fs.existsSync(audioDir)) {
                        fs.rmdirSync(audioDir, { recursive: true });
                        console.log(`Carpeta de audio eliminada: ${audioDir}`);
                    }
                }
            } catch (cleanupError) {
                console.error("Error al limpiar archivos y carpetas:", cleanupError.message);
            }

            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }

            return res.status(400).json({
                msg: error.message || "Ha ocurrido un error en el servidor",
                code: 400
            });
        }
    }
}

module.exports = AudioController;
