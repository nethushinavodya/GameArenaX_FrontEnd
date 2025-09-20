let uploadedImageUrl = "";

$(document).ready(function () {
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (!email || !token || !username) {
        window.location.href = "index2.html";
        return;
    }

    loadUserProfileData(username , token);


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

    $("#profileEditForm").on("submit", function (e) {
        e.preventDefault();

        // Ensure image is uploaded if selected
        if (fileInput.files.length > 0 && !uploadedImageUrl) {
            toastr.warning("Please wait for the image to finish uploading");
            return;
        }

        editProfile();
    });
});

function loadUserProfileData(username, token) {
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
                console.log("User Data:", user);
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
    console.log("UserSet  Data:", user);
  $("#uuid").text(user.uuid);
  $("#username").text(user.username);
  $("#email").val(user.email);
    // after you have user.country
    $("#editCountry").val(user.country || "");
// if using a plugin like Select2, also do:
    $("#editCountry").trigger("change");
  $("#role").text(user.role);

    if (user.status === "Active") {
        $("#status").text("Active");
        $("#status").addClass("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success border border-success/30");
        $("#status").html(`<div class="w-2 h-2 bg-success rounded-full mr-1.5"></div>${user.status === "Active" ? "Active" : "Inactive"}`);
    } else {
        $("#status").text("Deactivated");
        $("#status").addClass("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error/20 text-error border border-error/30");
        $("#status").html(`<div class="w-2 h-2 bg-error rounded-full mr-1.5"></div>${user.status === "Active" ? "Active" : "Inactive"}`);
    }
    $("#profileImg").attr("src", user.profilePicture);
}

// Submit edited profile
function editProfile() {
    const formData = {
        email: $("#email").val(),
        country: $("#editCountry").val(),
        profilePicture: uploadedImageUrl || $("#profileImg").attr("src"), // use imageUrl
        username: $("#username").text(),

    };

    $.ajax({
        method: "PUT",
        url: "http://localhost:8080/api/v1/user/update",
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify(formData),
        success: function (res) {
            if (res && res.data) {
                setProfileData(res.data);
                toastr.success("Profile updated successfully!");
                window.location.href = "user_profile_view.html";
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
