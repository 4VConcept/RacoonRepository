// src/components/TopHeader.jsx
import { useEffect, useState } from 'react';


function getTodayDate() {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

export default function TopHeader() {
  const email = localStorage.getItem('userEmail') || 'admin@racoon.fr';
const [apiStatus, setApiStatus] = useState(null);

useEffect(() => {
  const checkHiboutikStatus = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/diagnostic`);
      const data = await res.json();
      setApiStatus(data.success);
    } catch {
      setApiStatus(false);
    }
  };

  checkHiboutikStatus(); // 🔁 appel unique au chargement
}, []);

  return (
    <div className="flex justify-between items-center bg-gray-800 px-6 py-3 rounded-xl shadow mb-6">
      <div className="text-sm text-gray-300">
        👤 Connecté : <span className="font-semibold text-white">{email}</span>
      </div>

    {apiStatus !== null && (
  <div className={`flex items-center gap-2 text-sm ml-6 ${apiStatus ? 'text-green-400' : 'text-red-400'}`}>
    <span className={`ml-6 w-3 h-3  rounded-full ${apiStatus ? 'bg-green-400' : 'bg-red-400'}`}></span>
    <span>{apiStatus ? 'API connectée' : 'API indisponible'}</span>
  </div>
)}
    </div>
  );
}
