import React, { useState, useRef, useEffect } from 'react';
import '../css/style.css';
import { GuardarArchivos, peticionGet, peticionPut, URLBASE } from '../utilities/hooks/Conexion';
import { getToken, getUser } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import MenuBar from './MenuBar';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router';

const Extractor = () => {
      const navegation = useNavigate();
    const { external_id } = useParams();
    const [file, setFile] = useState(null);
    const [fileURL, setFileURL] = useState(null); // URL para visualizar el PDF
    const [loading, setLoading] = useState(false);
    const [audioComplete, setAudioComplete] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showPdf, setShowPdf] = useState(false); // Estado para controlar la visualización del PDF
    const [lastPlaybackTime, setLastPlaybackTime] = useState(0); // Tiempo guardado
    const audioRef = useRef(null);

    useEffect(() => {
        if (external_id && external_id !== "new") {
            setAudioComplete(`${URLBASE}audio/completo/${external_id}.mp3`);
            setFileURL(`${URLBASE}documentos/${external_id}.pdf`);
            peticionGet(getToken(), `audio/${external_id}`).then((info) => {
                if (info.code === 200) {
                    setLastPlaybackTime(parseFloat(info.info.tiempo_reproduccion));
                }
            });
        }

    }, [external_id]);

    useEffect(() => {
        if (audioRef.current && lastPlaybackTime > 0) {
            audioRef.current.currentTime = lastPlaybackTime;
        }
    }, [audioComplete, lastPlaybackTime]);

    useEffect(() => {
        if (!audioComplete) return;

        const intervalId = setInterval(() => {
            if (audioRef.current) {
                savePlaybackTime();
            }
        }, 10000); // Cada 10 segundos

        return () => clearInterval(intervalId); // Limpiar el intervalo al desmontar el componente
    }, [audioComplete, audioRef, external_id]);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        const pdfURL = URL.createObjectURL(selectedFile);
        setFileURL(pdfURL);
        setShowPdf(false);
    };

    const handleSave = () => {
        if (!file) {
            mensajes("No se ha seleccionado un archivo", 'error', 'Error');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('nombre', file.name);
        formData.append('documento', file);
        formData.append('id', getUser().user.id);

        GuardarArchivos(formData, getToken(), "/documento").then(info => {
            if (info.code !== 200) {
                mensajes(info.msg, 'error', 'Error');
                setLoading(false);
            } else {
                setAudioComplete(`${URLBASE}audio/completo/${info.info.nombre}.mp3`);
                setLoading(false);
                mensajes("Documento guardado con éxito");
                navegation(`/extraer/${info.info}`);
            }
        }).catch(error => {
            mensajes("Error al guardar el documento", 'error', 'Error');
            setLoading(false);
        });
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const changePlaybackRate = (event) => {
        const newRate = parseFloat(event.target.value);
        setPlaybackRate(newRate);
        if (audioRef.current) {
            audioRef.current.playbackRate = newRate;
        }
    };

    const skipTime = (seconds) => {
        audioRef.current.currentTime += seconds;
    };

    const savePlaybackTime = () => {
        const currentTime = audioRef.current.currentTime;
        const data = {
            tiempo_reproduccion: currentTime
        };
        peticionPut(getToken(), `audio/${external_id}`, data);
    };

    return (
        <div>
            <header>
                <MenuBar />
            </header>
            <main className="contenedor-centro">
                {loading ? (
                    <section className="cart">
                        <div className="loading">
                            <div className="pelotas"></div>
                            <div className="pelotas"></div>
                            <div className="pelotas"></div>
                            <span className="loading-text">Cargando...</span>
                        </div>
                    </section>
                ) : (
                    <section className="contenedor-carta-columna">
                        {audioComplete && (
                            <div className="audio-section">
                                <div className="card audio-card">
                                    <header className="titulo-primario">
                                        <h2>Reproducción de Audio</h2>
                                    </header>
                                    <div className="card-body">
                                        <div className="audio-container">
                                            <audio
                                                ref={audioRef}
                                                src={audioComplete}
                                                controls
                                                style={{ width: '70%' }}
                                            />
                                        </div>

                                        <div className="audio-controls">
                                            <button className="btn-positivoazul text-white" onClick={() => skipTime(-10)}>
                                                -10 segundos
                                            </button>
                                            <button className="btn-positivoazul text-white" onClick={togglePlayPause}>
                                                {isPlaying ? "Pausa" : "Play"}
                                            </button>
                                            <button className="btn-positivoazul text-white" onClick={() => skipTime(10)}>
                                                +10 segundos
                                            </button>
                                            <div className="playback-rate">
                                                <label htmlFor="playbackRate">Velocidad:</label>
                                                <select className="btn-positivoazul text-white" id="playbackRate" onChange={changePlaybackRate} value={playbackRate}>
                                                    <option value="0.25">x0.25</option>
                                                    <option value="0.5">x0.50</option>
                                                    <option value="0.75">x0.75</option>
                                                    <option value="1">Normal</option>
                                                    <option value="1.25">x1.25</option>
                                                    <option value="1.5">x1.50</option>
                                                    <option value="1.75">x1.75</option>
                                                    <option value="2">x2</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!audioComplete && (
                            <div className="file-upload-card">
                                <header className="titulo-primario">
                                    <h2>Carga tu documento PDF</h2>
                                </header>
                                <div className="card-body">
                                    <input type="file" onChange={handleFileChange} accept=".pdf" />
                                    <button className="btn-positivo text-white" type="submit" onClick={handleSave} disabled={!file}>
                                        EXTRAER
                                    </button>
                                </div>
                            </div>
                        )}

                        {fileURL && (
                            <button className="btn-positivo text-white" onClick={() => setShowPdf(!showPdf)}>
                                {showPdf ? "OCULTAR PDF" : "VER PDF"}
                            </button>
                        )}

                        {showPdf && fileURL && (
                            <div className="contenedor-carta">
                                <header className="titulo-primario">
                                    <h2>Vista previa del PDF</h2>
                                </header>
                                <div className="card-body">
                                    <iframe
                                        src={fileURL}
                                        title="Vista previa del PDF"
                                        width="100%"
                                        height="500px"
                                    ></iframe>
                                </div>
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

export default Extractor;
