// profile.js
$(document).ready(function () {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    // Redirect to login if not logged in
    if (!username || !token) {
        toastr.error("Please login first!");
        window.location.href = "login.html";
        return;
    }

    // Load user profile
    loadUserProfile(username, token);

});

function loadUserProfile(username, token) {
    console.log("Loading profile for:", username);
    console.log("Token:", token);
    $.ajax({
        url: `http://localhost:8080/api/v1/user/get-by-username?username=${username}`,
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        success: function (res) {
            console.log("User Response Data:", res);
            if (res.code === 200) {
                const user = res.data;
                setProfileData(user);
            }
        },
        error: function (xhr) {
            console.error("Error:", xhr);
            toastr.error("Failed to load User details");
        }
    });
}

function setProfileData(user) {
    console.log("user" + user);

    $("#username").text(user.username);
    $("#userId").text(user.uuid);
    $("#userUsername").text(user.username);
    $("#userEmail").text(user.email);
    $("#userRole").text(user.role);

    if (user.status === "Active") {
        $("#statusIndicator").text("Online");
        $("#statusIndicator").addClass("absolute -bottom-2 -right-2 bg-success text-background text-xs font-bold px-2 py-1 rounded-full border-2 border-surface");
    }else {
        $("#statusIndicator").text("Offline");
        $("#statusIndicator").addClass("absolute -bottom-2 -right-2 bg-gray-400 text-background text-xs font-bold px-2 py-1 rounded-full border-2 border-surface");
    }
    if (user.status === "Active") {
        $("#userStatus").text("Active");
        $("#userStatus").addClass("text-green-400");
    } else {
        $("#userStatus").text("Deactivated");
        $("#userStatus").addClass("text-red-400");
    }
    $("#userCountry").text(user.country);
    $("#country").text(user.country);
    $("#role").addClass("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30").text(user.role);

    if (user.status === "Active") {
        $("#status").text("Active");
        $("#status").addClass("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success border border-success/30");
        $("#status").html(`<div class="w-2 h-2 bg-success rounded-full mr-1.5"></div>${user.status === "Active" ? "Active" : "Inactive"}`);
    } else {
        $("#status").text("Deactivated");
        $("#status").addClass("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error/20 text-error border border-error/30");
        $("#status").html(`<div class="w-2 h-2 bg-error rounded-full mr-1.5"></div>${user.status === "Active" ? "Active" : "Inactive"}`);
    }

    if (user.profilePicture){
        $("#profilePicture").attr("src", user.profilePicture);
    }else {
        $("#profilePicture").attr("src", "https://via.placeholder.com/150");
    }
}