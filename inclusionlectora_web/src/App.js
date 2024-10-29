import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './fragment/Login';
import Registrar from './fragment/Registrar';
import Main from './fragment/Main';
import Perfil from './fragment/Perfil';
import ListaUsuarios from './fragment/ListaUsuarios';
import RolMenu from './fragment/RolMenu';
import LayoutComponent from './fragment/LayoutComponent';
import MenuBar from "./fragment/MenuBar";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='*' element={<Navigate to='/login' />} />
        <Route path='/login' element={<Login />} />

          <Route path='/registrar' element={<Registrar />} />
          <Route path='/perfil' element={<Perfil />} />
          <Route path='/usuarios' element={<ListaUsuarios />} />
          <Route path="/proyecto/:external_id" element={<RolMenu />} />
   
      </Routes>
    </div>
  );
}

export default App;
