let uploadedImageUrl = ""; // store uploaded Cloudinary URL
let uploadedBannerUrl = ""; // store uploaded banner URL

$(document).ready(function () {
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");

    if (!email || !token) {
        toastr.error("Please login first!");
        window.location.href = "login.html";
        return;
    }

    // Load streamer data
    loadStreamerDetails(email);

    // Logout
    $("#logoutBtn").on("click", function (e) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "index2.html";
    });

    // Bio section character counter
    $("#bio").on("input", function () {
        const len = $(this).val().length;
        $("#bioCount").text(len);
        if (len === 0) {
            $("#bioError").removeClass("hidden");
        } else {
            $("#bioError").addClass("hidden");
        }
    });

    // Profile Picture upload & drag & drop
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("profilePicture");
    const previewImg = document.getElementById("profilePreview");
    const uploadStatus = document.getElementById("uploadStatus");

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
        uploadImageToCloudinary(file, 'profile');
    }

    // Drag & Drop events for profile picture
    if (dropZone) {
        dropZone.ondragover = (e) => e.preventDefault();
        dropZone.ondrop = (e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
        };
        dropZone.onclick = () => fileInput.click();
    }

    if (fileInput) {
        fileInput.onchange = (e) => handleFiles(e.target.files);
    }

    // Banner upload handling
    const bannerInput = document.getElementById("bannerUpload");
    const bannerPreview = document.getElementById("bannerPreview");

    if (bannerInput) {
        bannerInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith("image/")) {
                toastr.error("Please upload a valid image file");
                return;
            }

            // Show preview
            bannerPreview.src = URL.createObjectURL(file);

            // Upload to Cloudinary
            uploadImageToCloudinary(file, 'banner');
        };
    }

    // Generic image upload function
    async function uploadImageToCloudinary(file, type) {
        if (uploadStatus) uploadStatus.classList.remove("hidden");

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
                if (type === 'profile') {
                    uploadedImageUrl = data.secure_url;
                } else if (type === 'banner') {
                    uploadedBannerUrl = data.secure_url;
                }
                toastr.success(`${type === 'profile' ? 'Profile picture' : 'Banner'} uploaded successfully!`);
            } else {
                toastr.error("Image upload failed");
            }
        } catch (err) {
            console.error(err);
            toastr.error("Error uploading image");
        } finally {
            if (uploadStatus) uploadStatus.classList.add("hidden");
        }
    }

    // Form submit
    $("#streamerEditForm").on("submit", function (e) {
        e.preventDefault();

        // Check bio section
        if ($("#bio").val().trim() === "") {
            $("#bioError").removeClass("hidden");
            return;
        }

        // Check if images are still uploading
        if ((fileInput && fileInput.files.length > 0 && !uploadedImageUrl) ||
            (bannerInput && bannerInput.files.length > 0 && !uploadedBannerUrl)) {
            toastr.warning("Please wait for images to finish uploading");
            return;
        }

        editProfile();
    });
});

// Load streamer details from backend
function loadStreamerDetails(email) {
    console.log("Email:", email);
    $.ajax({
        method: "GET",
        url: `http://localhost:8080/api/v1/streamers/getByEmail?email=${email}`,
        headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json"
        },
        success: function (res) {
            console.log("Streamer Response Data:", res);
            if (res && res.data) {
                const streamer = Array.isArray(res.data) ? res.data[0] : res.data;
                setProfileData(streamer);
            } else {
                toastr.error("No streamer found");
            }
        },
        error: function (xhr) {
            console.error("Error loading streamer details:", xhr);
            toastr.error("Failed to load streamer details");
        }
    });
}

// Set streamer profile data in form
function setProfileData(streamer) {
    console.log("Setting profile data:", streamer);

    // Set read-only fields
    $("#streamerId").text(streamer.id || streamer.streamerId || "N/A");
    $("#email").text(streamer.email || "N/A");

    // Verification badges
    const verifiedBadge    = $("#verifiedBadge");
    const notVerifiedBadge = $("#notVerifiedBadge");
    const verifiedTick     = $("#verifiedTick");
    const notVerifiedTick  = $("#notVerifiedTick");

    if (streamer.isVerified === true) {
        verifiedBadge.removeClass("hidden");
        verifiedTick.removeClass("hidden");
        notVerifiedBadge.addClass("hidden");
        notVerifiedTick.addClass("hidden");
    } else {
        notVerifiedBadge.removeClass("hidden");
        verifiedBadge.addClass("hidden");
        verifiedTick.addClass("hidden");
        notVerifiedTick.removeClass("hidden");
    }

    // Set verification status badge
    const verificationElement = $("#verificationStatus");
    if (streamer.isVerified === true) {
        verificationElement.html(`
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success border border-success/30">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Verified
            </span>
        `);

        // Update profile picture verification badge
        const profileContainer = $("#profilePreview").parent();
        if (!profileContainer.find('.verification-badge').length) {
            profileContainer.append(`
                <div class="absolute -top-2 -left-2 bg-primary text-white text-xs font-bold p-1 rounded-full border-2 border-surface verification-badge">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                </div>
            `);
        }
    } else {
        verificationElement.html(`
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/20 text-warning border border-warning/30">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                Pending Verification
            </span>
        `);

        // Remove verification badge if not verified
        $("#profilePreview").parent().find('.verification-badge').remove();
    }

    // Set current streaming status
    const statusElement = $("#currentStatus");
    if (streamer.isLive) {
        statusElement.html(`
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error/20 text-red-400 border border-error/30">
                <div class="w-2 h-2 bg-error rounded-full mr-1.5 animate-pulse"></div>
                Live Now
            </span>
        `);
    } else {
        statusElement.html(`
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
                <div class="w-2 h-2 bg-gray-500 rounded-full mr-1.5"></div>
                Offline
            </span>
        `);
    }

    // Set editable fields
    $("#displayName").val(streamer.displayName || streamer.name || streamer.streamerName || "");
    $("#platform").val(streamer.platform || "");
    $("#streamUrl").val(streamer.streamUrl || streamer.channelUrl || "");
    $("#country").val(streamer.country || "");
    $("#bio").val(streamer.bio || streamer.about || "");

    // Update bio character count
    const bioLength = streamer.bio ? streamer.bio.length : (streamer.about ? streamer.about.length : 0);
    $("#bioCount").text(bioLength);

    // Set profile image
    const profileImg = $("#profilePreview");
    if (streamer.profileImageUrl || streamer.imageUrl) {
        const imageUrl = streamer.profileImageUrl || streamer.imageUrl;
        profileImg.attr("src", imageUrl);
        uploadedImageUrl = imageUrl; // Set current image as uploaded
    } else {
        profileImg.attr("src", "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400");
        uploadedImageUrl = "";
    }

    // Set banner image
    const bannerImg = $("#bannerPreview");
    if (streamer.bannerImageUrl || streamer.bannerUrl) {
        const bannerUrl = streamer.bannerImageUrl || streamer.bannerUrl;
        bannerImg.attr("src", bannerUrl);
        uploadedBannerUrl = bannerUrl; // Set current banner as uploaded
    }

    // Set follower count
    $("#followers").text(`${streamer.followerCount || streamer.totalFollowers || 0} followers`);

    // Set join date
    if (streamer.joinedAt || streamer.createdAt) {
        const joinDate = new Date(streamer.joinedAt || streamer.createdAt);
        $("#joinDate").text(joinDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }));
    }

    // Set last live status
    if (streamer.lastLiveAt) {
        const lastLive = new Date(streamer.lastLiveAt);
        $("#lastLive").text(lastLive.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }));
    } else if (streamer.isLive) {
        $("#lastLive").text("Currently streaming");
    } else {
        $("#lastLive").text("Unknown");
    }
}

// Submit edited profile
function editProfile() {
    // Prepare form data matching your API structure
    const formData = {
        id: $("#streamerId").text(),
        displayName: $("#displayName").val(),
        platform: $("#platform").val(),
        streamUrl: $("#streamUrl").val(),
        country: $("#country").val(),
        bio: $("#bio").val(),
        email: $("#email").text()
    };

    // Add image URLs if they were uploaded or already exist
    if (uploadedImageUrl) {
        formData.profileImageUrl = uploadedImageUrl;
    }

    if (uploadedBannerUrl) {
        formData.bannerImageUrl = uploadedBannerUrl;
    }

    console.log("Sending update data:", formData);

    $.ajax({
        method: "PUT",
        url: "http://localhost:8080/api/v1/streamers/update",
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token'),
            "Content-Type": "application/json"
        },
        data: JSON.stringify(formData),
        success: function (res) {
            console.log("Update response:", res);
            if (res && (res.message === "Success" || res.code === 200 || res.code === 201)) {
                toastr.success("Profile updated successfully!");
                // Redirect after a delay
                setTimeout(() => {
                    window.location.href = "streamer_profile.html";
                }, 1500);
            } else {
                toastr.warning("Profile updated, but received unexpected response.");
                // Still redirect in case the update actually worked
                setTimeout(() => {
                    window.location.href = "streamer_profile_view.html";
                }, 2000);
            }
        },
        error: function (xhr) {
            console.error("Update error:", xhr);
            console.error("Response text:", xhr.responseText);
            toastr.error("Failed to update profile. Please try again.");
        }
    });
}