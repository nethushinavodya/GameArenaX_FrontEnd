/*
let clanData = [];
let currentMember = [];

$(document).ready(function() {

    const token = localStorage.getItem("token");
    const urlParams = new URLSearchParams(window.location.search);
    const clanId = urlParams.get('clanId');

    console.log("clanId:", clanId);
    if (!clanId) {
        toastr.error("Missing clanId parameter in the URL");
        return;
    }
    $.ajax({
        url: `http://localhost:8080/api/v1/clan/getById?id=${clanId}`,
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (res) {
            if (res.code === 200) {
                const member = res.data;
                clanData = res.data;
                console.log("Member Data:", member);
                getCurrentMember();

                // Display member details on the page
                displayMemberDetails(member);
            }
        },
        error: function (xhr) {
            console.error("Error:", xhr);
            toastr.error("Failed to load member details");
        }
    });
});


function getCurrentMember () {
        let token = localStorage.getItem("token");
        let userName = localStorage.getItem("username");
        $.ajax({
            url: `http://localhost:8080/api/v1/clan-member/get-current-member?userName=${encodeURIComponent(userName)}`,
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (res) {
                console.log(res);
                if (res.code === 201) {
                    const member = res.data;
                    currentMember = res.data;
                    console.log("Member Data:", member);
                    // Display member details on the page
                    displayMemberDetails(member);
                    setData()
                }
            },
            error: function (xhr) {
                console.error("Error:", xhr);
                toastr.error("Failed to load member details");
            }
        });
}

function setData(){
    console.log( "   data display " );
    console.log(currentMember);
    console.log(clanData);
}

function displayMemberDetails(member) {

}*/


let clanData = [];
let currentMember = [];
let joinReq = [];
let clanId = "";

$(document).ready(function() {
    const token = localStorage.getItem("token");
    const urlParams = new URLSearchParams(window.location.search);
    clanId = urlParams.get('clanId');

    console.log("clanId:", clanId);
    if (!clanId) {
        toastr.error("Missing clanId parameter in the URL");
        return;
    }
    $.ajax({
        url: `http://localhost:8080/api/v1/clan/getById?id=${clanId}`,
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (res) {
            if (res.code === 200) {
                clanData = res.data;
                console.log("Clan Data:", clanData);
                getCurrentMember();
            }
        },
        error: function (xhr) {
            console.error("Error:", xhr);
            toastr.error("Failed to load clan details");
        }
    });
});

function getCurrentMember() {
    let token = localStorage.getItem("token");
    let userName = localStorage.getItem("username");

    $.ajax({
        url: `http://localhost:8080/api/v1/clan-member/get-current-member?userName=${encodeURIComponent(userName)}`,
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (res) {
            console.log(res);
            if (res.code === 201) {
                currentMember = res.data;
                console.log("Current Member Data:", currentMember);
                setData();
            }
        },
        error: function (xhr) {
            console.error("Error:", xhr);
            toastr.error("Failed to load member details");
        }
    });
}

function setData() {
    console.log("Setting data display");
    console.log("Current Member:", currentMember);
    console.log("Clan Data:", clanData);

    // Update clan header information
    updateClanHeader();

    // Update member list
    updateMemberList();

    // Setup leave clan modal
    setupLeaveClanModal();

    //set Join request
    setUpJoinReq();
}

function setUpJoinReq() {
    let token = localStorage.getItem("token");

    console.log("Clan ID:", clanId);
    $.ajax({
        url: `http://localhost:8080/api/v1/join-request/getByClanId?clanId=${encodeURIComponent(clanId)}`,
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (res) {
            console.log("Join Request Response Data:", res);
            renderJoinRequests(res.data);
        },
        error: function (xhr) {
            console.error("Error:", xhr);
            toastr.error("Failed to load member details");
        }
    });
}
function renderJoinRequests(requests) {
    let container = $("#joinRequestsList");
    container.empty();

    requests.forEach(req => {
        let player = req.player;
        let requestId = req.id;

        let requestHtml = `
            <div class="flex items-center space-x-3 border border-accent/10 rounded-lg p-2" data-request-id="${requestId}">
                <div class="relative">
                    <img src="${player.imageUrl}" alt="${player.playerName}" class="w-10 h-10 rounded-full" />
                    <div class="absolute -bottom-1 -right-1 w-4 h-4 ${player.isOnline ? "bg-accent" : "bg-gray-400"} rounded-full border-2 border-surface"></div>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2 mb-1">
                        <span class="text-sm font-medium text-text-primary">${player.playerName}</span>
                    </div>
                    <p class="text-sm text-text-primary break-words">${req.message}</p>
                </div>
                <button onclick="acceptRequest(${requestId})" class="bg-accent hover:bg-accent-600 text-white p-2 rounded-lg transition-gaming">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                </button>
                <button onclick="rejectRequest(${requestId})" class="bg-error hover:bg-error-600 text-white p-2 rounded-lg transition-gaming">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `;

        container.append(requestHtml);
    });
}

function acceptRequest(requestId) {
    let token = localStorage.getItem("token");

    console.log("Request ID:", requestId);
    $.ajax({
        url: `http://localhost:8080/api/v1/join-request/accept?id=${requestId}`,
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function () {
            toastr.success("Request accepted!");
            $(`[data-request-id='${requestId}']`).remove();
            setUpJoinReq();
        },
        error: function (xhr) {
            console.error("Error:", xhr);
            toastr.error("Failed to accept request");
        }
    });
}

function rejectRequest(requestId) {
    let token = localStorage.getItem("token");

    $.ajax({
        url: `http://localhost:8080/api/v1/join-request/delete?id=${requestId}`,
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function () {
            toastr.info("Request rejected!");
            $(`[data-request-id='${requestId}']`).remove();
        },
        error: function (xhr) {
            console.error("Error:", xhr);
            toastr.error("Failed to reject request");
        }
    });
}


function updateClanHeader() {
    if (clanData.clanLogoUrl) {
        $('#clanLogo').attr('src', clanData.clanLogoUrl);
    }

    // Update clan name
    $('h1').first().text(clanData.name);

    // Update member count
    const totalMembers = clanData.members ? clanData.members.length : 0;
    const memberLimit = clanData.memberLimit || 50;
    $('#memberCount').html(`
        <svg class="w-4 h-4 mr-1 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        ${totalMembers}/${memberLimit} Members
    `);

    // Update clan ranking points
    $('#clanRank').html(`
        <svg class="w-4 h-4 mr-1 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
        </svg>
        ${clanData.rankingPoints || 0} RP
    `);

    // Update clan status
    const statusText = clanData.clanType || 'OPEN';
    $('#clanStatus').text(statusText);

    // Update user role
    if (currentMember && currentMember.role) {
        const roleText = currentMember.role;
        $('.text-right .text-accent').text(roleText);
    }
}

function updateMemberList() {
    if (!clanData.members || clanData.members.length === 0) {
        return;
    }

    // Count online members (for now, we'll assume all are online since we don't have online status in the data)
    const onlineCount = clanData.members.length; // You might need to adjust this based on actual online status
    $('.bg-accent\\/10.text-accent').text(`${onlineCount} online`);

    // Get the member list container
    const memberListContainer = $('.space-y-3.max-h-60.overflow-y-auto');

    // Clear existing members (except the current structure)
    memberListContainer.empty();

    // Add members to the list
    clanData.members.forEach(member => {
        const isCurrentUser = currentMember && member.playerId === currentMember.player.playerId;
        const memberRole = member.role;

        let roleDisplay = '';
        let roleClass = '';

        if (memberRole === 'LEADER') {
            roleDisplay = 'Leader';
            roleClass = 'bg-warning/10 text-warning';
        } else if (memberRole === 'OFFICER') {
            roleDisplay = 'Officer';
            roleClass = 'bg-accent/10 text-accent';
        }

        // For demo purposes, using placeholder images and names
        // In a real scenario, you'd fetch player details for each member
        const playerName = isCurrentUser ? 'You' : `Player_${member.playerId.substring(0, 4)}`;
        const playerImage = isCurrentUser ? currentMember.player.imageUrl || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=40&h=40&fit=crop&crop=face'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face';

        const memberHTML = `
            <div class="flex items-center space-x-3">
                <div class="relative">
                    <img src="${playerImage}" alt="${playerName}" class="w-10 h-10 rounded-full" />
                    <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-surface"></div>
                </div>
                <div class="flex-1">
                    <div class="flex items-center space-x-2">
                        <p class="text-sm font-medium ${isCurrentUser ? 'text-accent' : 'text-text-primary'}">${playerName}</p>
                        ${roleDisplay ? `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${roleClass}">${roleDisplay}</span>` : ''}
                    </div>
                    <p class="text-xs text-text-secondary">Online</p>
                </div>
            </div>
        `;

        memberListContainer.append(memberHTML);
    });
}

function setupLeaveClanModal() {
    // Show modal when leave button is clicked
    $('#leave-clan-btn').on('click', function() {
        $('#leave-clan-modal').removeClass('hidden');
    });

    // Hide modal when cancel is clicked
    $('#cancel-leave').on('click', function() {
        $('#leave-clan-modal').addClass('hidden');
    });

    // Handle leave clan confirmation
    $('#confirm-leave').on('click', function() {
        leaveClan();
    });

    // Close modal when clicking outside
    $('#leave-clan-modal').on('click', function(e) {
        if (e.target === this) {
            $(this).addClass('hidden');
        }
    });
}

function leaveClan() {
    const token = localStorage.getItem("token");

    if (!currentMember || !currentMember.id) {
        toastr.error("Unable to leave clan - member information not found");
        return;
    }
    let clanId = currentMember.clan.id;
    console.log(clanId + "ClanID")
    console.log(currentMember.id + "MemberID")
    if (!clanId) {
        toastr.error("Unable to leave clan - clan information not found");
        return;
    }

    $.ajax({
        url: `http://localhost:8080/api/v1/clan-member/leave?playerId=${currentMember.player.playerId}&clanId=${clanId}`,
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (res) {
            console.log(res);
            if (res.code === 201) {
                toastr.success("Successfully left the clan");
                $('#leave-clan-modal').addClass('hidden');
                // Redirect to clans page or dashboard
                window.location.href = 'clan_directory.html'; // Adjust this URL as needed
            } else {
                toastr.error("Failed to leave clan");
            }
        },
        error: function (xhr) {
            console.error("Error leaving clan:", xhr);
            toastr.error("Failed to leave clan");
            $('#leave-clan-modal').addClass('hidden');
        }
    })
}