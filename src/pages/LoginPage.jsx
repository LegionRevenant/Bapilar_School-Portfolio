import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        setErrorMsg(errData.error || 'Login failed');
        return;
      }

      const user = await response.json();

      localStorage.setItem('authenticated', 'true');
      localStorage.setItem('userEmail', user.email);
      navigate('/Dashboard');
    } catch (error) {
      setErrorMsg('Network error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-full h-full bg-[url('src/assets/Bgimage.jpg')] bg-cover bg-center opacity-90" />
        <div className="absolute inset-0 bg-blue-900/50 backdrop-blur-sm" />
      </div>

      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">AQUA ALIGNED</h1>
          <p className="text-blue-800 mt-2">Water Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <p className="text-red-600 text-sm text-center">{errorMsg}</p>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 bg-white/50"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 bg-white/50"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
