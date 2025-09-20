$(document).ready(function () {
    isJoinedClan();
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const $grid = $("#clan-grid");

    $.ajax({
        url: "http://localhost:8080/api/v1/clan/getAll",
        method: "GET",
        dataType: "json",
        success: function (res) {
            console.log("Received clans:", res);
            if (!res || !Array.isArray(res.data)) {
                $grid.html('<p class="text-red-500">No clans found.</p>');
                return;
            }
            $grid.empty();
            $.each(res.data, function (_, clan) {
                $grid.append(createClanCard(clan));
            });
        },
        error: function (xhr, status, err) {
            console.error("Failed to load clans:", err);
            $grid.html('<p class="text-red-500">Failed to load clans.</p>');
        }
    });


    function createClanCard(clan) {
        currentRequestClanId = clan.id;
        const logo = clan.clanLogoUrl ||
            "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=2940&auto=format&fit=crop";
        const banner = clan.bannerUrl ||
            "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=2940&auto=format&fit=crop";

        const typeColor = clan.clanType === "REQUEST" ? "bg-warning" : "bg-accent";
        const memberCount = (clan.memberLimit - clan.availableSlots) || 0;

        // Decide button look & action type
        let btnColor = "#34d399";
        let btnLabel = "Join";
        let btnAction = "join";

        switch (clan.clanType) {
            case "REQUEST":
                btnColor = "#FF9900";
                btnLabel = "Request";
                btnAction = "request";
                break;
            case "CLOSED":
                btnColor = "#DC2626";
                btnLabel = "Closed";
                btnAction = "closed";
                break;
            case "OPEN":
            default:
                btnColor = "#34d399";
                btnLabel = "Join";
                btnAction = "join";
                break;
        }

        // Return full card HTML
        return `
    <div class="bg-surface rounded-lg border border-gaming-light overflow-hidden shadow-gaming-subtle hover:shadow-gaming transition-gaming hover:border-gaming-strong group">

        <!-- Header -->
        <div class="relative h-32 bg-gradient-to-br from-primary-600 to-primary-800">
            <div class="h-32 w-full bg-center bg-cover"
                 style="background-image:url('${banner}');"></div>
            <div class="absolute inset-0 bg-black bg-opacity-20"></div>

            <div class="absolute bottom-4 left-4">
                <img src="${logo}" alt="${clan.name || "Clan"} Logo"
                     class="w-12 h-12 rounded-lg border-2 border-accent object-cover"
                     onerror="this.src='https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=2940&auto=format&fit=crop'; this.onerror=null;">
            </div>

            <div class="absolute top-4 right-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor} text-white">
                    ${clan.clanType}
                </span>
            </div>
        </div>

        <!-- Body -->
        <div class="p-4">
            <div class="flex items-center justify-between mb-2">
                <h3 class="text-lg font-semibold text-text-primary group-hover:text-accent transition-gaming">
                    ${clan.name || "Unnamed Clan"}
                </h3>
                <div class="flex items-center text-warning-500">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span class="text-sm font-medium">${clan.rankingPoints ?? 0}</span>
                </div>
            </div>

            <p class="text-text-secondary text-sm mb-4 line-clamp-2">
                ${clan.description || "No description provided."}
            </p>

            <div class="flex items-center justify-between text-sm mb-4">
                <div class="flex items-center text-text-secondary">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                    </svg>
                    <span>${memberCount}/${clan.memberLimit || 0} members</span>
                </div>
                <div class="text-accent font-medium">
                    ${clan.availableSlots || 0} slots available
                </div>
            </div>

            <div class="flex items-center justify-between text-xs text-text-secondary mb-4">
                <span>Leader: ${clan.leader?.playerName || "Unknown"}</span>
                <span>Created: ${formatDate(clan.createdAt)}</span>
            </div>
        </div>

        <!-- Single button with data attributes -->
        <div>
            <button type="button" id="joinClanBtn"
                class="block w-full py-2 text-center text-sm font-medium text-white rounded-b-lg clan-btn"
                data-id="${clan.id}"
                data-action="${btnAction}"
                style="background-color:${btnColor};">
                ${btnLabel}

            </button>
        </div>
    </div>`;
    }

    let currentRequestClanId = null;

// Listen for clicks on clan buttons
    document.addEventListener("click", e => {
        const role = localStorage.getItem("role");
        if (role === "User") {
            toastr.error("You should be a player to join the clan");
            return;
        }
        const btn = e.target.closest(".clan-btn");
        if (!btn) return;

        const clanId = btn.dataset.id;
        const action = btn.dataset.action;

        if (action === "join") {
            joinClan(clanId); // existing join logic
        } else if (action === "request") {
            currentRequestClanId = clanId;
            openRequestPopup();
        } else {
            toastr.error("This clan is closed.");
        }
    });

// Open popup
    function openRequestPopup() {
        const popup = document.getElementById("request-popup");
        const textarea = document.getElementById("request-message");
        textarea.value = "";
        popup.classList.remove("hidden");
    }

// Close popup
    document.getElementById("request-cancel").addEventListener("click", () => {
        document.getElementById("request-popup").classList.add("hidden");
    });

// Submit request
    document.getElementById("request-submit").addEventListener("click", () => {
        const message = document.getElementById("request-message").value.trim();
        if (!message) {
            toastr.error("Please type a message.");
            return;
        }

        // Example playerId from your session/localStorage
        const useId = localStorage.getItem("id");
        console.log("Sending join request for clan:", currentRequestClanId);
        console.log("Player ID:", useId);
        console.log("Message:", message);

        let token = localStorage.getItem("token");


        // Send request via AJAX/fetch
        $.ajax({
            url: "http://localhost:8080/api/v1/join-request/create",
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json",
            },
            dataType: "json",
            data:JSON.stringify({
                playerId: useId,
                clanId: currentRequestClanId,
                message: message,
                status: "PENDING"
            }),
            success: function (res) {
                console.log("Join request successful:", res);
                toastr.success("Join request sent successfully!");

                const btn = $(`.clan-btn[data-id='${currentRequestClanId}']`);
                btn.text("Requested");
                btn.prop("disabled", true);
                btn.css("background-color", "#9CA3AF"); // gray color

                //window.location.href = "clan/clan_member_dashboard.html";
            },
            error: function (xhr) {
                console.error("Error:", xhr);
                toastr.error("Failed to send join request. Please try again later.");
            }
        });
    });



    function joinClan(clanId) {
        console.log("Joining clan:", clanId);
        let userId = localStorage.getItem("id");
        let token = localStorage.getItem("token");
        console.log("Joining clan:", clanId);
        console.log("User ID:", userId);


        $.ajax({
            url: "http://localhost:8080/api/v1/clan-member/join",
            method: "POST",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            data: {
                "clanId": clanId,
                "playerId": userId
            },
            success: function (res) {
                console.log("Join successful:", res);
                toastr.success("Joined clan successfully!");

                const btn = $(`.clan-btn[data-id='${clanId}']`);

                btn.text("Joined");
                btn.prop("disabled", true);
                btn.css("background-color", "#9CA3AF"); // gray color
                //     load clan member dashboard
                window.location.href = `clan_member_dashboard.html?playerId=${userId}&clanId=${clanId}`;
            },
            error: function (xhr) {
                console.error("Error:", xhr);
                toastr.error("Failed to send join request. Please try again later.");
            }
        });

    }
    function formatDate(isoString) {
        if (!isoString) return "N/A";
        return new Date(isoString).toLocaleDateString("en-US");
    }
});
function isJoinedClan() {
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("username");
    console.log("Username:", userName);
    $.ajax({
        url: `http://localhost:8080/api/v1/clan/isJoinedClan?username=${encodeURIComponent(userName)}`,
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (res) {
            console.log(res);
            if (res.code === 200) {
                console.log("Joined Clan Data:", res.data);
                window.location.href = `clan_member_dashboard.html?clanId=${res.data.clan.id}`;
            }else {
                window.location.href = "clan_directory.html";
            }
        },
        error: function (xhr) {
            console.error("Error:", xhr);
        //  be a player to join a clan
            toastr.error("Become a player to join a clan");
                $(".clan-btn").prop("disabled", true);
        }
    });
}
