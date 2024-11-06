import React, { useState, useEffect, useRef } from 'react';
import '../css/style.css';
import { GuardarArchivos, URLBASE } from '../utilities/hooks/Conexion';
import { getToken, getUser } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';

const Principal = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false); // Estado para la pantalla de carga
    const [audioParts, setAudioParts] = useState([]);
    const audioRef = useRef(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
    };

    const handleSave = () => {
        if (!file) {
            mensajes("No se ha seleccionado un archivo", 'error', 'Error');
            return;
        }

        setLoading(true); // Mostrar pantalla de carga

        const formData = new FormData();
        formData.append('nombre', file.name);
        formData.append('documento', file);
        formData.append('id', getUser().user.id);

        GuardarArchivos(formData, getToken(), "/documento").then(info => {
            if (info.code !== 200) {
                mensajes(info.msg, 'error', 'Error');
                setLoading(false);
            } else {
                const audioUrls = Array.from({ length: info.info.partes }, (_, index) => 
                    `${URLBASE}audio/partes/${info.info.nombre}/${info.info.nombre}_${index + 1}.mp3`
                );
                setAudioParts(audioUrls);
                setLoading(false); // Ocultar pantalla de carga
                mensajes("Documento guardado con éxito");
            }
        }).catch(error => {
            console.error('Error al guardar el documento:', error);
            mensajes("Error al guardar el documento", 'error', 'Error');
            setLoading(false);
        });
    };

    useEffect(() => {
        if (audioParts.length > 0) {
            const audio = audioRef.current;
            audio.src = audioParts[0];
            audio.play();
        }
    }, [audioParts]);

    const handleAudioEnd = () => {
        setAudioParts((prevAudioParts) => {
            const [, ...remainingParts] = prevAudioParts;
            return remainingParts;
        });
    };

    return (
        <div className="container-fluid principal-container">
            {loading ? (
                <div className="loading-screen">
                    <p>Cargando, por favor espera...</p>
                </div>
            ) : (
                <div className="row justify-content-center align-items-start min-vh-100">
                    <div className="col-md-6">
                        {!audioParts.length && (
                            <div className="card mb-3">
                                <div className="card-body">
                                    <h2>Arrastra o carga tu documento PDF</h2>
                                    <input type="file" onChange={handleFileChange} accept=".pdf" />
                                    <button
                                        className="btn btn-primary save-button"
                                        onClick={handleSave}
                                        disabled={!file}
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="col-md-6">
                        {audioParts.length > 0 && (
                            <div className="card mb-3">
                                <div className="card-body">
                                    <h2>Reproducción de Audio</h2>
                                    <div className="audio-container">
                                        <audio
                                            ref={audioRef}
                                            controls
                                            onEnded={handleAudioEnd} // Reproduce el siguiente audio al terminar
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Principal;
