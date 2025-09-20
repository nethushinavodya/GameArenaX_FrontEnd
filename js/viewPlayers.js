function loadPlayers() {
    $.ajax({
        method: "GET",
        url: "http://localhost:8080/api/v1/player/getAllPlayers",
        beforeSend: function() {
            $("#playersGrid").html(`
                <div class="col-span-full flex justify-center items-center py-12">
                    <div class="text-center">
                        <i class="fas fa-spinner fa-spin text-4xl text-green-500 mb-4"></i>
                        <p class="text-gray-400">Loading players...</p>
                    </div>
                </div>
            `);
        },
        success: function(response) {

            console.log("Players API response:", response);
            let playersGrid = $("#playersGrid");
            playersGrid.empty();

            if (response && Array.isArray(response.data)) {
                let players = response.data;

                if (players.length === 0) {
                    playersGrid.append(`
                        <div class="col-span-full text-center text-gray-400 py-12">
                            <i class="fas fa-users text-6xl mb-4 opacity-50"></i>
                            <h3 class="text-xl font-semibold mb-2">No Players Found</h3>
                            <p>No players are currently registered in the system.</p>
                        </div>
                    `);
                } else {
                    players.forEach(player => {
                        // Online status
                        let onlineStatusBadge = player.isOnline
                            ? `<span class="status-badge online-status">Online</span>`
                            : `<span class="status-badge offline-status">Offline</span>`;

                        // Account status
                        let statusBadge = player.status === "Active"
                            ? `<span class="status-badge status-active">Active</span>`
                            : `<span class="status-badge status-deactivated">Banned</span>`;

                        // Action button
                        let actionButton = player.status === "Active"
                            ? `<button class="ban-btn" onclick="banPlayer(this, '${player.email || player.user?.email}')" 
                                    data-email="${player.email || player.user?.email}" data-status="Active">
                                    <i class="fas fa-ban"></i> Ban Player
                               </button>`
                            : `<button class="unban-btn" onclick="unbanPlayer(this, '${player.email || player.user?.email}')" 
                                    data-email="${player.email || player.user?.email}" data-status="Banned">
                                    <i class="fas fa-check"></i> Unban Player
                               </button>`;

                        let playerCard = `
                            <div class="player-card ${player.status !== "Active" ? "banned" : ""}" 
                                 data-player-email="${player.email || player.user?.email}">
                                <div class="player-header">
                                    <img src="${player.imageUrl || player.user?.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face'}" 
                                         alt="Player" 
                                         class="user-profile-picture"
                                         onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face'">
                                    <div class="player-info">
                                        <div class="player-name">${player.playerName || player.user?.username || "Unknown Player"}</div>
                                        <div class="player-email">${player.email || player.user?.email || "No email"}</div>
                                        <div class="player-country"><i class="fas fa-map-marker-alt text-gray-400 mr-2"></i>${player.country || player.user?.country || "Unknown"}</div>
                                    </div>
                                </div>
                                
                                <div class="player-about">
                                    <p>${player.about || "No description available. This player hasn't added any information about themselves yet."}</p>
                                </div>
                                
                                <div class="player-badges">
                                    ${onlineStatusBadge}
                                    <span class="rank-badge">${player.rank || "Unranked"}</span>
                                    ${statusBadge}
                                </div>
                                
                                <div class="player-stats">
                                    <div class="stat-item">
                                        <span class="stat-value">${player.totalMatches || 0}</span>
                                        <span class="stat-label">Total Matches</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-value">${player.wins || 0}</span>
                                        <span class="stat-label">Wins</span>
                                    </div>
                                </div>
                                
                                <div class="player-actions">
                                    ${actionButton}
                                </div>
                            </div>
                        `;
                        playersGrid.append(playerCard);
                    });
                }
            }
        },
        error: function(xhr) {
            $("#playersGrid").html(`
                <div class="col-span-full text-center text-red-400 py-12">
                    <i class="fas fa-wifi text-6xl mb-4 opacity-50"></i>
                    <h3 class="text-xl font-semibold mb-2">Connection Error</h3>
                    <p>Failed to connect to server. Please check your internet connection.</p>
                    <button class="btn-primary mt-4" onclick="loadPlayers()">
                        <i class="fas fa-refresh"></i> Try Again
                    </button>
                </div>
            `);
        }
    });
}

// Ban player
function banPlayer(button, email) {
    if (!email) {
        toastr.error('Player email not found');
        return;
    }
    if (confirm(`Are you sure you want to ban this player? (${email})`)) {
        $(button).prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Banning...');
        $.ajax({
            method: "PUT",
            url: `http://localhost:8080/api/v1/player/ban?email=${email}`,
            success: function() {
                toastr.success('Player banned successfully!');
                let card = $(`.player-card[data-player-email="${email}"]`);
                card.addClass("banned");
                card.find(".status-badge.status-active").removeClass("status-active").addClass("status-deactivated").text("Banned");
                $(button).replaceWith(`
                    <button class="unban-btn" onclick="unbanPlayer(this, '${email}')">
                        <i class="fas fa-check"></i> Unban Player
                    </button>
                `);
            },
            error: function() {
                toastr.error('Failed to ban player. Please try again.');
                $(button).prop('disabled', false).html('<i class="fas fa-ban"></i> Ban Player');
            }
        });
    }
}

// Unban player
function unbanPlayer(button, email) {
    if (!email) {
        toastr.error('Player email not found');
        return;
    }
    if (confirm(`Are you sure you want to unban this player? (${email})`)) {
        $(button).prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Unbanning...');
        $.ajax({
            method: "PUT",
            url: `http://localhost:8080/api/v1/player/unban?email=${email}`,
            success: function() {
                toastr.success('Player unbanned successfully!');
                let card = $(`.player-card[data-player-email="${email}"]`);
                card.removeClass("banned");
                card.find(".status-badge.status-deactivated").removeClass("status-deactivated").addClass("status-active").text("Active");
                $(button).replaceWith(`
                    <button class="ban-btn" onclick="banPlayer(this, '${email}')">
                        <i class="fas fa-ban"></i> Ban Player
                    </button>
                `);
            },
            error: function() {
                toastr.error('Failed to unban player. Please try again.');
                $(button).prop('disabled', false).html('<i class="fas fa-check"></i> Unban Player');
            }
        });
    }
}

// Search
function initializeSearch() {
    $("#searchInput").on("input", function() {
        const searchTerm = $(this).val().toLowerCase().trim();
        if (searchTerm === '') {
            $(".player-card").show();
            return;
        }
        $(".player-card").each(function() {
            const playerName = $(this).find(".player-name").text().toLowerCase();
            const playerEmail = $(this).find(".player-email").text().toLowerCase();
            const playerCountry = $(this).find(".player-country").text().toLowerCase();
            if (playerName.includes(searchTerm) || playerEmail.includes(searchTerm) || playerCountry.includes(searchTerm)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
}

// Ready
$(document).ready(function() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "index2.html";
        return;
    }
    let adminName = localStorage.getItem("username") || "AdminUser";
    $("#adminName").text(adminName);
    loadPlayers();
    initializeSearch();
    $("#logoutBtn").click(function() {
        if (confirm("Do you really want to logout?")) {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            window.location.href = "index2.html";
            toastr.success('Logout successful!');
        }
    });
});
