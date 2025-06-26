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

export function getCreneauxDisponibles(
  commandes,
  listeCreneaux,
  nombrePizzas,
  pizzasParQuart,
  pizzaDeltaMax,
  heureActuelle,
  estModification = false,
  creneauInitial = null
) {
  console.log('🔍 Appel getCreneauxDisponibles avec :');
  console.log('🕒 heureActuelle :', heureActuelle);
  console.log('📦 commandes :', commandes);
  console.log('🗓️ listeCreneaux :', listeCreneaux);
  console.log('🍕 nombrePizzas :', nombrePizzas);
  console.log('🎯 Quota / Delta :', pizzasParQuart, pizzaDeltaMax);
  console.log('✏️ Mode modification :', estModification, '| Créneau initial :', creneauInitial);

  const resultat = listeCreneaux
    .filter(cr => {
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

      if (possible) {
        console.log(`✅ ${cr} : ${placesRestantes} places restantes`);
        return true;
      }

      if (estModification && cr === creneauInitial) {
        console.log(`⚠️ ${cr} conservé malgré surcharge (modification en cours)`);
        return true;
      }

      console.log(`❌ ${cr} : surcharge (${placesRestantes} restants)`);
      return false;
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