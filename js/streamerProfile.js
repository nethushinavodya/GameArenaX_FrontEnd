document.addEventListener("DOMContentLoaded", function () {
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");

    console.log(email, token);

    if (!email || !token) {
        console.error("No email or token found in localStorage!");
        return;
    }

    $.ajax({
        url: `http://localhost:8080/api/v1/streamers/getByEmail?email=${email}`,
    type: "GET",
        dataType: "json",
        headers: {
        Authorization: "Bearer " + token,
            contentType: "application/json",
    },
    success: function (res) {
        console.log(res);
        if (res.code === 201) {
            const data = res.data;

            // Basic Info
            $("#profile-name").text(data.displayName);
            $("#username").text("@" + data.user.username);
            $("#profile-email").text(data.email);
            $("#profile-bio").text(data.bio);
            $("#profile-country").text(data.country);
            $("#profile-platform").text(data.platform);
            $("#channel-platform").text(data.platform); // right side box
            $("#profile-followers").text(data.followerCount.toLocaleString());
            $("#followers-count").text(data.followerCount.toLocaleString());

            // Extra Info
            $("#streamer-id").text(data.id);
            $("#display-name").text(data.displayName);
            $("#stream-url").attr("href", data.streamUrl).text(data.streamUrl || "---");

            // Profile Picture
            if (data.profileImageUrl) {
                $("#profile-pic").attr("src", data.profileImageUrl);
            }
            if (data.bannerImageUrl) {
                $("#banner-image")
                    .attr("src", data.bannerImageUrl)
                    .show();                               // ✅ show the image
                $("#default-banner").hide();                // ✅ hide the default gradient banner
            }


            // Live Status
            if (data.isLive) {
                $("#profile-status").addClass("absolute -bottom-2 -right-2 bg-success text-background text-xs font-bold px-3 py-1 rounded-full border-2 border-surface flex items-center").text("Live Now");
                $("#status-text").text("Live").addClass("text-green-400 font-medium ml-1");
            } else {
                $("#profile-status").html('<span class="text-black font-medium"> Offline</span>');
                $("#status-text").addClass("text-error font-medium ml-1").text("Offline");
            }

            // Last Stream
            if (data.lastLiveAt) {
                const lastStreamDate = new Date(data.lastLiveAt).toLocaleDateString();
                $("#last-stream").text(lastStreamDate);
            }

            // Featured Games
            let gamesHtml = "";
            data.featuredGames.forEach(game => {
                gamesHtml += `
                        <div class="bg-surface-800 rounded-gaming p-4 text-center border border-primary/30">
                            <div class="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <span class="text-primary text-lg">🎯</span>
                            </div>
                            <h4 class="font-medium text-text-primary text-sm">${game}</h4>
                        </div>
                    `;
            });
            $("#featured-games").html(gamesHtml);

            // Joined Date
            const joinedDate = new Date(data.joinedAt).toLocaleDateString();
            $("#joined-date").text(joinedDate);

            // Verification
            if (data.isVerified) {
                $("#verified-badge").show();
                $("#verification-status")
                    .removeClass("bg-gray-600 text-white")
                    .addClass("bg-success text-white border-success")
                    .text("Verified");
            } else {
                $("#verified-badge").hide();
                $("#verification-status")
                    .removeClass("bg-success text-white")
                    .addClass("bg-gray-600 text-white border-gray-400")
                    .text("Not Verified");
            }
        }
    },
    error: function (xhr) {
        console.error("Error loading profile:", xhr.responseText);
    }
});

});


// Open modal
function openStreamModal() {
    document.getElementById("streamModal").classList.remove("hidden");

    // Load tournaments from API
    getTournamentsByStreamer();
}

// Close modal
function closeStreamModal() {
    document.getElementById("streamModal").classList.add("hidden");
}

// Populate dropdown
function getTournamentsByStreamer(){
    let token = localStorage.getItem("token");
    let email = localStorage.getItem("email");

    $.ajax({
        url: `http://localhost:8080/api/v1/tournament/getUpcomingTournamentsByStreamer?email=${email}`,
    type: "GET",
        dataType: "json",
        headers: {
        Authorization: "Bearer " + token
    },
    success: function(res){
        console.log("Tournaments:", res);

        let select = document.getElementById("tournamentSelect");
        select.innerHTML = '<option value="">-- Select Tournament --</option>';

        // Check if multiple tournaments (array)
        if (Array.isArray(res.data)) {
            res.data.forEach(t => {
                let option = document.createElement("option");
                option.value = t.id;
                option.textContent = t.name;
                select.appendChild(option);
            });
        }
        // Check if single tournament (object)
        else if (res.data) {
            let t = res.data;
            let option = document.createElement("option");
            option.value = t.id;
            option.textContent = t.name;
            select.appendChild(option);
        }
    },
    error: function(xhr){
        console.error("Error loading tournaments:", xhr.responseText);
    }
});
}

function startStream(){
    let tournamentId = document.getElementById("tournamentSelect").value;
    let streamUrl = document.getElementById("streamUrl").value;

    console.log(tournamentId  ,  streamUrl)

    if(!tournamentId || !streamUrl){
        alert("Please select a tournament and enter stream URL!");
        return;
    }
    // Example: Send to backend
    let token = localStorage.getItem("token");

    $.ajax({
        url: "http://localhost:8080/api/v1/tournament/startTournament",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            id: tournamentId,
            StreamerEmail: streamUrl
        }),
        headers: {
            Authorization: "Bearer " + token
        },
        success: function(res){
            console.log(res);
            alert("Stream started successfully!");
            window.location.href=`stream.html?tournamentId=${tournamentId}`;
            closeStreamModal();
        },
        error: function(xhr){
            console.error("Error starting stream:", xhr.responseText);
        }
    });

}