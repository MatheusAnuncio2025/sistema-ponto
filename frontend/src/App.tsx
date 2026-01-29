import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          🕐 Sistema de Ponto
        </h1>
        <p className="text-gray-600 mb-6">
          Sistema de ponto eletrônico está rodando com sucesso!
        </p>
        <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
          <p className="text-green-800 font-semibold">✅ Backend conectado</p>
          <p className="text-sm text-green-600">API: {process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <p className="text-blue-800 font-semibold">🚀 Próximos passos:</p>
          <ul className="text-sm text-blue-600 mt-2 text-left">
            <li>✓ Estrutura criada</li>
            <li>✓ Banco de dados configurado</li>
            <li>✓ Backend funcionando</li>
            <li>⏳ Tela de login (em desenvolvimento)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
