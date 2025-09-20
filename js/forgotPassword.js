let userEmail = "";
let otpVerified = false;

$("#sendOtp").click(function() {
    let email = $("#otpEmail").val();

    if (!email) {
        alert("Please enter email!");
        return;
    }

    $.ajax({
        method: "POST",
        url: "http://localhost:8080/api/v1/password/sendOtp",
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({ email: email }),
        success: function(data) {
            toastr.success("OTP sent successfully!");
            toastr.options = {
                closeButton: true,
                progressBar: true,
                positionClass: "toast-top-right",
                preventDuplicates: true
            };

            userEmail = email;
            otpVerified = false;
            openModal("otpModal");
            startOtpCountdown(60); // Changed to 1 minute (60 seconds)
        },
        error: function(xhr) {
            toastr.error("Error sending OTP!");
            toastr.options = {
                closeButton: true,
                progressBar: true,
                positionClass: "toast-top-right",
                preventDuplicates: true
            };
        }
    });
});

function handleOTP(event) {
    event.preventDefault();

    let otp = "";
    $(".otp-input").each(function() {
        otp += $(this).val();
    });

    if (otp.length !== 4) {
        alert("Please enter a 4-digit OTP");
        return;
    }

    $.ajax({
        method: "POST",
        url: "http://localhost:8080/api/v1/password/verifyOtp",
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({ email: userEmail, otp: otp }),
        success: function(data) {
            toastr.success("OTP verified successfully!");
            toastr.options = {
                closeButton: true,
                progressBar: true,
                positionClass: "toast-top-right",
                preventDuplicates: true
            };
            otpVerified = true;
            closeModal("otpModal");
            openModal("newPasswordModal");
        },
        error: function(xhr) {
            toastr.error("Error verifying OTP!");
            toastr.options = {
                closeButton: true,
                progressBar: true,
                positionClass: "toast-top-right",
                preventDuplicates: true
            };
            /*clear the OTP inputs*/
            $(".otp-input").each(function() {
                $(this).val("");
            });
        }
    });
}

$("#resetPassword").click(function() {
    let newPassword = $("#newPassword").val();
    let confirmPassword = $("#confirmPassword").val();

    if (!newPassword || !confirmPassword) {
        alert("Please fill in all fields!");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    $.ajax({
        method: "PUT",
        url: "http://localhost:8080/api/v1/password/updatePassword",
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({ email: userEmail, password: newPassword }),
        success: function(data) {
            toastr.success("Password reset successfully!");
            toastr.options = {
                closeButton: true,
                progressBar: true,
                positionClass: "toast-top-right",
                preventDuplicates: true
            };
            closeModal("newPasswordModal");
        },
        error: function(xhr) {
            toastr.error("Error resetting password!");
            toastr.options = {
                closeButton: true,
                progressBar: true,
                positionClass: "toast-top-right",
                preventDuplicates: true
            };
        }
    });
});

let otpTimerInterval;
function startOtpCountdown(seconds) {
    clearInterval(otpTimerInterval);
    let timeLeft = seconds;

    $("#resendOtpLink").addClass("disabled-link").removeClass("text-link");
    $("#resendOtpTimer").show();

    otpTimerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(otpTimerInterval);
            $("#resendOtpLink").removeClass("disabled-link").addClass("text-link");
            $("#resendOtpTimer").text("You can now resend OTP").removeClass("text-gray-400").addClass("text-green-400");
            return;
        }

        let min = Math.floor(timeLeft / 60);
        let sec = timeLeft % 60;
        $("#resendOtpTimer").text(`Resend available in ${min}:${sec.toString().padStart(2, '0')}`);
        timeLeft--;
    }, 1000);
}

function resendOTP() {
    if ($("#resendOtpLink").hasClass("disabled-link")) {
        return false;
    }

    $("#otpEmail").val(userEmail);
    $("#sendOtp").click();
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add("active");
}
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove("active");
    clearInterval(otpTimerInterval);
}