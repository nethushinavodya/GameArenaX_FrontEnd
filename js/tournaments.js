/*
let currentTournament = null; // store selected tournament
const tournamentsMap = new Map(); // keep all tournaments for lookup

// ===================== Load & Display Upcoming Tournaments =====================
function loadUpcomingTournaments() {
    $.ajax({
        url: 'http://localhost:8080/api/v1/tournament/getUpcomingTournaments',
        method: 'GET',
        dataType: 'json',
        success: res => generateTournamentCards(res),
        error: err => console.error('Error fetching tournaments:', err)
    });
}

// ===================== Fetch Participants by Tournament ID =====================
function fetchParticipantsCount(tournamentId) {
    const token = localStorage.getItem('token');
    return $.ajax({
        url: `http://localhost:8080/api/v1/tournament-participant/getParticipantsByTournamentId?tournamentId=${tournamentId}`,
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token }
    });
}

// ===================== Generate Tournament Cards =====================
function generateTournamentCards(response) {
    const container = document.getElementById('tournament-grid');
    if (!container) return;
    const tournaments = Array.isArray(response.data) ? response.data : [];

    container.innerHTML = tournaments.length
        ? ''
        : '<p class="text-gray-400">No upcoming tournaments.</p>';

    tournaments.forEach(t => {
        tournamentsMap.set(t.id, t); // store for lookup

        // Fetch participant count for this tournament
        fetchParticipantsCount(t.id).done(res => {
            const participants = Array.isArray(res.data) ? res.data : [];
            t.currentParticipants = participants.length; // update registered count
            const card = createTournamentCard(t);
            container.appendChild(card);
        }).fail(err => {
            console.error('Failed to get participants for tournament', t.id, err);
            t.currentParticipants = t.currentParticipants || 0;
            const card = createTournamentCard(t);
            container.appendChild(card);
        });
    });
}

// ===================== Create Single Tournament Card =====================
function createTournamentCard(t) {
    const card = document.createElement('div');
    card.className = 'tournament-card';
    card.dataset.tournamentId = t.id;

    const registered = t.currentParticipants || 0;
    const max        = t.maxParticipants;
    const progress   = Math.floor((registered / max) * 100);
    const days       = Math.max(0, Math.ceil((new Date(t.startDate) - new Date()) / (1000 * 60 * 60 * 24)));
    const isOpen     = t.registrationStatus === 'OPEN';

    card.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          <img src="${t.game.logoUrl || 'default.jpg'}" class="w-8 h-8 rounded" />
          <span class="text-sm text-gray-300">${t.game.name}</span>
        </div>
        <span class="status-filling ">
            ${t.type === 'SOLO' ? 'Solo' : t.type === 'CLAN' ? 'Clan' : t.type}
        </span>
      </div>

      <h3 class="text-xl font-semibold mb-2">${t.name}</h3>
      <p class="text-gray-400 text-sm mb-4">${t.description}</p>

      <div class="grid grid-cols-3 gap-4 mb-4">
        <div class="text-center">
          <div class="text-lg font-bold text-[#f59e0b]">$${t.prizePool.toLocaleString()}</div>
          <div class="text-xs text-gray-400">Prize Pool</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-[#ef4444]">${registered}/${max}</div>
          <div class="text-xs text-gray-400">Registered</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-[#ef4444]">${days}d</div>
          <div class="text-xs text-gray-400">${isOpen ? 'Reg. Closes' : 'Starts In'}</div>
        </div>
      </div>

      <div class="mb-4">
        <div class="flex justify-between text-sm text-gray-400 mb-1">
            <span>Registration Progress</span>
            <span>${registered}/${max}</span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-2">
            <div class="bg-[#f59e0b] h-2 rounded-full" style="width:${progress}%"></div>
        </div>
      </div>

      <button
        class="w-full bg-[#f59e0b] text-black py-2 px-4 rounded-lg text-sm font-semibold
               hover:bg-[#d97706] transition-gaming register-btn"
        ${!isOpen ? 'disabled' : ''}
        onclick="openRegistrationModal(${t.id})">
        ${isOpen ? 'Register Now' : 'Registration Closed'}
      </button>
    `;
    return card;
}

// ===================== Registration Modal =====================
function openRegistrationModal(tournamentId) {
    const userRole = localStorage.getItem('role');
    if (userRole !== 'Player') {
        alert('Only players can register for tournaments.');
        return;
    }

    const t = tournamentsMap.get(tournamentId);
    if (!t) {
        console.error('Tournament not found for ID', tournamentId);
        return;
    }
    currentTournament = t;

    // Pre-fill modal with user info
    document.getElementById('playerUsername').value = localStorage.getItem('username') || '';
    document.getElementById('playerEmail').value    = localStorage.getItem('email') || '';

    // Show/hide Clan Name field
    const clanField = document.getElementById('clanNameInput');
    clanField.style.display = t.type === 'CLAN' ? 'block' : 'none';
    if (t.type !== 'CLAN') clanField.value = '';

    document.getElementById('registrationModal').classList.add('active');
}

// ===================== Registration Form Submit =====================
document.getElementById('registrationForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!currentTournament) return;

    const token = localStorage.getItem('token');
    const email = document.getElementById('playerEmail').value.trim();
    const clan  = currentTournament.type === 'CLAN'
        ? document.getElementById('clanName').value.trim()
        : null;

    if (!email && currentTournament.type === 'SOLO') {
        alert("Email is required for solo tournaments.");
        return;
    }
    if (!clan && currentTournament.type === 'CLAN') {
        alert("Clan name is required for clan tournaments.");
        return;
    }

    // Build payload according to tournament type
    const payload = {
        tournamentId: currentTournament.id,
        playerEmail: currentTournament.type === 'SOLO' ? email : null,
        clanName: currentTournament.type === 'CLAN' ? clan : null
    };

    // Send registration request
    $.ajax({
        url: 'http://localhost:8080/api/v1/tournament-participant/join',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        headers: { Authorization: 'Bearer ' + token },
        success: () => {
            alert('Successfully registered!');
            document.getElementById('registrationModal').classList.remove('active');
            loadUpcomingTournaments();
        },
        error: err => alert('Registration failed: ' + (err.responseText || err.statusText))
    });
});

// ===================== Initial Load =====================
document.addEventListener('DOMContentLoaded', loadUpcomingTournaments);
setInterval(loadUpcomingTournaments, 5 * 60 * 1000); // refresh every 5 minutes
*/
let currentTournament = null; // store selected tournament
const tournamentsMap = new Map(); // keep all tournaments for lookup
let registeredTournamentIds = new Set(); // tournaments player already joined

const role = localStorage.getItem('role');

if (role === 'User') {
    document.querySelectorAll('.register-btn').forEach(btn => btn.disabled = true);
}

// ===================== Load & Display Upcoming Tournaments =====================
function loadUpcomingTournaments() {
    $.ajax({
        url: 'http://localhost:8080/api/v1/tournament/getUpcomingTournaments',
        method: 'GET',
        dataType: 'json',
        success: res => generateTournamentCards(res),
        error: err => console.error('Error fetching tournaments:', err)
    });
}

// ===================== Fetch tournaments already joined by player =====================
function loadRegisteredTournaments() {
    const playerEmail = localStorage.getItem('email');
    if (!playerEmail) return;

    const token = localStorage.getItem('token');
    $.ajax({
        url: `http://localhost:8080/api/v1/tournament-participant/getTournamentsByPlayerEmail`,
        method: 'GET',
        data: { playerEmail },
        headers: { Authorization: 'Bearer ' + token },
        success: res => {
            registeredTournamentIds.clear();
            if (Array.isArray(res.data)) {
                res.data.forEach(tId => registeredTournamentIds.add(tId));
            }
            loadUpcomingTournaments(); // update tournament cards after fetching joined tournaments
        },
        error: err => console.error('Failed to fetch registered tournaments', err)
    });
}

// ===================== Fetch Participants by Tournament ID =====================
function fetchParticipantsCount(tournamentId) {
    const token = localStorage.getItem('token');
    return $.ajax({
        url: `http://localhost:8080/api/v1/tournament-participant/getParticipantsByTournamentId?tournamentId=${tournamentId}`,
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token }
    });
}

// ===================== Generate Tournament Cards =====================
function generateTournamentCards(response) {
    const container = document.getElementById('tournament-grid');
    if (!container) return;
    const tournaments = Array.isArray(response.data) ? response.data : [];

    container.innerHTML = tournaments.length
        ? ''
        : '<p class="text-gray-400">No upcoming tournaments.</p>';

    tournaments.forEach(t => {
        tournamentsMap.set(t.id, t); // store for lookup

        // Fetch participant count for this tournament
        fetchParticipantsCount(t.id).done(res => {
            const participants = Array.isArray(res.data) ? res.data : [];
            t.currentParticipants = participants.length;
            const card = createTournamentCard(t);
            container.appendChild(card);
        }).fail(err => {
            console.error('Failed to get participants for tournament', t.id, err);
            t.currentParticipants = t.currentParticipants || 0;
            const card = createTournamentCard(t);
            container.appendChild(card);
        });
    });
}

// ===================== Create Single Tournament Card =====================
function createTournamentCard(t) {
    const card = document.createElement('div');
    card.className = 'tournament-card';
    card.dataset.tournamentId = t.id;

    const registered = t.currentParticipants || 0;
    const max        = t.maxParticipants;
    const progress   = Math.floor((registered / max) * 100);
    const days       = Math.max(0, Math.ceil((new Date(t.startDate) - new Date()) / (1000 * 60 * 60 * 24)));
    const isOpen     = t.registrationStatus === 'OPEN';
    const isJoined   = registeredTournamentIds.has(t.id); // ✅ check if player already joined

    card.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          <img src="${t.game.logoUrl || 'default.jpg'}" class="w-8 h-8 rounded" />
          <span class="text-sm text-gray-300">${t.game.name}</span>
        </div>
        <span class="status-filling ">
            ${t.type === 'SOLO' ? 'Solo' : t.type === 'CLAN' ? 'Clan' : t.type}
        </span>
      </div>

      <h3 class="text-xl font-semibold mb-2">${t.name}</h3>
      <p class="text-gray-400 text-sm mb-4">${t.description}</p>

      <div class="grid grid-cols-3 gap-4 mb-4">
        <div class="text-center">
          <div class="text-lg font-bold text-[#f59e0b]">$${t.prizePool.toLocaleString()}</div>
          <div class="text-xs text-gray-400">Prize Pool</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-[#ef4444]">${registered}/${max}</div>
          <div class="text-xs text-gray-400">Registered</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-[#ef4444]">${days}d</div>
          <div class="text-xs text-gray-400">${isOpen ? 'Reg. Closes' : 'Starts In'}</div>
        </div>
      </div>

      <div class="mb-4">
        <div class="flex justify-between text-sm text-gray-400 mb-1">
            <span>Registration Progress</span>
            <span>${registered}/${max}</span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-2">
            <div class="bg-[#f59e0b] h-2 rounded-full" style="width:${progress}%"></div>
        </div>
      </div>

      <button
        class="w-full bg-[#f59e0b] text-black py-2 px-4 rounded-lg text-sm font-semibold
               hover:bg-[#d97706] transition-gaming register-btn"
        ${!isOpen || isJoined ? 'disabled' : ''}
        onclick="openRegistrationModal(${t.id},event)">
        ${isJoined ? 'Already Registered' : (isOpen ? 'Register Now' : 'Registration Closed')}
      </button>
    `;
    return card;
}

// ===================== Registration Modal =====================
function openRegistrationModal(tournamentId) {
    if (event) event.preventDefault();     // ⛔ stop default button/link action
    if (event) event.stopPropagation();    // ⛔ stop bubbling to parent handlers

    const userRole = localStorage.getItem('role');
    if (userRole !== 'Player') {
        toastr.error('Only players can register for tournaments.');
        return;
    }

    const t = tournamentsMap.get(tournamentId);
    if (!t) {
        console.error('Tournament not found for ID', tournamentId);
        return;
    }
    currentTournament = t;

    document.getElementById('playerUsername').value = localStorage.getItem('username') || '';
    document.getElementById('playerEmail').value    = localStorage.getItem('email') || '';

    const clanField = document.getElementById('clanNameInput');
    clanField.style.display = t.type === 'CLAN' ? 'block' : 'none';
    if (t.type !== 'CLAN') clanField.value = '';

    document.getElementById('registrationModal').classList.add('active');
}

// ===================== Registration Form Submit =====================
document.getElementById('registrationForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!currentTournament) return;

    const token = localStorage.getItem('token');
    const email = document.getElementById('playerEmail').value.trim();
    const clan  = currentTournament.type === 'CLAN'
        ? document.getElementById('clanName').value.trim()
        : null;

    if (!email && currentTournament.type === 'SOLO') {
        alert("Email is required for solo tournaments.");
        return;
    }
    if (!clan && currentTournament.type === 'CLAN') {
        alert("Clan name is required for clan tournaments.");
        return;
    }

    const payload = {
        tournamentId: currentTournament.id,
        playerEmail: currentTournament.type === 'SOLO' ? email : null,
        clanName: currentTournament.type === 'CLAN' ? clan : null
    };

    $.ajax({
        url: 'http://localhost:8080/api/v1/tournament-participant/join',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        headers: { Authorization: 'Bearer ' + token },
        success: () => {
            alert('Successfully registered!');
            document.getElementById('registrationModal').classList.remove('active');
            loadRegisteredTournaments(); // ✅ refresh registered tournaments & update cards
        },
        error: err => alert('Registration failed: ' + (err.responseText || err.statusText))
    });
});

// ===================== Initial Load =====================
document.addEventListener('DOMContentLoaded', () => {
    loadRegisteredTournaments(); // fetch first, then load tournaments
});
setInterval(loadRegisteredTournaments, 5 * 60 * 1000); // refresh every 5 mins
