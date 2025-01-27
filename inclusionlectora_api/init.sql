use inclusionlectora_db;
INSERT INTO rol (id, external_id, estado, nombre, createdAt, updatedAt) VALUES
         (1, '1376cf7e-908c-11ef-8f4d-30e37a2aa82d', 1, 'ADMINISTRADOR', '2024-10-19 05:30:36', '2024-10-19 05:30:36'),
         (2, '1376cf7e-901c-11ef-8f4d-30e37a2aa83d', 1, 'USUARIO', '2024-10-19 05:30:36', '2024-10-19 05:30:36');


         INSERT INTO entidad (id, external_id, estado, foto, nombres, apellidos, fecha_nacimiento, telefono, createdAt, updatedAt) 
         VALUES 
         (1, '93a9e3f1-907c-11ef-8f4d-30e37a2aa82d', 1, 'USUARIO_ICONO.png', 'ADMIN', 'ADMIN', '2003-12-05 00:00:00', '0980735353', '2024-10-22 08:50:19', '2024-10-22 08:50:19'),
         (2, '93a9e97e-908c-11ef-8f4d-30e37a2aa82d', 1, 'USUARIO_ICONO.png', 'YOVIN STIVEN', 'URREGO GOMEZ', '1995-08-15 00:00:00', '0987654321', '2024-10-22 08:50:19', '2024-10-22 08:50:19');

         INSERT INTO cuenta (id, external_id, estado, correo, clave, createdAt, updatedAt, id_entidad) 
         VALUES 
           (1, '594760f1-907e-11ef-8f4d-30e37a2aa82e', 1, 'admin@unl.edu.ec', '$2a$08$vcbwdzAoBjH027Yt6B9PwO3G65afLhrMfejne1EJ7uoPGuLslHLC6', '2024-10-22 09:03:00', '2024-10-22 09:03:00', 1),
         (2, '594760f1-907e-11ef-8f4d-30e37a2aa82d', 1, 'yovin.urrego@unl.edu.ec', '$2a$08$vcbwdzAoBjH027Yt6B9PwO3G65afLhrMfejne1EJ7uoPGuLslHLC6', '2024-10-22 09:03:00', '2024-10-22 09:03:00', 1);     INSERT INTO rol_entidad (external_id, estado, createdAt, updatedAt, id_rol,id_entidad)
         VALUES 
         ('a1b2c3d4-e5f6-7890-1234-56789abcdef0', 1, NOW(), NOW(), 1, 1),
         ('a1b2c3d4-e5f7-7890-1234-56789abcdef1', 1, NOW(), NOW(), 2, 2);