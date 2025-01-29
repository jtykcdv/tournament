const matchesList = document.getElementById('matchesList');
const addMatchForm = document.getElementById('addMatchForm');
const filterForm = document.getElementById('filterForm');
const getAllMatchesBtn = document.getElementById('getAllMatches');

const API_URL = 'http://localhost:3000/matches';

// Fetch and display matches
const fetchMatches = async (url) => {
    try {
        const response = await fetch(url);
        const matches = await response.json();

        matchesList.innerHTML = matches.map(match => {
            const {
                country1 = 'N/A',
                country2 = 'N/A',
                result = '0-0',
                date = ''
            } = match;

            return `
                <li>
                    <strong>${country1} vs ${country2}</strong><br>
                    Date: ${date ? new Date(date).toLocaleDateString() : 'Unknown'}<br>
                    Result: ${result}
                </li>
            `;
        }).join('');
    } catch (error) {
        console.error('Error fetching matches:', error);
        matchesList.innerHTML = '<li>Error loading matches. Please try again.</li>';
    }
};

// Add a new match
addMatchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const match = {
        country1: document.getElementById('country1').value,
        country2: document.getElementById('country2').value,
        result: `${document.getElementById('homeGoals').value}-${document.getElementById('awayGoals').value}`,
        date: document.getElementById('date').value
    };

    // Validation to ensure all fields are filled
    if (!match.country1 || !match.country2 || !match.result || !match.date) {
        alert('All fields are required.');
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(match)
        });

        if (!response.ok) {
            throw new Error('Failed to add match');
        }

        alert('Match added successfully!');
        fetchMatches(API_URL); // Refresh the match list
        addMatchForm.reset();
    } catch (error) {
        console.error('Error adding match:', error);
        alert('An error occurred. Please try again.');
    }
});

// Filter matches by selected country
filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const country = document.getElementById('filterCountry').value;
    if (country === 'all') {
        fetchMatches(API_URL);
    } else {
        fetchMatches(`${API_URL}/filter/${country}`);
    }
});

// Load all matches
getAllMatchesBtn.addEventListener('click', () => fetchMatches(API_URL));

// Fetch all matches on page load
fetchMatches(API_URL);
