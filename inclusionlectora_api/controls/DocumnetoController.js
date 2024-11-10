const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const gtts = require('gtts');
const uuid = require('uuid');
const { exec } = require('child_process');
const models = require('../models');

class DocumentoController {
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

            const audioDir = path.join(__dirname, `../public/audio/partes/${carpetaName}`);
            if (!fs.existsSync(audioDir)) {
                fs.mkdirSync(audioDir, { recursive: true });
            }

            const chunks = [];
            for (let i = 0; i < textoPlano.length; i += 4000) {
                chunks.push(textoPlano.substring(i, i + 4000));
            }

            const audioFilePaths = [];
            for (let batchStart = 0; batchStart < chunks.length; batchStart += 50) {
                const batchPromises = [];

                for (let index = batchStart; index < Math.min(batchStart + 50, chunks.length); index++) {
                    const mp3FileName = documentoNameCifrado.replace(/\.pdf$/, `_${index + 1}.mp3`);
                    const mp3FilePath = path.join(audioDir, mp3FileName);
                    audioFilePaths.push(mp3FilePath);
                    const gttsInstance = new gtts(chunks[index], 'es');
                    const saveAudioPromise = new Promise((resolve, reject) => {
                        gttsInstance.save(mp3FilePath, (err) => {
                            if (err) {
                                return reject(new Error("Error al guardar el archivo MP3: " + err.message));
                            }
                            resolve();
                        });
                    });

                    batchPromises.push(saveAudioPromise);
                }

                await Promise.all(batchPromises);
            }
            console.log(audioFilePaths);

            // Concatenar los archivos MP3 en un solo archivo con ffmpeg
            const combinedAudioPath = path.join(__dirname, "../public/audio/completo", `${carpetaName}.mp3`);
            const fileListPath = path.join(__dirname, `../public/audio/partes/${carpetaName}_filelist.txt`);
            
            // Crear un archivo de texto que lista todos los archivos MP3 para la concatenación
            fs.writeFileSync(fileListPath, audioFilePaths.map(filePath => `file '${filePath}'`).join('\n'));

            await new Promise((resolve, reject) => {
                const ffmpegCommand = `ffmpeg -f concat -safe 0 -i "${fileListPath}" -c copy "${combinedAudioPath}"`;
                exec(ffmpegCommand, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Error al combinar audios:', error.message);
                        return reject(new Error('Error al combinar audios con ffmpeg'));
                    }
                    console.log('Audio combinado creado en:', combinedAudioPath);
                    resolve();
                });
            });

            const data = {
                id_entidad: req.body.id,
                nombre: req.body.nombre,
                nombre_cifrado: carpetaName,
                external_id: uuid.v4(),
                audio: {
                    tiempo_reproduccion: '0:00'
                },
            };
            const nuevoDocumento = await models.documento.create(data, {
                include: [{ model: models.audio, as: "audio" }],
                transaction
            });
            const respuesta = {
                partes: chunks.length,
                nombre: carpetaName
            };
            await transaction.commit();
            return res.status(200).json({
                msg: "SE HAN REGISTRADO LOS DATOS CON ÉXITO",
                code: 200, info: respuesta
            });

        } catch (error) {
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

module.exports = DocumentoController;
