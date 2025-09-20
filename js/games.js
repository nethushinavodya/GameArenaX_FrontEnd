let gamesData = [];
let currentEditGameId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    getGames();
    setupEventListeners();
});

// Event listeners
function setupEventListeners() {
    // Add Game Modal
    document.getElementById('gameForm')?.addEventListener('submit', handleAddGame);
    document.getElementById('updateGameForm')?.addEventListener('submit', handleEditGame);

    // Close modals on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
        modal.addEventListener('click', e => {
            if (e.target === modal) closeModal(modal.id);
        });
    });

    // Image preview - Add Game
    $('#gameLogoFile').on('change', function () {
        previewImage(this, '#gameLogoPreview');
    });

    // Image preview - Edit Game
    $('#updateGameLogoFile').on('change', function () {
        previewImage(this, '#updateGameLogoPreview');
    });

    // Logout
    $("#logoutBtn").click(() => {
        if (confirm("Do you really want to logout?")) {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            toastr.info('Logged out successfully');
        }
    });
}

// Preview image
function previewImage(input, previewId) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => $(previewId).attr('src', e.target.result).removeClass('hidden');
        reader.readAsDataURL(file);
    } else $(previewId).addClass('hidden').attr('src', '');
}

// Fetch games
function getGames() {
    $.ajax({
        url: 'http://localhost:8080/api/v1/games/AllGames',
        method: 'GET',
        headers: { "Content-Type": "application/json" },
        success: function (res) {
            gamesData = res.data || [];
            renderGames();
        },
        error: err => toastr.error('Error fetching games')
    });
}

// Render game cards
function renderGames() {
    const container = $('#gamesGrid');
    container.empty();
    if (!gamesData.length) {
        container.append('<p class="col-span-full text-center text-gray-400">No games found.</p>');
        return;
    }

    gamesData.forEach(game => {
        const isInactive = !game.active;
        const card = $(`
        <div class="game-card ${isInactive ? 'inactive' : ''}">
            <div class="status-badge ${game.active ? 'status-active' : 'status-inactive'}">
                ${game.active ? 'Active' : 'Inactive'}
            </div>
            <img src="${game.logoUrl || generatePlaceholderLogo(game.name)}" class="game-logo">
            <h3 class="game-title">${game.name}</h3>
            <span class="game-genre">${game.genre}</span>
            <p class="game-description">${game.description}</p>
            <p class="game-platform"><i class="fas fa-gamepad mr-2"></i>${game.platform}</p>
            <div class="game-actions">
                <button class="btn-secondary" ${isInactive ? 'disabled opacity-50 cursor-not-allowed' : ''}
                        onclick="openEditGameModal('${game.gameId}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="${game.active ? 'btn-danger' : 'btn-primary'}"
                        onclick="toggleGameStatus('${game.gameId}', ${game.active})">
                    <i class="fas fa-${game.active ? 'pause' : 'play'}"></i>
                    ${game.active ? 'Deactivate' : 'Activate'}
                </button>
            </div>
        </div>
    `);
        container.append(card);
    });
}

// Open Add Modal
function openAddModal() {
    currentEditGameId = null;
    $('#gameForm')[0].reset();
    $('#gameLogoPreview').addClass('hidden').attr('src', '');
    $('#modalTitle').text('Add New Game');
    $('#submitBtn').html('<i class="fas fa-save"></i> Save Game');
    $('#gameModal').addClass('active');
    document.body.style.overflow = 'hidden';
}

// Open Edit Modal
function openEditGameModal(gameId) {
    const game = gamesData.find(g => g.gameId === gameId);
    if (!game) return;

    currentEditGameId = game.gameId;
    $('#updateGameName').val(game.name).prop('disabled', true);
    $('#updateGameGenre').val(game.genre);
    $('#updateGamePlatform').val(game.platform);
    $('#updateGameDescription').val(game.description);
    $('#updateGameLogoPreview').attr('src', game.logoUrl).removeClass('hidden');
    $('#updateModalTitle').text('Edit Game');
    $('#editBtn').html('<i class="fas fa-save"></i> Edit Game');
    $('#gameUpdateModal').addClass('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Add Game handler
function handleAddGame(e) {
    e.preventDefault();

    const gameName = $('#gameName').val().trim();

    // Check if the name already exists
    const exists = gamesData.some(g => g.name.toLowerCase() === gameName.toLowerCase());
    if (exists) {
        toastr.error('A game with this name already exists!');
        return;
    }

    const file = $('#gameLogoFile')[0].files[0];
    if (!file) {
        toastr.error('Please select an image');
        return;
    }

    if (!file.type.startsWith('image/')) {
        toastr.error('Invalid file type. Only images are allowed.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'MKYDGaming');
    formData.append('cloud_name', 'dihnh3it0');

    $.ajax({
        url: 'https://api.cloudinary.com/v1_1/dihnh3it0/image/upload',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data) {
            const gameData = {
                name: gameName,
                description: $('#gameDescription').val(),
                genre: $('#gameGenre').val(),
                platform: $('#gamePlatform').val(),
                isActive: true,
                logoUrl: data.secure_url
            };

            $.ajax({
                url: 'http://localhost:8080/api/v1/games/save',
                type: 'POST',
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token'),
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(gameData),
                success: function(res) {
                    toastr.success('Game added successfully!');
                    getGames();
                    closeModal('gameModal');
                },
                error: function(err) {
                    console.error(err);
                    toastr.error('Error saving game to backend');
                }
            });
        },
        error: function(err) {
            console.error(err);
            toastr.error('Error uploading image to Cloudinary');
        }
    });
}

// Edit Game handler
function handleEditGame(e) {
    e.preventDefault();
    if (!currentEditGameId) return;

    const gameName = $('#updateGameName').val().trim();

    // Check if another game has the same name
    const exists = gamesData.some(g => g.name.toLowerCase() === gameName.toLowerCase() && g.gameId !== currentEditGameId);
    if (exists) {
        toastr.error('A game with this name already exists!');
        return;
    }

    const file = $('#updateGameLogoFile')[0].files[0];
    const game = gamesData.find(g => g.gameId === currentEditGameId);

    const updateGameData = {
        gameId: currentEditGameId,
        name: gameName,
        genre: $('#updateGameGenre').val(),
        platform: $('#updateGamePlatform').val(),
        description: $('#updateGameDescription').val(),
        logoUrl: game.logoUrl,
        isActive: true
    };

    if (file) {
        uploadImageToCloudinary(file, url => {
            updateGameData.logoUrl = url;
            updateGameAPI(updateGameData);
        });
    } else updateGameAPI(updateGameData);
}

// Toggle game active/inactive
function toggleGameStatus(gameId, isActive) {
    const game = gamesData.find(g => g.gameId === gameId);
    if (!game) return;

    const url = isActive ?
        `http://localhost:8080/api/v1/games/delete?name=${encodeURIComponent(game.name)}` :
        `http://localhost:8080/api/v1/games/setActiveTrue?name=${encodeURIComponent(game.name)}`;
    const method = isActive ? 'DELETE' : 'PUT';

    $.ajax({
        url,
        method,
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
        success: () => { toastr.success(`Game ${isActive ? 'deactivated' : 'activated'}`); getGames(); },
        error: () => toastr.error('Failed to update status')
    });
}

// Update game API
function updateGameAPI(data) {
    $.ajax({
        url: 'http://localhost:8080/api/v1/games/update',
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token'), "Content-Type": "application/json" },
        data: JSON.stringify(data),
        success: () => { toastr.success('Game updated'); getGames(); closeModal('gameUpdateModal'); },
        error: () => toastr.error('Failed to update game')
    });
}

// Cloudinary upload helper
function uploadImageToCloudinary(file, callback) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'MKYDGaming');
    formData.append('cloud_name', 'dihnh3it0');

    $.ajax({
        url: 'https://api.cloudinary.com/v1_1/dihnh3it0/image/upload',
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: res => callback(res.url),
        error: () => toastr.error('Image upload failed')
    });
}

// Placeholder logo
function generatePlaceholderLogo(name) {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0,3).toUpperCase();
    return `https://placehold.co/80x80/22c55e/ffffff?text=${initials}`;
}

// Add to your existing setupEventListeners function
$('#searchInput').on('input', function() {
    const searchTerm = $(this).val().trim();
    filterGames(searchTerm);
});

let originalGamesData = [];

function getGames() {
    $.ajax({
        url: 'http://localhost:8080/api/v1/games/AllGames',
        method: 'GET',
        headers: { "Content-Type": "application/json" },
        success: function (res) {
            gamesData = res.data || [];
            originalGamesData = [...gamesData]; // Add this line
            renderGames();
        },
        error: err => toastr.error('Error fetching games')
    });
}

// Real-time filter function - no search button needed
function filterGames(searchTerm) {
    if (!searchTerm) {
        gamesData = [...originalGamesData];
    } else {
        const lowerSearchTerm = searchTerm.toLowerCase();

        gamesData = originalGamesData.filter(game => {
            return game.name.toLowerCase().includes(lowerSearchTerm)
                game.platform.toLowerCase().includes(lowerSearchTerm)
        });
    }

    renderGames();
}