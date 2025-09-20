$(document).ready(function () {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (!username || !token) {
        toastr.error("Please login first!");
        window.location.href = "login.html";
        return;
    }

    // Load player data
    loadPlayerDetails(username);

    // Logout
    $("#logoutBtn").on("click", function (e) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "index2.html";
    });
});

function loadPlayerDetails(username) {
    $.ajax({
        method: "GET",
        url: `http://localhost:8080/api/v1/player/getByUsername?username=${username}`,
        headers: { "Content-Type": "application/json" },
        success: function (res) {
            console.log(res);
            if (res && res.data && res.data.length > 0) {
                const player = res.data[0]; // first player in array
                setProfileData(player);
            } else {
                toastr.error("No player found");
            }
        },
        error: function (xhr) {
            console.error("Error:", xhr);
            toastr.error("Failed to load player details");
        }
    });
}

function setProfileData(player) {
    // Profile section
    $("#playerName").text(player.playerName || "N/A");
    $("#username").text(player.user?.username || "N/A");
    $("#rank").text(player.rank || "Unranked");
    $("#wins").text(player.wins || 0);
    $("#totalMatches").text(player.totalMatches || 0);

    // Win rate calculation
    let winRate = 0;
    if (player.totalMatches > 0) {
        winRate = ((player.wins / player.totalMatches) * 100).toFixed(2);
    }
    $("#winRate").text(winRate + "%");

    $("#about").text(player.about || "No description");

    // Info section
    $("#playerId").text(player.playerId || "N/A");
    $("#email").text(player.email || "N/A");
    $("#playerNameInfo").text(player.playerName || "N/A");
    $("#role").text(player.user?.role || "Player");
    $("#country").text(player.country || "N/A");

    // Status section
    $("#accountStatus").text(player.status || "N/A");
    $("#playerRank").text(player.rank || "Unranked");
    $("#playerWinRate").text(winRate + "%");
    $("#playerWins").text(player.wins || 0);
    $("#playerMatches").text(player.totalMatches || 0);

    // Profile picture
    if (player.imageUrl) {
        $("#profilePicture").attr("src", player.imageUrl);
    } else {
        $("#profilePicture").attr("src", "assets/default-avatar.png");
    }

// Online / Offline
    if (player.online) {
        $("#isOnline")
            .addClass("absolute -bottom-2 -right-2 bg-success text-background text-xs font-bold px-2 py-1 rounded-full border-2 border-surface flex items-center")
            .text("Online");

        $("#isOnline div") // the inner dot
            .css("background-color", "#4CAF50");
    } else {
        $("#isOnline")
            .css({
                "background-color": "#F83232FF", // red background
                "color": "black",
                "border-color": "red"
            })
            .text("Offline");

        $("#isOnline div") // the inner dot
            .css("background-color", "red");
    }
    setGamesSection(player);
}
function setGamesSection(player) {
    const gamesContainer = $(".grid.grid-cols-4.gap-3"); // container div
    gamesContainer.empty(); // clear existing cards

    if (player.games && player.games.length > 0) {
        player.games.forEach((gameName, index) => {
            // Optional: cycle colors for card borders/icons
            const colors = ["warning", "primary", "accent", "success"];
            const color = colors[index % colors.length];

            const gameCard = `
                <div class="bg-surface-800 rounded-gaming p-4 text-center border border-${color}/30">
                    <div class="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span class="text-${color} text-lg">🎮</span>
                    </div>
                    <h4 class="font-medium text-text-primary text-sm">${gameName}</h4>
                </div>
            `;
            gamesContainer.append(gameCard);
        });
    } else {
        gamesContainer.append(`<p class="text-text-secondary text-sm col-span-4 text-center">No games found</p>`);
    }
}
