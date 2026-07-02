const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

dotenv.config();
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

prisma.$connect()
  .then(() => console.log('✅ DB connected'))
  .catch(err => console.error('❌ DB Error:', err.message));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/', (req, res) => res.json({ message: 'Ande + Portal API', version: '4.0.0' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api', require('./routes/extended'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/clinicians', require('./routes/clinicians'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api', require('./routes/portal'));
app.use('/api', require('./routes/portalAdvanced'));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ error: 'Internal server error' }); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
