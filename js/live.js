$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const tournamentId = urlParams.get('tournamentId');
    const token = localStorage.getItem("token");

    if (!tournamentId) {
        toastr.error("Tournament not specified");
        return;
    }

    $.ajax({
        url: `http://localhost:8080/api/v1/tournament/getTournamentById?id=${encodeURIComponent(tournamentId)}`,
        method: "GET",

        success: function(res) {
            console.log("Tournament data:", res.data);
            const tournament = res.data; // directly use the object, not an array

            if (tournament) {
                const tournamentId = tournament.id;
                const tournamentName = tournament.name;
                const tournamentType = tournament.type;
                const tournamentStreamUrl = tournament.streamer.streamUrl;

                $("#tournamentId").text(tournamentId);
                $("#tournamentName").text(tournamentName);
                $("#tournamentType").text(tournamentType);

                // Generate embed URL
                let embedUrl = "";
                if (tournamentStreamUrl.includes("youtube.com") || tournamentStreamUrl.includes("youtu.be")) {
                    let videoId = "";
                    if (tournamentStreamUrl.includes("v=")) {
                        videoId = tournamentStreamUrl.split("v=")[1].split("&")[0];
                    } else {
                        videoId = tournamentStreamUrl.split("/").pop().split("?")[0];
                    }
                    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
                } else if (tournamentStreamUrl.includes("twitch.tv")) {
                    const channel = tournamentStreamUrl.split("/").pop();
                    embedUrl = `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}&autoplay=true`;
                } else {
                    embedUrl = tournamentStreamUrl;
                }

                // Insert iframe
                $("#liveStreamContainer").html(`
                    <iframe 
                        width="100%" 
                        height="500px" 
                        src="${embedUrl}" 
                        frameborder="0" 
                        allow="autoplay; fullscreen" 
                        allowfullscreen>
                    </iframe>
                `);
            } else {
                toastr.error("Tournament not found");
            }
        },
        error: function(xhr) {
            toastr.error("Failed to load streamer tournament");
            console.error(xhr.responseText);
        }
    });
});
