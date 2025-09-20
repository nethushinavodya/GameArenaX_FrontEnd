let uploadedImageUrl = ""; // store uploaded Cloudinary URL

$(document).ready(function () {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (!username || !token) {
        toastr.error("Please login first!");
        window.location.href = "index2.html";
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

    // About section character counter
    $("#about").on("input", function () {
        const len = $(this).val().length;
        $("#aboutCount").text(len);
        if (len === 0) {
            $("#aboutError").removeClass("hidden");
        } else {
            $("#aboutError").addClass("hidden");
        }
    });

    // Image upload & drag & drop
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("profilePicture");
    const previewImg = document.getElementById("profileImg");
    const uploadStatus = document.getElementById("uploadStatus");

    // Handle files function
    function handleFiles(files) {
        const file = files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toastr.error("Please upload a valid image file");
            return;
        }

        // Show preview
        previewImg.src = URL.createObjectURL(file);

        // Upload to Cloudinary
        uploadImageToCloudinary(file);
    }

    // Drag & Drop events
    dropZone.ondragover = (e) => e.preventDefault();
    dropZone.ondrop = (e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };
    dropZone.onclick = () => fileInput.click();

    // File input change
    fileInput.onchange = (e) => handleFiles(e.target.files);

    // Upload image to Cloudinary
    async function uploadImageToCloudinary(file) {
        uploadStatus.classList.remove("hidden");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "MKYDGaming");

        try {
            const res = await fetch("https://api.cloudinary.com/v1_1/dihnh3it0/image/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.secure_url) {
                uploadedImageUrl = data.secure_url;
                toastr.success("Image uploaded successfully!");
            } else {
                toastr.error("Image upload failed");
            }
        } catch (err) {
            console.error(err);
            toastr.error("Error uploading image");
        } finally {
            uploadStatus.classList.add("hidden");
        }
    }

    // Form submit
    $("#playerEditForm").on("submit", function (e) {
        e.preventDefault();

        // Check About section
        if ($("#about").val().trim() === "") {
            $("#aboutError").removeClass("hidden");
            return;
        }

        // Ensure image is uploaded if selected
        if (fileInput.files.length > 0 && !uploadedImageUrl) {
            toastr.warning("Please wait for the image to finish uploading");
            return;
        }

        editProfile();
    });
});

// Load player details from backend
function loadPlayerDetails(username) {
    $.ajax({
        method: "GET",
        url: `http://localhost:8080/api/v1/player/getByUsername?username=${username}`,
        headers: { "Content-Type": "application/json" },
        success: function (res) {
            if (res && res.data && res.data.length > 0) {
                const player = res.data[0];
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

// Set player profile data in form
function setProfileData(player) {
    $("#playerId").text(player.playerId || "N/A");
    $("#email").text(player.email || "N/A");

    if (player.status === "Active") {
        $("#accountStatus").html(`
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success border border-success/30">
                <div class="w-2 h-2 bg-success rounded-full mr-1.5"></div>
                Active
            </span>
        `);
    } else {
        $("#accountStatus").html(`
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error/20 text-error border border-error/30">
                <div class="w-2 h-2 bg-error rounded-full mr-1.5"></div>
                Inactive
            </span>
        `);
    }

    $("#playerName").val(player.playerName || "");
    $("#editCountry").val(player.country || "");
    $("#about").val(player.about || "");
    $("#aboutCount").text(player.about ? player.about.length : 0);

    // ✅ Set profile image correctly
    if (player.imageUrl) {
        $("#profileImg").attr("src", player.imageUrl);
        uploadedImageUrl = player.imageUrl; // existing image
    } else {
        $("#profileImg").attr("src", "default-avatar.png"); // fallback image
        uploadedImageUrl = "";
    }

    $("#totalWins").text(player.wins || 0);
    $("#totalMatches").text(player.totalMatches || 0);
    let winRate = 0;
    if (player.totalMatches > 0) {
        winRate = ((player.wins / player.totalMatches) * 100).toFixed(2);
    }
    $("#winRate").text(winRate + "%");
}

// Submit edited profile
function editProfile() {
    const formData = {
        playerId: $("#playerId").text(),
        playerName: $("#playerName").val(),
        country: $("#editCountry").val(),
        about: $("#about").val(),
        imageUrl: uploadedImageUrl || $("#profileImg").attr("src"), // use imageUrl
        email: $("#email").text()
    };

    $.ajax({
        method: "PUT",
        url: "http://localhost:8080/api/v1/player/updatePlayer",
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify(formData),
        success: function (res) {
            if (res && res.data) {
                setProfileData(res.data);
                toastr.success("Profile updated successfully!");
                window.location.href = "player_profile.html";
            } else {
                toastr.warning("Profile updated, but no data returned.");
            }
        },
        error: function (xhr) {
            console.error("Error:", xhr);
            toastr.error("Failed to update player details");
        }
    });
}
