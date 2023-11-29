import React, { useState, FormEvent } from 'react';
import axios from 'axios';

const UserForm: React.FC = () => {
  const [query, setQuery] = useState('');
  const [consultaResult, setConsultaResult] = useState<string | null>(null);

  const handleConsulta = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.get<string>(`http://localhost:3000/user?query=${query}`);

      // Lide com a resposta da consulta
      const resultado = response.data;
      setConsultaResult(resultado);
    } catch (error) {
      console.error('Erro ao consultar CPF ou nome:', error);
     
    }
  };

  return (
    <div>
      <form onSubmit={handleConsulta}>
        <label>
          CPF ou Nome:
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <br />
        <button type="submit">Consultar</button>
      </form>

      {consultaResult !== null && (
        <div>
          <h3>Resultado da Consulta:</h3>
          <p>{consultaResult}</p>
        </div>
      )}
    </div>
  );
};

export default UserForm;