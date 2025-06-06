export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans px-4 py-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">🎉 Bienvenue sur le tableau de bord Racoon Pizza</h1>
        <p className="text-lg text-gray-300">
          Vous êtes connecté. Cette interface vous donnera bientôt accès à toutes les fonctionnalités de gestion.
        </p>

        <button
          onClick={() => {
            localStorage.removeItem('isLoggedIn');
            window.location.href = '/';
          }}
          className="mt-10 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}