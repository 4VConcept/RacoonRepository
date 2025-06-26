import { useDraggable } from '@dnd-kit/core';

export default function Commande({ id, pizza, cmdId, nomPizza, nomClient, color, onClick,heureCreneau, onPayerEspeces,
  onPayerHiboutik,afficherNomClient = true, onAfficherDetail }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    backgroundColor: color,
  };

  
const [heureStr, minutesStr] = (pizza?.creneauId ?? '').split(':');
// Heure actuelle en Guadeloupe
const maintenant = new Date().toLocaleString('en-US', { timeZone: 'America/Guadeloupe' });
const now = new Date(maintenant);

// Création d'une date "aujourd'hui" avec les heures/minutes du créneau
const creneau = new Date(now); // clone de "now"
creneau.setHours(parseInt(heureStr || 0, 10), parseInt(minutesStr || 0, 10), 0, 0);

// Calcul de la différence en minutes
const differenceEnMinutes = (creneau - now) / 60000;
const autoriserModif = differenceEnMinutes >= 15;


  const idCourt = cmdId.split('-')[1].padStart(3, '0');
  const lettreTaille = pizza?.taille?.charAt(0).toUpperCase() ?? '';

console.log('🧾 Commentaire pour', cmdId, ':', pizza.commentaire);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      style={style}
   className="relative rounded p-2 mb-1 text-sm leading-snug shadow cursor-move text-black"
     >
 <div className="absolute top-1 right-1 flex items-center gap-1">
  
  {afficherNomClient && (
    <button
      onDoubleClick={(e) => {
        e.stopPropagation();
        onAfficherDetail?.();
      }}
      className="bg-white text-gray-800 hover:text-orange-500 text-xl font-bold p-1 rounded shadow transition"
      title="Voir les détails"
    >
      🔍
    </button>
  )}





  {(pizza?.modePaiement || '').trim().toLowerCase() !== 'non' && (
    <div className="bg-green-600 text-white px-2 py-0.5 rounded text-xs shadow flex items-center gap-1">
      <span>💰</span>
      <span className="text-[10px] font-semibold">Payée</span>
    </div>
  )}

  
</div>




     <div className="font-bold text-base flex items-center gap-1">
  {pizza.commentaire?.trim() && (
    <span className="animate-clignote text-red-600 text-xl leading-none">⚠️</span>
  )}
  {afficherNomClient ? `${nomClient?.toUpperCase() ?? 'CLIENT'} - ` : ''}
  {lettreTaille} {nomPizza}
</div>



      <div>Base : {pizza.base}</div>

      {(pizza.cuisson || (Array.isArray(pizza.options) && pizza.options.length > 0)) && (
  <div className="flex flex-wrap gap-1 items-center mt-1">
    {pizza.cuisson && (
      <span className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-2 py-0.5 rounded-full">
        {pizza.cuisson}
      </span>
    )}

    {pizza.options.map?.((opt, i) => (
      <span
        key={i}
        className="bg-pink-50 text-pink-800 text-sm font-medium px-3 py-1 rounded-full border border-pink-200"
      >
        {opt}
      </span>
    ))}
  </div>
)}



 {pizza.supplements?.length > 0 && (
  <div className="flex flex-wrap gap-1 items-center mt-1">
    {pizza.supplements
      .filter((s) => s.description && s.description.trim() !== '')
      .map((s, i) => {
        const portion = s.portion?.toLowerCase();
        const estMoitié = portion === 'moitié';

        return (
          <span key={i} className="bg-green-100 text-green-800 text-sm font-medium px-2 py-0.5 rounded-full">
            {s.description.toUpperCase()}
            {estMoitié && ' (moitié)'}
          </span>
        );
      })}
  </div>
)}



  {pizza.sousAliments?.length > 0 && (
  <div className="flex flex-wrap gap-1 items-center mt-1">
    {pizza.sousAliments.map((s, i) => {
      const portion = s.portion?.toLowerCase();
      const estMoitie = portion === 'moitié';

      return (
        <span
          key={i}
          className="bg-red-100 text-red-800 text-sm font-medium px-2 py-0.5 rounded-full border border-red-200"
        >
          🚫 {(s.description || s.ingredient)?.toUpperCase()}
          {estMoitie && ' (moitié)'}
        </span>
      );
    })}
  </div>
)}


 

  
    </div>
  );
}