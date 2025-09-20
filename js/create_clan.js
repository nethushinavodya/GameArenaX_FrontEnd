let uploadedLogoUrl = "";
let uploadedBannerUrl = "";
let createdClanId = null;

$(document).ready(function () {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    if (!token || !email) {
        toastr.error("Please login first.");
        window.location.href = "login.html";
        return;
    }

    // Elements
    const $logoDropZone = $("#logo-drop-zone");
    const $logoInput = $("#logo-input");
    const $logoPreviewWrap = $("#logo-preview");
    const $logoImage = $("#logo-image");
    const $removeLogoBtn = $("#remove-logo");

    const $bannerDropZone = $("#banner-drop-zone");
    const $bannerInput = $("#banner-input");
    const $bannerPreviewWrap = $("#banner-preview");
    const $bannerImage = $("#banner-image");
    const $removeBannerBtn = $("#remove-banner");

    const $clanName = $("#clan-name");
    const $nameCheck = $("#name-check");
    const $nameAvailableSvg = $("#name-available");
    const $nameTakenSvg = $("#name-taken");
    const $nameAvailableText = $("#name-available-text");
    const $nameTakenText = $("#name-taken-text");

    const $desc = $("#clan-description");
    const $charCount = $("#char-count");

    const $memberLimitRange = $("#member-limit");
    const $memberLimitDisplay = $("#member-limit-display");

    const $clanTypeOptions = $(".clan-type-option");
    const $createForm = $("#create-clan-form");

    const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dihnh3it0/image/upload";
    const cloudinaryPreset = "MKYDGaming";

    // ---------- Helper utilities ----------
    function readableFileSize(bytes) {
        const thresh = 1024;
        if (Math.abs(bytes) < thresh) return bytes + " B";
        const units = ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        let u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while (Math.abs(bytes) >= thresh && u < units.length - 1);
        return bytes.toFixed(1) + " " + units[u];
    }

    function showLogoPreview(url) {
        $logoImage.attr("src", url);
        $logoPreviewWrap.removeClass("hidden");
        $("#logo-upload-content").addClass("hidden");
    }

    function hideLogoPreview() {
        uploadedLogoUrl = "";
        $logoImage.attr("src", "");
        $logoPreviewWrap.addClass("hidden");
        $("#logo-upload-content").removeClass("hidden");
    }

    function showBannerPreview(url) {
        $bannerImage.attr("src", url);
        $bannerPreviewWrap.removeClass("hidden");
        $("#banner-upload-content").addClass("hidden");
    }

    function hideBannerPreview() {
        uploadedBannerUrl = "";
        $bannerImage.attr("src", "");
        $bannerPreviewWrap.addClass("hidden");
        $("#banner-upload-content").removeClass("hidden");
    }

    function setupDropZone(dropZone, input, maxSizeBytes, type) {
        // click opens file picker
        dropZone.on("click", () => input.click());

        dropZone.on("dragover", function (e) {
            e.preventDefault();
            dropZone.addClass("border-accent/50");
        });
        dropZone.on("dragleave drop", function (e) {
            e.preventDefault();
            dropZone.removeClass("border-accent/50");
        });

        input.on("change", function (e) {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            handleFileSelected(file, type, maxSizeBytes);
        });

        dropZone.on("drop", function (e) {
            e.preventDefault();
            const dataTransfer = e.originalEvent.dataTransfer;
            if (!dataTransfer || !dataTransfer.files || dataTransfer.files.length === 0) return;
            const file = dataTransfer.files[0];
            handleFileSelected(file, type, maxSizeBytes);
        });
    }

    function handleFileSelected(file, type, maxSizeBytes) {
        if (!file.type.startsWith("image/")) {
            toastr.error("Please upload a valid image file (PNG / JPG / JPEG).");
            return;
        }
        if (file.size > maxSizeBytes) {
            toastr.error(`File too large (${readableFileSize(file.size)}). Max allowed is ${readableFileSize(maxSizeBytes)}.`);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        if (type === "logo") {
            showLogoPreview(objectUrl);
        } else {
            showBannerPreview(objectUrl);
        }
        uploadToCloudinary(file, type);
    }

    setupDropZone($logoDropZone, $logoInput, 2 * 1024 * 1024, "logo");     // 2MB
    setupDropZone($bannerDropZone, $bannerInput, 5 * 1024 * 1024, "banner"); // 5MB

    $removeLogoBtn.on("click", function () {
        hideLogoPreview();
        $logoInput.val("");
    });

    $removeBannerBtn.on("click", function () {
        hideBannerPreview();
        $bannerInput.val("");
    });

    async function uploadToCloudinary(file, type) {
        const $statusToastId = `uploading-${type}`;
        toastr.info(`Uploading ${type}...`, { timeOut: 0, extendedTimeOut: 0, closeButton: true, tapToDismiss: false });

        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", cloudinaryPreset);

        try {
            const res = await fetch(cloudinaryUrl, {
                method: "POST",
                body: fd
            });
            const data = await res.json();
            if (data && data.secure_url) {
                if (type === "logo") {
                    uploadedLogoUrl = data.secure_url;
                } else {
                    uploadedBannerUrl = data.secure_url;
                }
                toastr.clear(); // clear previous info toast
                toastr.success(`${type === "logo" ? "Logo" : "Banner"} uploaded successfully`);
            } else {
                console.error("Cloudinary response:", data);
                toastr.clear();
                toastr.error("Image upload failed");
            }
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            toastr.clear();
            toastr.error("Error uploading image");
        }
    }

    let nameCheckTimer = null;
    const NAME_CHECK_DELAY = 600; // ms

    $clanName.on("input", function () {
        const value = $(this).val().trim();
        $nameCheck.addClass("hidden");
        $nameAvailableSvg.addClass("hidden");
        $nameTakenSvg.addClass("hidden");
        $nameAvailableText.addClass("hidden");
        $nameTakenText.addClass("hidden");

        if (nameCheckTimer) clearTimeout(nameCheckTimer);
        if (!value) return;

        nameCheckTimer = setTimeout(() => {

        }, NAME_CHECK_DELAY);
    });

    $charCount.text(`${$desc.val().length}/1000`);
    $desc.on("input", function () {
        const len = $(this).val().length;
        $charCount.text(`${len}/1000`);
    });

    $memberLimitDisplay.text($memberLimitRange.val());
    $memberLimitRange.on("input change", function () {
        $memberLimitDisplay.text($(this).val());
    });

    $clanTypeOptions.on("click", function (e) {
        e.preventDefault();
        $clanTypeOptions.removeClass("border-accent/50 bg-accent/5");
        $(this).addClass("border-accent/50 bg-accent/5");
        $(this).find("input[type=radio]").prop("checked", true);
    });

    $createForm.on("submit", async function (e) {
        e.preventDefault();

        // Basic validations
        const name = $clanName.val().trim();
        const contactEmail = $("#clan-email").val().trim();
        const clanType = $("input[name='clanType']:checked").val();
        const description = $desc.val().trim();
        const memberLimit = parseInt($memberLimitRange.val(), 10);

        if (!name) {
            toastr.error("Clan name is required.");
            $clanName.focus();
            return;
        }
        if (!contactEmail) {
            toastr.error("Contact email is required.");
            $("#clan-email").focus();
            return;
        }
        if (!clanType) {
            toastr.error("Please select a clan type.");
            return;
        }

        const logoFileSelected = $logoInput[0].files && $logoInput[0].files.length > 0;
        const bannerFileSelected = $bannerInput[0].files && $bannerInput[0].files.length > 0;

        if (logoFileSelected && !uploadedLogoUrl) {
            toastr.warning("Please wait for logo to finish uploading.");
            return;
        }
        if (bannerFileSelected && !uploadedBannerUrl) {
            toastr.warning("Please wait for banner to finish uploading.");
            return;
        }

        const payload = {
            name: name,
            description: description || null,
            email: contactEmail,
            clanLogoUrl: uploadedLogoUrl || null,
            bannerUrl: uploadedBannerUrl || null,
            memberLimit: memberLimit,
            availableSlots: memberLimit,
            clanType: clanType,
            rankingPoints: 0
        };
        const $submitBtn = $createForm.find("button[type=submit]");
        $submitBtn.prop("disabled", true).text("Creating...");

        try {
            const res = await $.ajax({
                method: "POST",
                url: "http://localhost:8080/api/v1/clan/create",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(payload)
            });

            console.log("Create clan response:", res);

            const successful = res && (res.code === 200 || res.code === 201 || res.message === "Success" || res.data);
            if (successful) {
                const clanData = res.data || res;
                createdClanId = (clanData && (clanData.id || clanData.clanId || clanData.data && clanData.data.id)) || null;
                const createdName = (clanData && (clanData.name || clanData.clanName || clanData.data && clanData.data.name)) || name;

                $("#created-clan-name").text(createdName);
                $("#success-modal").removeClass("hidden").fadeIn(150);

                toastr.success("Clan created successfully!");

                // Wire up the modal buttons
                $("#view-clan-btn").off("click").on("click", function () {
                    if (createdClanId) {
                        window.location.href = `clan_member_dashboard.html?id=${createdClanId}`;
                    } else {
                        window.location.href = `clan_member_dashboard.html?name=${encodeURIComponent(createdName)}`;
                    }
                });

                $("#invite-members-btn").off("click").on("click", function () {
                    if (createdClanId) {
                        window.location.href = `clan_invite.html?clanId=${createdClanId}`;
                    } else {
                        window.location.href = `clan_invite.html?name=${encodeURIComponent(createdName)}`;
                    }
                });

            } else {
                console.warn("Unexpected create clan response:", res);
                toastr.error("Failed to create clan. Check console for details.");
            }
        } catch (xhr) {
            console.error("Create clan error:", xhr);
            const errText = xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : xhr.responseText;
            toastr.error("Create clan failed: " + (errText || "Server error"));
        } finally {
            $submitBtn.prop("disabled", false).text("Create Clan");
        }
    });

    // Close success modal when clicking outside or press Escape (optional)
    $(document).on("keydown", function (e) {
        if (e.key === "Escape") {
            $("#success-modal").fadeOut(150, function () {
                $(this).addClass("hidden");
            });
        }
    });

    $("#success-modal").on("click", function (e) {
        if (e.target === this) {
            $(this).fadeOut(150, function () {
                $(this).addClass("hidden");
            });
        }
    });
});
