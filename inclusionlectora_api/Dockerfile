# Usa una imagen base de Node.js 22
FROM node:22

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Instala FFmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copia los archivos de configuración de tu proyecto
COPY package.json package-lock.json ./

# Instala las dependencias de Node.js
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto que utiliza tu aplicación
EXPOSE 3007

# Comando por defecto para ejecutar tu aplicación
CMD ["npm", "start"]
