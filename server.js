const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect('mongodb://mongo:27017/project_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Define Schema and Model
const MatchSchema = new mongoose.Schema({
    country1: String,
    country2: String,
    score1: Number,
    score2: Number,
    date: Date,
});
const Match = mongoose.model('Match', MatchSchema);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/matches', async (req, res) => {
    const matches = await Match.find();
    res.json(matches);
});

app.post('/matches', async (req, res) => {
    const match = new Match(req.body);
    await match.save();
    res.status(201).json(match);
});

// Delete a match by ID
app.delete('/matches/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await Match.findByIdAndDelete(id);
        if (result) {
            res.status(200).json({ message: 'Match deleted successfully' });
        } else {
            res.status(404).json({ message: 'Match not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting match', error });
    }
});

// Get matches by country
app.get('/matches/:country', async (req, res) => {
    const { country } = req.params;

    try {
        const matches = await Match.find({ $or: [{ country1: country }, { country2: country }] });
        res.status(200).json(matches);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching matches', error });
    }
});

app.get('/matches/team/:teamName', async (req, res) => {
    const { teamName } = req.params;
    try {
        const matches = await Match.find({
            $or: [{ country1: teamName }, { country2: teamName }],
        });
        res.json(matches);
    } catch (err) {
        res.status(500).send('Error fetching matches');
    }
});







app.get('/matches/team/:team/average-goals', async (req, res) => {
    const { team } = req.params;

    try {
        const matches = await Match.find({
            $or: [{ country1: team }, { country2: team }]
        });

        if (matches.length === 0) {
            return res.status(200).json({ averageGoals: 0 });
        }

        // Calculate total goals scored in the matches
        const totalGoals = matches.reduce((sum, match) => {
            const goalsByTeam = (match.country1 === team ? match.score1 : match.score2);
            return sum + goalsByTeam;
        }, 0);

        const averageGoals = totalGoals / matches.length;
        res.status(200).json({ averageGoals });
    } catch (error) {
        res.status(500).json({ message: 'Error calculating average goals', error });
    }
});



// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
