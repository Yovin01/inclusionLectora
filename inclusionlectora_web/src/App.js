import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './fragment/Login';
import Registrar from './fragment/Registrar';
import Perfil from './fragment/Perfil';
import ListaUsuarios from './fragment/ListaUsuarios';
import Principal from './fragment/Principal';
import Dashboard from './fragment/Dashboard';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='*' element={<Navigate to='/login' />} />
        <Route path='/registrar' element={<Registrar />} />
        <Route path='/login' element={<Login />} />
        <Route path='/extraer' element={<Principal />} />
        <Route path='/perfil' element={<Perfil />} />
        <Route path='/usuarios' element={<ListaUsuarios />} />
        <Route path='/bashboard' element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
