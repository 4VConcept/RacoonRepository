// eslint-disable-next-line no-undef
require('dotenv').config(); // charge les variables depuis .env
// eslint-disable-next-line no-undef
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const diagnosticRoute = require('./routes/diagnostic');

const verifierCodeRoute = require('./routes/verifierCode');
const commandesRoute = require('./routes/commandes');
const parametresRoute = require('./routes/parametres');

const logRoutes = require('./routes/logRoutes');
const pizzasRoutes = require('./routes/pizzas');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:5173', // ton app React
  credentials: true,
}));
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/diagnostic', diagnosticRoute);
app.use('/api/verifier-code-admin', verifierCodeRoute);
app.use('/api/commandes', commandesRoute);
app.use('/api/parametres', parametresRoute);
app.use('/api/logs', logRoutes);
app.use('/api/pizzas', pizzasRoutes);

/*app.get('/test', (req, res) => {
  res.send('API en ligne ✅');
});*/
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});