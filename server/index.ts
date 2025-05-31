import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, query, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // 100 requests per minute
});

app.use(limiter);

// In-memory storage for incidents (replace with a database in production)
let incidents: Array<{
  id: string;
  user: string;
  action: string;
  timestamp: string;
}> = [];

// Simulation bot
const slipActions = [
  "slipped on a banana peel while dancing",
  "tried to juggle bananas and failed spectacularly",
  "mistook a banana for a phone",
  "used a banana as a boomerang",
  "attempted to eat a plastic banana",
];

const generateUsername = () => {
  const adjectives = ["Slippery", "Banana", "Yellow", "Peeled", "Tropical"];
  const nouns = ["Master", "Ninja", "Pro", "Expert", "King", "Queen"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}${noun}_${num}`;
};

setInterval(() => {
  const newIncident = {
    id: uuidv4(),
    user: generateUsername(),
    action: slipActions[Math.floor(Math.random() * slipActions.length)],
    timestamp: new Date().toISOString()
  };
  incidents.unshift(newIncident);
  // Keep only last 1000 incidents
  if (incidents.length > 1000) {
    incidents = incidents.slice(0, 1000);
  }
  console.log(`[Simulation] New incident: ${newIncident.user} ${newIncident.action}`);
}, 15000);

// GET /api/incidents
app.get('/api/incidents', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const start = (page - 1) * limit;
  const end = start + limit;

  const paginatedIncidents = incidents.slice(start, end);
  
  res.json({
    incidents: paginatedIncidents,
    page,
    limit,
    total: incidents.length
  });
});

// POST /api/incidents
app.post('/api/incidents', [
  body('user').isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_]+$/),
  body('action').isLength({ min: 1, max: 100 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { user, action } = req.body;
  const newIncident = {
    id: uuidv4(),
    user,
    action,
    timestamp: new Date().toISOString()
  };

  incidents.unshift(newIncident);
  res.status(201).json({ success: true, incident: newIncident });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});