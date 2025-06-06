import { useDraggable } from '@dnd-kit/core';

export default function Commande({ id, pizza, cmdId, nomPizza, nomClient, color, onClick,heureCreneau, onPayerEspeces,
  onPayerHiboutik, }) {
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


  const idCourt = cmdId.split('-')[1].padStart(3, '0')

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      style={style}
   className="relative rounded p-2 mb-1 text-sm leading-snug shadow cursor-move text-white"
     >{pizza.modePaiement.trim()!='non' && (
  <div className="absolute top-1 right-1 bg-green-600 text-white px-2 py-0.5 rounded text-xs shadow flex items-center gap-1">
    <span>💰</span>
    <span className="text-[10px] font-semibold">Payée</span>
  </div>
)}


      <div className="font-bold text-base">
        {nomClient?.toUpperCase() ?? 'CLIENT'} #{idCourt} / {nomPizza}
      </div>

      <div>- {pizza.taille?.toUpperCase()}, {pizza.base}</div>

      {(pizza.cuisson || pizza.option) && (
        <div className="flex flex-wrap gap-1 items-center mt-1">
          {pizza.cuisson && (
            <span className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-2 py-0.5 rounded-full">
              {pizza.cuisson}
            </span>
          )}
          {pizza.option && (
            <span className="bg-red-100 text-red-800 text-sm font-semibold px-2 py-0.5 rounded-full">
              {pizza.option}
            </span>
          )}
        </div>
      )}

      {pizza.supplements?.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center mt-1">
          {pizza.supplements.map((s, i) => (
            <span key={i} className="bg-green-100 text-green-800 text-sm font-medium px-2 py-0.5 rounded-full">
              {s.nom} ({s.portion})
            </span>
          ))}
        </div>
      )}

      {pizza.sousAliments?.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center mt-1">
          {pizza.sousAliments.map((s, i) => (
            <span key={i} className="bg-gray-200 text-gray-800 text-sm font-medium px-2 py-0.5 rounded-full">
              {s.ingredient} ({s.portion})
            </span>
          ))}
        </div>
      )}
 

  
    </div>
  );
}