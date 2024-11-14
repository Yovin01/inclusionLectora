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
    
            // Recorta el nombre si tiene más de 80 caracteres
            if (req.body.nombre.length > 80) {
                req.body.nombre = req.body.nombre.substring(0, 76) + ".pdf";
            }
    
            if (!fs.existsSync(audioDir)) {
                fs.mkdirSync(audioDir, { recursive: true });
            }
    
            const chunks = [];
            for (let i = 0; i < textoPlano.length; i += 4000) {
                chunks.push(textoPlano.substring(i, i + 4000));
            }
    
            // Función para guardar el archivo de audio con reintentos
            const saveAudioWithRetries = async (gttsInstance, filePath, retries = 3) => {
                for (let attempt = 1; attempt <= retries; attempt++) {
                    try {
                        await new Promise((resolve, reject) => {
                            gttsInstance.save(filePath, (err) => {
                                if (err) return reject(new Error("Error al guardar el archivo MP3: " + err.message));
                                resolve();
                            });
                        });
                        return;
                    } catch (error) {
                        console.error(`Intento ${attempt} de guardar archivo fallido para: ${filePath}. Error: ${error.message}`);
                        if (attempt === retries) throw error;
                    }
                }
            };
    
            // Función para procesar en lotes de 50 archivos
            const guardarAudioPorLotes = async (chunks, documentoNameCifrado, audioDir, batchSize = 50) => {
                const audioFilePaths = [];
    
                for (let batchStart = 0; batchStart < chunks.length; batchStart += batchSize) {
                    const batchPromises = [];
    
                    for (let index = batchStart; index < Math.min(batchStart + batchSize, chunks.length); index++) {
                        const mp3FileName = documentoNameCifrado.replace(/\.pdf$/, `_${index + 1}.mp3`);
                        const mp3FilePath = path.join(audioDir, mp3FileName);
                        audioFilePaths.push(mp3FilePath);
                        const gttsInstance = new gtts(chunks[index], 'es');
    
                        const savePromise = saveAudioWithRetries(gttsInstance, mp3FilePath, 3);
                        batchPromises.push(savePromise);
                    }
    
                    await Promise.all(batchPromises);
                    console.log(`Lote de ${batchPromises.length} archivos completado.`);
                }
    
                return audioFilePaths;
            };
    
            const audioFilePaths = await guardarAudioPorLotes(chunks, documentoNameCifrado, audioDir);
    
            console.log(audioFilePaths);
    
            const combinedAudioPath = path.join(__dirname, "../public/audio/completo", `${carpetaName}.mp3`);
            const fileListPath = path.join(__dirname, `../public/audio/partes/${carpetaName}_filelist.txt`);
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
                external_id: carpetaName,
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
    
            if (fs.existsSync(audioDir)) {
                fs.rmdirSync(audioDir, { recursive: true });
                console.log(`Carpeta de audio eliminada: ${audioDir}`);
            }
            if (fs.existsSync(fileListPath)) fs.unlinkSync(fileListPath);
    
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
        async obtener(req, res) {
        try {

            const externalId = req.params.external_id;
            const documentos = await models.documento.findAll({
                where: { id_entidad: externalId },
                attributes: ['nombre', 'external_id','createdAt'],
            });
    
            if (!documentos || documentos.length === 0) {
                return res.status(404).json({
                    msg: "No se encontraron documentos",
                    code: 404
                });
            }
    
            return res.status(200).json({
                msg: "Documentos obtenidos con éxito",
                code: 200,
                info: documentos
            });
        } catch (error) {
            return res.status(500).json({
                msg: "Error al obtener los documentos",
                code: 500
            });
        }
    }
    async eliminar(req, res) {
        const transaction = await models.sequelize.transaction();
    
        try {
            const externalId = req.params.external_id;
            const documento = await models.documento.findOne({
                where: { external_id: externalId },
                include: [{ model: models.audio, as: 'audio' }]
            });
    
            if (!documento) {
                return res.status(404).json({
                    msg: "Documento no encontrado",
                    code: 404
                });
            }
    
            const documentoNameCifrado = documento.nombre_cifrado;
            const pdfPath = path.join(__dirname, '../public/documentos', `${documentoNameCifrado}.pdf`);
            const txtPath = path.join(__dirname, '../public/documentos', `${documentoNameCifrado}.txt`);
            const audioDir = path.join(__dirname, `../public/audio/partes/${documentoNameCifrado}`);
            const combinedAudioPath = path.join(__dirname, "../public/audio/completo", `${documentoNameCifrado}.mp3`);
    
            await documento.destroy({ transaction });
    
            if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
            if (fs.existsSync(txtPath)) fs.unlinkSync(txtPath);
            if (fs.existsSync(audioDir)) fs.rmdirSync(audioDir, { recursive: true });
            if (fs.existsSync(combinedAudioPath)) fs.unlinkSync(combinedAudioPath);
    
            await transaction.commit();
    
            return res.status(200).json({
                msg: "Documento eliminado con éxito",
                code: 200
            });
        } catch (error) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
    
            return res.status(500).json({
                msg: "Error al eliminar el documento",
                code: 500
            });
        }
    }
        
}

module.exports = DocumentoController;
