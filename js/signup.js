$(document).ready(function () {
    initializeUI();
    updateHeaderUI();

});


function initializeUI() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const loginBtn = document.getElementById("loginBtnNav");
    const registerBtn = document.getElementById("registerBtn");
    const logoutBtn = document.getElementById("logoutBtnNav");

    if (token && role) {
        if (loginBtn) loginBtn.style.display = "none";
        if (registerBtn) registerBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "flex";
/*
        const currentPage = window.location.pathname.split("/").pop();
        if (role === "Admin" && currentPage !== "adminDashboard.html") {
            window.location.href = "adminDashboard.html";
        } else if (role === "User" && currentPage !== "index2.html") {
            window.location.href = "index2.html";
        }*/
    } else {
        if (loginBtn) loginBtn.style.display = "flex";
        if (registerBtn) registerBtn.style.display = "flex";
        if (logoutBtn) logoutBtn.style.display = "none";
    }
}


$("#loginBtn").click(function () {
    let email = $("#email").val();
    let password = $("#password").val();

    if (!email || !password) {
        return;
    }

    $.ajax({
        method: "POST",
        url: "http://localhost:8080/api/v1/auth/authenticate",
        headers: {
            "Content-Type": "application/json",
        },
        data: JSON.stringify({
            email: email,
            password: password,
        }),
        dataType: "json",
        success: function (data) {
            console.log(data);
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("role", data.data.role);
            localStorage.setItem("username", data.data.username);
            localStorage.setItem("email",data.data.email);
            localStorage.setItem("id",data.data.uuid);


            $("#email").val("");
            $("#password").val("");

            toastr.success("Login successful!");

            toastr.options = {
                closeButton: true,
                progressBar: true,
                positionClass: "toast-top-right",
                preventDuplicates: true,
                timeOut: 3000,
                extendedTimeOut: 1000,
            };

            updateHeaderUI();

            if (data.data.role === "Admin") {
                window.location.href = "adminDashboard.html";
            } else{
                window.location.href = "index2.html";
            }
        },
        error: function () {
            toastr.error("Email or Password is incorrect!");
            toastr.options = {
                closeButton: true,
                progressBar: true,
                positionClass: "toast-top-right",
                preventDuplicates: true
            };
            $("#email").val("");
            $("#password").val("");
            openModal("loginModal");
        },
    });
});


$("#registerBtn").click(function (e) {
    e.preventDefault(); // prevent default submission

    let name = $("#userName").val();
    let email = $("#register-email").val();
    let password = $("#register-password").val();
    let confirmPassword = $("#confirm-password").val();
    let country = $("#country").val();
    let role = "User";
    let status = "Active";

    // Check if inline errors exist
    if ($("#usernameError").text() || $("#emailError").text()) {
        toastr.error("Please fix the errors before submitting!");
        return;
    }

    if (!name || !email || !password || !confirmPassword || !country) {
        toastr.error("Please fill in all fields!");
        return;
    }

    if (password !== confirmPassword) {
        toastr.error("Passwords do not match!");
        return;
    }

    $.ajax({
        method: "POST",
        url: "http://localhost:8080/api/v1/user/register",
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({ username: name, email: email, password, role, status, profilePicture: "", country }),
        dataType: "json",
        success: function (data) {
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("username", data.data.username);
            localStorage.setItem("role", data.data.role || "User");
            localStorage.setItem("email",data.data.email);

            toastr.success("Registration successful!");

            toastr.options = {
                closeButton: true,
                progressBar: true,
                positionClass: "toast-top-right",
                preventDuplicates: true,
                timeOut: 3000,
                extendedTimeOut: 1000,
            };
            updateHeaderUI();
            window.location.href = "index2.html";
        },
        error: function (xhr) {
            toastr.error("Registration failed!");
            toastr.options = {
                closeButton: true,
                progressBar: true,
                positionClass: "toast-top-right",
                preventDuplicates: true,
                timeOut: 3000,
                extendedTimeOut: 1000,
            };
            console.log(xhr);
        }
    });
});

// Username check
$("#userName").on("blur", function () {
    let username = $(this).val();
    if (!username) return;

    $.ajax({
        url: "http://localhost:8080/api/v1/user/check-username",
        method: "GET",
        data: { username: username },
        success: function (exists) {
            if (exists) {
                $("#userName").css("border", "2px solid red");
                $("#usernameError").text("⚠️ Username already exists").css("color", "red");
            } else {
                $("#userName").css("border", "2px solid green");
                $("#usernameError").text("");
            }
        }
    });
});

// Email check
$("#register-email").on("blur", function () {
    let email = $(this).val();
    if (!email) return;

    $.ajax({
        url: "http://localhost:8080/api/v1/user/check-email",
        method: "GET",
        data: { email: email },
        success: function (exists) {
            if (exists) {
                $("#register-email").css("border", "2px solid red");
                $("#emailError").text("⚠️ Email already exists").css("color", "red");
            } else {
                $("#register-email").css("border", "2px solid green");
                $("#emailError").text("");
            }
        }
    });
});

function updateHeaderUI() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    const loginBtn = document.getElementById("loginBtnNav");
    const registerBtn = document.getElementById("registerBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const userProfile = document.getElementById("userProfile");
    const logo = document.getElementById("logo");
/*
    const usernameDisplay = document.getElementById("usernameDisplay");
*/

    if (token) {
        if (loginBtn) loginBtn.style.display = "none";
        if (registerBtn) registerBtn.style.display = "none";

        if (logoutBtn) logoutBtn.style.display = "flex";
        if (userProfile) {
            userProfile.style.display = "flex";
            userProfile.classList.remove("hidden");  // remove Tailwind hidden class

        }

        if (usernameDisplay) usernameDisplay.innerHTML = `<img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop" alt="Player Avatar" class="w-8 h-8 rounded-full border-2 border-primary shadow-glow-primary" onerror="this.src='https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; this.onerror=null;" />`;
    } else {
        if (loginBtn) loginBtn.style.display = "flex";
        if (registerBtn) registerBtn.style.display = "flex";

        if (logoutBtn) logoutBtn.style.display = "none";
        if (userProfile) {
            userProfile.style.display = "none";
            userProfile.classList.add("hidden");  // add hidden class
        }

        if (usernameDisplay) usernameDisplay.innerHTML = "";
    }
}


$("#logoutBtn").click(function () {
    console.log("logoutBtn clicked");
    let confirmLogout = confirm("Do you really want to log out?");
    if (!confirmLogout) return;

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    window.location.href = "index2.html";
});

function openModal(id) {
    document.getElementById(id).classList.add("active");
}

function closeModal(id) {
    document.getElementById(id).classList.remove("active");
}
