$(document).ready(function () {

    const grid = $(".grid");


    $.ajax({
        url: "http://localhost:8080/api/v1/tournament/getByOngoingStatus",
        method: "GET",
        dataType: "json",
        success: function (res) {
            console.log(res);
            if (!res || !res.data || res.data.length === 0) {
                grid.html('<p class="text-center text-gray-400 col-span-full">No live tournaments at the moment.</p>');
                return;
            }

            grid.empty(); // clear placeholder cards

            res.data.forEach(t => {
                const tournamentId = t.id;
                const gameName     = t.game?.name || "Unknown Game";
                const imgUrl       = t.game?.logoUrl || "";
                const prize        = t.prizePool ? `$${Number(t.prizePool).toLocaleString()}` : "—";
                const viewers      = t.streamer?.followerCount || 0;

                const card = `
                
                <div class="tournament-card group cursor-pointer">
        <div class="relative mb-4 overflow-hidden rounded-lg">
            <img src="${imgUrl}" alt="${t.name}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='';this.onerror=null;">
            <div class="card-overlay"></div>
            <button class="watch-now-btn cursor-pointer" onclick="watchTournament('${tournamentId}')">
                <i class="fas fa-play mr-2"></i>Watch Now
            </button>
            <div class="absolute top-3 left-3">
                <span class="live-indicator">LIVE</span>
            </div>
            <div class="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm font-mono">
                ${viewers.toLocaleString()} viewers
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div class="absolute bottom-3 left-3 right-3">
                <h3 class="text-white font-semibold text-lg mb-1">${t.name}</h3>
                <p class="text-gray-300 text-sm">${t.description || ""}</p>
            </div>
        </div>
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
                <img src="${imgUrl}" alt="${gameName}" class="w-8 h-8 rounded object-cover" onerror="this.src='';this.onerror=null;">
                <span class="text-text-secondary text-sm">${gameName}</span>
            </div>
            <span class="text-accent text-sm font-medium">${prize} Prize</span>
        </div>
    </div>`;

                grid.append(card);
            });

        },
        error: function (xhr) {
            toastr.error("Failed to load tournaments");
            console.error(xhr.responseText);
        }
    });

    const refreshBtn = document.getElementById("refreshLive");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", function () {
            location.reload();
        });
    }

});

function watchTournament(tournamentId) {
    window.location.href = `live.html?tournamentId=${encodeURIComponent(tournamentId)}`;
}
