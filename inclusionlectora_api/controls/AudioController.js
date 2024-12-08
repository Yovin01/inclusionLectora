const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const gtts = require('gtts');
const uuid = require('uuid');
const models = require('../models');

class AudioController {
    async guardar(req, res) {
        try {
            const audio = await models.audio.findOne({
                where: {
                    external_id: req.params.external_id
                }
            })
            audio.tiempo_reproduccion = req.body.tiempo_reproduccion;
            await audio.save();
        } catch (error) {
            console.error("Error en el servidor:", error);
            return res.status(400).json({ msg: "Error en el servidor", error, code: 400 });
        }
    }

    async obtener(req, res) {
        try {
            const audio = await models.audio.findOne({
                where: {
                    external_id: req.params.external_id
                }
            })
            return res.status(200).json({code: 200, info: audio});
        } catch (error) {
            console.error("Error en el servidor:", error);
            return res.status(400).json({ msg: "Error en el servidor", error, code: 400 });
        }
    }
}

module.exports = AudioController;
