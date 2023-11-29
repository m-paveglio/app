import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const LoginForm: React.FC = () => {
  const [cpf, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const UseNavigate = useNavigate();


  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post<{ token: string }>('http://localhost:3000/auth/login', {
        cpf,
        password,
      });
      UseNavigate ('/Dashboard')
      const token = response.data.token;
      
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };

  return (

    
    <div className="login-container">
    <form onSubmit={handleLogin} className="login-form">
      <label>
        CPF:
        <input type="text" value={cpf} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <br />
      <label>
        Password:
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <br />
      <button type="submit">Login</button>
    </form>
  </div>
  );
};

export default LoginForm;
