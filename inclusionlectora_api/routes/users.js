var express = require('express');
var router = express.Router();
let jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');

const { body, validationResult,isDate } = require('express-validator');
const RolController = require('../controls/RolController');
var rolController = new RolController();
const EntidadController = require('../controls/EntidadController');
var entidadController = new EntidadController();
const CuentaController = require('../controls/CuentaController');
var cuentaController = new CuentaController();
const RolEntidadController = require('../controls/RolEntidadController');
var rolEntidadController = new RolEntidadController();
const DocumentoController = require("../controls/DocumnetoController");
var documentoController = new DocumentoController();
const AudioController = require("../controls/AudioController");
var audioController = new AudioController();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

var auth = function middleware(req, res, next) {
  const token = req.headers['x-api-token'];
  if (token) {
    require('dotenv').config();
    const llave = process.env.KEY;
    console.log(llave)
    jwt.verify(token, llave, async (err, decoded) => {
      if (err) {
        res.status(401);
        res.json({
          msg: "Token no valido",
          code: 401
        });
      } else {
        var models = require('../models');
        var cuenta = models.cuenta;
        req.decoded = decoded;
        let aux = await cuenta.findOne({ 
          where: { 
            external_id: req.decoded.external 
          } 
        })
        if (aux === null) {
          res.status(401);
          res.json({
            msg: "Token no valido o expirado",
            code: 401
          });
        } else {
          next();
        }
      }
    });
  } else {
    res.status(401);
    res.json({
      msg: "No existe token",
      code: 401
    });
  }

};

// GUARDAR IMAGENES 

// Función para crear configuraciones de almacenamiento de multer
const createStorage = (folderPath) => {
  return multer.diskStorage({
    destination: path.join(__dirname, folderPath),
    filename: (req, file, cb) => {
      console.log(file);
      const parts = file.originalname.split('.');
      const extension = parts[parts.length - 1];
      cb(null, uuid.v4() + "." + extension);
    }
  });
};

// Método para validar las extensiones de las fotografías
const extensionesAceptadasFoto = (req, file, cb) => {
  const allowedExtensions = ['.jpeg', '.jpg', '.png'];
  console.log(file);
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos JPEG, JPG y PNG.'), false);
  }
};

const extensionesAceptadasDocumentos = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.txt'];
  console.log(file);
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos pdf, doc y text.'), false);
  }
};

// Configuración de Multer con control de tamaño y tipo de archivo
const uploadFoto = (folderPath) => {
  const storage = createStorage(folderPath);
  return multer({
    storage: storage,
    fileFilter: extensionesAceptadasFoto,
    limits: {
      fileSize: 2 * 1024 * 1024  // 5MB
    }
  });
};

const uploadDocumentoTamano = (folderPath) => {
  const storage = createStorage(folderPath);
  return multer({
    storage: storage,
    fileFilter: extensionesAceptadasDocumentos,
    limits: {
      fileSize: 500 * 1024 * 1024  // 500MB
    }
  });
};


// Ejemplos de uso
const uploadFotoPersona = uploadFoto('../public/images/users');
const uploadDocumento = uploadDocumentoTamano('../public/documentos');




//INICIO DE SESION
router.post('/sesion', [
  body('correo', 'Ingrese un correo valido').exists().not().isEmpty().isEmail(),
  body('clave', 'Ingrese una clave valido').exists().not().isEmpty(),
], cuentaController.sesion)

//GET-ROL
router.get('/rol/listar', rolController.listar);

//POST ROL
router.post('/rol/guardar', rolController.guardar);

/*****ENTIDAD****/
router.post('/entidad/guardar', (req, res, next) => {
  uploadFotoPersona.single('foto')(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          msg: "El archivo es demasiado grande. Por favor, sube un archivo de menos de 2 MB.",
          code: 413
        });
      }
      return res.status(400).json({
        msg: "Error al cargar el archivo: " + error.message,
        code: 400
      });
    }
    entidadController.guardar(req, res, next);
  });
});

 router.post('/documento', (req, res, next) => {
  uploadDocumento.single('documento')(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          msg: "El archivo es demasiado grande. Por favor, sube un archivo de menos de 500 MB.",
          code: 413
        });
      }
      return res.status(400).json({
        msg: "Error al cargar el archivo: " + error.message,
        code: 400
      });
    }
    documentoController.guardar(req, res, next);
  });
});


router.get('/documento/:external_id', documentoController.obtener);
router.delete('/documento/:external_id', documentoController.eliminar);

router.put('/modificar/entidad', (req, res, next) => {
  uploadFotoPersona.single('foto')(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          msg: "El archivo es demasiado grande. Por favor, sube un archivo de menos de 2 MB.",
          code: 413
        });
      }
      return res.status(400).json({
        msg: "Error al cargar el archivo: " + error.message,
        code: 400
      });
    }
    entidadController.modificar(req, res, next);
  });
});
router.get('/listar/entidad', entidadController.listar);
router.get('/listar/entidad/activos', entidadController.listarActivos);
router.get('/obtener/entidad/:external',  entidadController.obtener);

router.get('/cuenta/:nombreCompleto',cuentaController.obtenerCuenta);


/** ROL_ENTIDAD */
router.get('/rol/entidad/listar', rolEntidadController.listar);
router.post('/asignar/lideres', rolEntidadController.asignarLideres);
router.get('/rol/entidad/obtener/lider', rolEntidadController.obtenerLider);
router.get('/rol/entidad/obtener/administrador', rolEntidadController.obtenerAdministrador);

/*    AUDIO  */
router.put('/audio/:external_id', audioController.guardar);
router.get('/audio/:external_id', audioController.obtener);

module.exports = router;  