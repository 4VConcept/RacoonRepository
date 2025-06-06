// utils/creneauUtils.js

export function compterPizzasDansCreneau(commandes, creneau) {
  return (commandes[creneau] || []).reduce(
    (total, cmd) => total + cmd.pizzas.length,
    0
  );
}

export function peutAccommoder(nbPizzas, creneau, commandes, quotas, delta) {
  const pizzasDeja = compterPizzasDansCreneau(commandes, creneau);
  return (pizzasDeja + nbPizzas) <= (quotas[creneau] + delta);
}

export function trouverCreneauDisponible(nbPizzas, commandes, quotas, delta, listeCreneaux) {
  for (const creneau of listeCreneaux) {
    if (peutAccommoder(nbPizzas, creneau, commandes, quotas, delta)) {
      return creneau;
    }
  }
  return null;
}

export function trouverPremierCreneauDisponible(commandes, listeCreneaux, nombrePizzasDemandees, pizzasParQuart, pizzaDeltaMax) {
  for (const creneau of listeCreneaux) {
    const creneauActuel = creneau.time || creneau; // permet compatibilité avec objets ou strings

    const totalPizzasDansCreneau = (commandes[creneauActuel] || [])
      .reduce((total, cmd) => total + (cmd.pizzas?.length || 0), 0);

    if (totalPizzasDansCreneau + nombrePizzasDemandees <= pizzasParQuart + pizzaDeltaMax) {
      return creneauActuel;
    }
  }

  return null; // aucun créneau disponible
}

export function getCreneauxDisponibles(commandes, listeCreneaux, nombrePizzas, pizzasParQuart, pizzaDeltaMax, heureActuelle) {
  console.log('🔍 Appel getCreneauxDisponibles avec :');
  console.log('🕒 heureActuelle :', heureActuelle);
  console.log('📦 commandes :', commandes);
  console.log('🗓️ listeCreneaux :', listeCreneaux);
  console.log('🍕 nombrePizzas :', nombrePizzas);
  console.log('🎯 Quota / Delta :', pizzasParQuart, pizzaDeltaMax);

  const resultat = listeCreneaux
    .filter(cr => {
      // Ignorer les créneaux passés
      if (cr < heureActuelle) {
        console.log(`⛔ ${cr} ignoré car passé`);
        return false;
      }

      const pizzasDansCreneau = (commandes[cr] || []).reduce(
        (total, cmd) => total + (cmd.pizzas?.length || 0),
        0
      );

      const placesRestantes = (pizzasParQuart + pizzaDeltaMax) - pizzasDansCreneau;
      const possible = placesRestantes >= nombrePizzas;

      console.log(`➡️ ${cr} : ${pizzasDansCreneau} pizzas dans ce créneau, ${placesRestantes} places restantes — ${possible ? '✅ OK' : '❌ Trop plein'}`);
      return possible;
    })
    .map(cr => {
      const pizzasDansCreneau = (commandes[cr] || []).reduce(
        (total, cmd) => total + (cmd.pizzas?.length || 0),
        0
      );
      const placesRestantes = (pizzasParQuart + pizzaDeltaMax) - pizzasDansCreneau;
      return { time: cr, placesRestantes };
    });

  console.log('✅ Résultat final :', resultat);
  return resultat;
}
