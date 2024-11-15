// SobreNosotros.js
import React from 'react';
import '../css/style.css';
import MenuBar from './MenuBar';

const SobreNosotros = () => {
  return (
    <div>
        <header>
                <MenuBar />
            </header>
    <div className="fondo-principal">
        <div className="contenedor-carta-columna">
          <header className="titulo-primario">
            <h1>Sobre Nosotros</h1>
          </header>

          <section className="content-container">
            <h2 className="titulo-secundario">Nuestra Historia</h2>
            <p className="texto-normal">
              Fundada en 2020, nuestra empresa ha crecido rápidamente gracias a nuestra dedicación y compromiso con la excelencia.
              Nos esforzamos por ofrecer servicios de alta calidad y superar las expectativas de nuestros clientes.
            </p>

            <h2 className="titulo-secundario">Valores</h2>
            <ul>
              <li className="texto-normal"><strong>Innovación:</strong> Nos apasiona la creatividad y las ideas frescas para resolver problemas.</li>
              <li className="texto-normal"><strong>Compromiso:</strong> Trabajamos incansablemente para cumplir con nuestros objetivos y satisfacer a nuestros clientes.</li>
              <li className="texto-normal"><strong>Integridad:</strong> Actuamos con transparencia, honestidad y responsabilidad en todo lo que hacemos.</li>
            </ul>

            <h2 className="titulo-secundario">Nuestro Equipo</h2>
            <p className="texto-normal">
              Contamos con un equipo diverso de profesionales que aportan experiencia y conocimientos en múltiples áreas. 
              Juntos, formamos una red de personas apasionadas y comprometidas en hacer la diferencia.
            </p>
          </section>

          <footer className="about-us-footer">
            <p className="texto-normal">© {new Date().getFullYear()} Nuestra Empresa. Todos los derechos reservados.</p>
          </footer>
        </div>
      </div>
    </div> 
  );
};

export default SobreNosotros;
