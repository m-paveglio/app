import React, { useState } from 'react';

interface DashboardProps {
  username: string; // Propriedade para o nome do usuário
}

const Dashboard: React.FC<DashboardProps> = ({ username }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    // Lógica de pesquisa aqui...
    console.log(`Realizando pesquisa para: ${searchTerm}`);
  };

  return (
    <div>
      {/* Navbar */}
      <nav>
        <div>
          <span>Bem-vindo, {username}!</span>
        </div>
        {/* Outros elementos da navbar... */}
      </nav>

      {/* Conteúdo do Dashboard */}
      <div style={{ display: 'flex' }}>
        {/* Coluna de Pesquisa */}
        <div style={{ width: '30%', padding: '20px' }}>
          <h2>Coluna de Pesquisa</h2>
          <input
            type="text"
            placeholder="Digite sua pesquisa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>Pesquisar</button>
        </div>

        {/* Outras Seções do Dashboard */}
        <div style={{ flex: 1, padding: '20px' }}>
          <h2>Outras Seções</h2>
          {/* Conteúdo das outras seções... */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;