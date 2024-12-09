import React, { useState, useRef } from 'react';
import '../css/style.css';
import { GuardarArchivos, URLBASE } from '../utilities/hooks/Conexion';
import { getToken, getUser } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import MenuBar from './MenuBar';

const Principal = () => {
    const [file, setFile] = useState(null);
    const [fileURL, setFileURL] = useState(null); // URL para visualizar el PDF
    const [loading, setLoading] = useState(false);
    const [audioComplete, setAudioComplete] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const audioRef = useRef(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        const pdfURL = URL.createObjectURL(selectedFile);
        setFileURL(pdfURL);
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
            }
        }).catch(error => {
            console.error('Error al guardar el documento:', error);
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
        audioRef.current.playbackRate = newRate;
    };

    const skipTime = (seconds) => {
        audioRef.current.currentTime += seconds;
    };

    return (
        <div>
            <header>
                <MenuBar />
            </header>
            <main className="contenedor-centro">
                {loading ? (
                    <section className="contenedor-carta">
                        <aside className="cargando">
                            <div className="pelotas"></div>
                            <div className="pelotas"></div>
                            <div className="pelotas"></div>
                            <span className="texto-cargando">Cargando...</span>
                        </aside>
                    </section>
                ) : (
                    <section className="contenedor-carta">

                        <article className="col-md-6">
                            {audioComplete && (
                                <div className="card mb-3">
                                    <header className="titulo-primario ">
                                        <h2>Reproducción de Audio Completo</h2>
                                    </header>
                                    <div className="card-body">
                                        <div className="audio-container">
                                            <audio ref={audioRef} src={audioComplete} controls />
                                        </div>
                                        <nav className="audio-navigation">
                                            <button onClick={() => skipTime(-10)}>-10 segundos</button>
                                            <button onClick={togglePlayPause}>
                                                {isPlaying ? "Pausa" : "Play"}
                                            </button>
                                            <button onClick={() => skipTime(10)}>+10 segundos</button>
                                            <label htmlFor="playbackRate">Velocidad:</label>
                                            <select id="playbackRate" onChange={changePlaybackRate} value={playbackRate}>
                                                <option value="0.25">x0.25</option>
                                                <option value="0.5">x0.50</option>
                                                <option value="0.75">x0.75</option>
                                                <option value="1">Normal</option>
                                                <option value="1.25">x1.25</option>
                                                <option value="1.5">x1.50</option>
                                                <option value="1.75">x1.75</option>
                                                <option value="2">x2</option>
                                            </select>
                                        </nav>
                                    </div>
                                </div>
                            )}
                        </article>
                        <article className="col-md-6">
                            {!audioComplete && (
                                <div className="card mb-3">
                                    <header className="titulo-primario ">
                                        <h2>Arrastra o carga tu documento PDF</h2>
                                    </header>
                                    <div className="card-body">
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
                            {fileURL && (
                                <div className="card mb-3">
                                    <header className="titulo-primario ">
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
                        </article>
                    </section>
                )}
            </main>
        </div>
    );
};

export default Principal;
