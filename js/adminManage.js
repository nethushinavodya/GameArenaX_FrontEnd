/*
let username = null;
let users = [];
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dihnh3it0/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "MKYDGaming";

// Open modal
function openAddModal() {
    document.getElementById('addUserModal').classList.add('active');
    clearForm('addUserForm');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    username = null;
}

function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
    const preview = form.querySelector('.image-preview');
    if (preview) preview.classList.add('hidden');
    $("#usernameError").text("");
    $("#emailError").text("");
}

// Capitalize
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Upload to Cloudinary
function uploadToCloudinary(file) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        $.ajax({
            url: CLOUDINARY_URL,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function(res) {
                resolve(res.secure_url);
            },
            error: function(err) {
                console.error("Cloudinary upload error:", err);
                reject(err);
            }
        });
    });
}

// Create table row
function createTableRow(user) {
    const statusLower = user.status.toLowerCase();
    const roleLower = user.role.toLowerCase();

    const banUnbanButton = (statusLower === 'deactivated') ?
        `<button class="btn-primary ban-unban-btn" data-email="${user.email}" data-status="${statusLower}">
            <i class="fas fa-unlock"></i> Unban
        </button>` :
        `<button class="btn-warning ban-unban-btn" data-email="${user.email}" data-status="${statusLower}">
            <i class="fas fa-ban"></i> Ban
        </button>`;
    const editDisabled = statusLower === 'deactivated' ? 'disabled' : '';

    return `<tr data-user-email="${user.email}" class="${statusLower === 'deactivated' ? 'opacity-70' : ''}">
        <td><img src="${user.profilePicture || 'https://via.placeholder.com/50'}" alt="Profile" class="user-profile-picture"></td>
        <td><strong>${user.username}</strong></td>
        <td>${user.email}</td>
        <td><span class="user-role role-${roleLower}">${user.role}</span></td>
        <td><i class="fas fa-map-marker-alt text-gray-400 mr-2"></i>${user.country}</td>
        <td><span class="status-badge status-${statusLower}">${capitalize(statusLower)}</span></td>
        <td>
            <div class="action-buttons">
                <button class="btn-secondary" onclick="editUser('${user.email}')" ${editDisabled}><i class="fas fa-edit"></i> Edit</button>
                ${banUnbanButton}
            </div>
        </td>
    </tr>`;
}

// Event listeners
$(document).on('click', '.ban-unban-btn', function () {
    const email = $(this).data('email');
    const status = $(this).data('status');
    if (status === 'active') banUser(email, this);
    else unbanUser(email, this);
});

// Functions ban and unban
function banUser(email, button) {
    if (!confirm('Are you sure you want to ban this user?')) return;
    $.ajax({
        url: `http://localhost:8080/api/v1/user/ban?email=${email}`,
        type: 'PUT',
        success: function() {
            showNotification('User banned successfully', 'success');
            updateRowStatus(button, 'deactivated');
            fetchUsers();
        },
        error: function(err) {
            console.error(err);
            showNotification('Error banning user', 'error');
        }
    });
}

function unbanUser(email, button) {
    if (!confirm('Are you sure you want to unban this user?')) return;
    $.ajax({
        url: `http://localhost:8080/api/v1/user/unban?email=${email}`,
        type: 'PUT',
        success: function() {
            showNotification('User unbanned successfully', 'success');
            updateRowStatus(button, 'active');
            fetchUsers();
        },
        error: function(err) {
            console.error(err);
            showNotification('Error unbanning user', 'error');
        }
    });
}

// Update row status
function updateRowStatus(button, status) {
    const row = $(button).closest('tr');
    const badge = row.find('.status-badge');

    if (status === 'deactivated') {
        $(button).removeClass('btn-warning').addClass('btn-primary').html('<i class="fas fa-unlock"></i> Unban').data('status', 'deactivated');
        row.addClass('opacity-70');
        badge.removeClass('status-active').addClass('status-deactivated').text('Deactivated');
    } else {
        $(button).removeClass('btn-primary').addClass('btn-warning').html('<i class="fas fa-ban"></i> Ban').data('status', 'active');
        row.removeClass('opacity-70');
        badge.removeClass('status-deactivated').addClass('status-active').text('Active');
    }
}

// Show notification
function showNotification(message, type) {
    toastr[type](message);
}

// Fetch users
function fetchUsers() {
    $.ajax({
        url: "http://localhost:8080/api/v1/user/get-all-admins-and-users",
        type: "GET",
        success: function(res) {
            const tbody = $("#usersTableBody");
            tbody.empty();
            users = res.data || res; // keep global

            if (Array.isArray(users) && users.length > 0) {
                users.forEach(user => tbody.append(createTableRow(user)));
            } else {
                tbody.append(`<tr><td colspan="7" class="text-center">No users found</td></tr>`);
            }
        },
        error: function(err) {
            console.error("Error fetching users:", err);
            showNotification('Failed to fetch users', 'error');
        }
    });
}
// Add user
$('#addUserForm').submit(async function(e) {
    e.preventDefault();

    const username = $('#username').val().trim().toLowerCase();
    const email = $('#email').val().trim().toLowerCase();

    if (users.some(user => user.username.toLowerCase() === username)) {
        $("#usernameError").text("Username already exists");
        return;
    } else {
        $("#usernameError").text("");
    }

    if (users.some(user => user.email.toLowerCase() === email)) {
        $("#emailError").text("Email already exists");
        return;
    } else {
        $("#emailError").text("");
    }

    const file = this.profilePictureFile.files[0];
    try {
        const imageUrl = await uploadToCloudinary(file);
        const payload = {
            username: $('#username').val(),
            email: $('#email').val(),
            password: $('#password').val(),
            role: $('#role').val(),
            country: $('#country').val(),
            profilePicture: imageUrl || null,
            status: 'Active'
        };

        $.ajax({
            url: "http://localhost:8080/api/v1/user/register",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(payload),
            success: function(res) {
                showNotification('User added successfully', 'success');
                fetchUsers();
                closeModal('addUserModal');
            },
            error: function(err) {
                console.error(err);
                showNotification('Failed to add user', 'error');
            }
        });
    } catch (err) {
        console.error(err);
        showNotification('Failed to upload profile picture', 'error');
    }
});

// Edit user
function editUser(usernameParam) {
    openEditUserModal();
    username = usernameParam; // store globally
    const user = users.find(u => u.username.toLowerCase() === usernameParam.toLowerCase());

    if (!user) return;

    $("#editUsername").val(user.username).prop('readonly', true); // keep username read-only
    $("#editEmail").val(user.email);
    $("#editCountry").val(user.country);
    $("#editRole").val(user.role);
    $("#editStatus").val(user.status);
    if (user.profilePicture) {
        $("#editProfilePicturePreview").attr("src", user.profilePicture).removeClass("hidden");
    } else {
        $("#editProfilePicturePreview").addClass("hidden");
    }
}

$('#editUserForm').submit(async function(e) {
    e.preventDefault();
    const file = this.editProfilePictureFile.files[0];

    const payload = {
        username: $('#editUsername').val(), // Hibernate will use this in WHERE
        email: $('#editEmail').val(),
        role: $('#editRole').val(),
        country: $('#editCountry').val(),
        status: $('#editStatus').val()
    };

    try {
        if (file) {
            const imageUrl = await uploadToCloudinary(file);
            payload.profilePicture = imageUrl;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/user/update",
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(payload),
            success: function(res) {
                showNotification('User updated successfully', 'success');
                fetchUsers(); // refresh table
                closeModal('editUserModal');
            },
            error: function(err) {
                console.error(err);
                showNotification('Failed to update user', 'error');
            }
        });
    } catch (err) {
        console.error(err);
        showNotification('Failed to upload profile picture', 'error');
    }
});

// show profile picture
$('#profilePictureFile').on('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            $('#profilePicturePreview').attr('src', e.target.result).removeClass('hidden');
        };
        reader.readAsDataURL(file);
    }
});

// show profile picture in edit
$('#editProfilePictureFile').on('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            $('#editProfilePicturePreview').attr('src', e.target.result).removeClass('hidden');
        };
        reader.readAsDataURL(file);
    }
});

// Search
$('#searchInput').on('input', function() {
    const search = $(this).val().toLowerCase();
    $('#usersTableBody tr').each(function() {
        $(this).toggle($(this).text().toLowerCase().includes(search));
    });
});

// Check if username or email already exists
$("#username").on("input", function() {
    const username = $(this).val().trim().toLowerCase();
    const exists = users.some(user => user.username.toLowerCase() === username);
    if (exists) {
        $("#usernameError").text("Username already exists");
    } else {
        $("#usernameError").text("");
    }
});

$("#email").on("input", function() {
    const email = $(this).val().trim().toLowerCase();
    const exists = users.some(user => user.email.toLowerCase() === email);
    if (exists) {
        $("#emailError").text("Email already exists");
    } else {
        $("#emailError").text("");
    }
});

// Initialize
$(document).ready(function() {
    fetchUsers();
});
*/
let username = null;
let users = [];
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dihnh3it0/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "MKYDGaming";

// -------------------- Modal Functions --------------------
function openAddModal() {
    document.getElementById('addUserModal').classList.add('active');
    clearForm('addUserForm');
}

function openEditUserModal() {
    document.getElementById('editUserModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    username = null;
}

function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
    const preview = form.querySelector('.image-preview');
    if (preview) preview.classList.add('hidden');
    $("#usernameError").text("");
    $("#emailError").text("");
}

// Capitalize string
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Upload to Cloudinary
function uploadToCloudinary(file) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        $.ajax({
            url: CLOUDINARY_URL,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function(res) {
                resolve(res.secure_url);
            },
            error: function(err) {
                console.error("Cloudinary upload error:", err);
                reject(err);
            }
        });
    });
}

// -------------------- Table Row --------------------
function createTableRow(user) {
    const statusLower = user.status.toLowerCase();
    const roleLower = user.role.toLowerCase();

    const banUnbanButton = (statusLower === 'deactivated') ?
        `<button class="btn-primary ban-unban-btn" data-email="${user.email}" data-status="${statusLower}">
            <i class="fas fa-unlock"></i> Unban
        </button>` :
        `<button class="btn-warning ban-unban-btn" data-email="${user.email}" data-status="${statusLower}">
            <i class="fas fa-ban"></i> Ban
        </button>`;

    const editDisabled = statusLower === 'deactivated' ? 'disabled' : '';

    return `<tr data-user-email="${user.email}" class="${statusLower === 'deactivated' ? 'opacity-70' : ''}">
        <td><img src="${user.profilePicture || 'https://via.placeholder.com/50'}" alt="Profile" class="user-profile-picture"></td>
        <td><strong>${user.username}</strong></td>
        <td>${user.email}</td>
        <td><span class="user-role role-${roleLower}">${user.role}</span></td>
        <td><i class="fas fa-map-marker-alt text-gray-400 mr-2"></i>${user.country}</td>
        <td><span class="status-badge status-${statusLower}">${capitalize(statusLower)}</span></td>
        <td>
            <div class="action-buttons">
                <button class="btn-secondary" onclick="editUser('${user.username}')" ${editDisabled}><i class="fas fa-edit"></i> Edit</button>
                ${banUnbanButton}
            </div>
        </td>
    </tr>`;
}

// -------------------- Ban/Unban --------------------
$(document).on('click', '.ban-unban-btn', function () {
    const email = $(this).data('email');
    const status = $(this).data('status');
    if (status === 'active') banUser(email, this);
    else unbanUser(email, this);
});

function banUser(email, button) {
    if (!confirm('Are you sure you want to ban this user?')) return;
    $.ajax({
        url: `http://localhost:8080/api/v1/user/ban?email=${email}`,
        type: 'PUT',
        success: function() {
            showNotification('User banned successfully', 'success');
            updateRowStatus(button, 'deactivated');
            fetchUsers();
        },
        error: function(err) {
            console.error(err);
            showNotification('Error banning user', 'error');
        }
    });
}

function unbanUser(email, button) {
    if (!confirm('Are you sure you want to unban this user?')) return;
    $.ajax({
        url: `http://localhost:8080/api/v1/user/unban?email=${email}`,
        type: 'PUT',
        success: function() {
            showNotification('User unbanned successfully', 'success');
            updateRowStatus(button, 'active');
            fetchUsers();
        },
        error: function(err) {
            console.error(err);
            showNotification('Error unbanning user', 'error');
        }
    });
}

function updateRowStatus(button, status) {
    const row = $(button).closest('tr');
    const badge = row.find('.status-badge');

    if (status === 'deactivated') {
        $(button).removeClass('btn-warning').addClass('btn-primary').html('<i class="fas fa-unlock"></i> Unban').data('status', 'deactivated');
        row.addClass('opacity-70');
        badge.removeClass('status-active').addClass('status-deactivated').text('Deactivated');
    } else {
        $(button).removeClass('btn-primary').addClass('btn-warning').html('<i class="fas fa-ban"></i> Ban').data('status', 'active');
        row.removeClass('opacity-70');
        badge.removeClass('status-deactivated').addClass('status-active').text('Active');
    }
}

// -------------------- Notifications --------------------
function showNotification(message, type) {
    toastr[type](message);
}

// -------------------- Fetch Users --------------------
function fetchUsers() {
    $.ajax({
        url: "http://localhost:8080/api/v1/user/get-all-admins-and-users",
        type: "GET",
        success: function(res) {
            const tbody = $("#usersTableBody");
            tbody.empty();
            users = res.data || res;

            if (Array.isArray(users) && users.length > 0) {
                users.forEach(user => tbody.append(createTableRow(user)));
            } else {
                tbody.append(`<tr><td colspan="7" class="text-center">No users found</td></tr>`);
            }
        },
        error: function(err) {
            console.error("Error fetching users:", err);
            showNotification('Failed to fetch users', 'error');
        }
    });
}

// -------------------- Add User --------------------
$('#addUserForm').submit(async function(e) {
    e.preventDefault();

    const usernameInput = $('#username').val().trim().toLowerCase();
    const emailInput = $('#email').val().trim().toLowerCase();

    if (users.some(user => user.username.toLowerCase() === usernameInput)) {
        $("#usernameError").text("Username already exists");
        return;
    } else {
        $("#usernameError").text("");
    }

    if (users.some(user => user.email.toLowerCase() === emailInput)) {
        $("#emailError").text("Email already exists");
        return;
    } else {
        $("#emailError").text("");
    }

    const file = this.profilePictureFile.files[0];
    try {
        const imageUrl = await uploadToCloudinary(file);
        const payload = {
            username: $('#username').val(),
            email: $('#email').val(),
            password: $('#password').val(),
            role: $('#role').val(),
            country: $('#country').val(),
            profilePicture: imageUrl || null,
            status: 'Active'
        };

        $.ajax({
            url: "http://localhost:8080/api/v1/user/register",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(payload),
            success: function() {
                showNotification('User added successfully', 'success');
                fetchUsers();
                closeModal('addUserModal');
            },
            error: function(err) {
                console.error(err);
                showNotification('Failed to add user', 'error');
            }
        });
    } catch (err) {
        console.error(err);
        showNotification('Failed to upload profile picture', 'error');
    }
});

// -------------------- Edit User --------------------
function editUser(usernameParam) {
    openEditUserModal();
    username = usernameParam;

    const user = users.find(u => u.username.toLowerCase() === usernameParam.toLowerCase());
    if (!user) return;

    $("#editUsername").val(user.username).prop('readonly', true);
    $("#editEmail").val(user.email);
    $("#editCountry").val(user.country);
    $("#editRole").val(user.role);
    $("#editStatus").val(user.status.toLowerCase());
    if (user.profilePicture) {
        $("#editProfilePicturePreview").attr("src", user.profilePicture).removeClass("hidden");
    } else {
        $("#editProfilePicturePreview").addClass("hidden");
    }
}

$('#editUserForm').submit(async function(e) {
    e.preventDefault();
    const file = this.editProfilePictureFile.files[0];

    const payload = {
        username: $('#editUsername').val(),
        email: $('#editEmail').val(),
        role: $('#editRole').val(),
        country: $('#editCountry').val(),
        status: $('#editStatus').val()
    };

    try {
        if (file) {
            const imageUrl = await uploadToCloudinary(file);
            payload.profilePicture = imageUrl;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/user/update",
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(payload),
            success: function() {
                showNotification('User updated successfully', 'success');
                fetchUsers();
                closeModal('editUserModal');
            },
            error: function(err) {
                console.error(err);
                showNotification('Failed to update user', 'error');
            }
        });
    } catch (err) {
        console.error(err);
        showNotification('Failed to upload profile picture', 'error');
    }
});

// -------------------- Profile Picture Previews --------------------
$('#profilePictureFile').on('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            $('#profilePicturePreview').attr('src', e.target.result).removeClass('hidden');
        };
        reader.readAsDataURL(file);
    }
});

$('#editProfilePictureFile').on('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            $('#editProfilePicturePreview').attr('src', e.target.result).removeClass('hidden');
        };
        reader.readAsDataURL(file);
    }
});

// -------------------- Search --------------------
$('#searchInput').on('input', function() {
    const search = $(this).val().toLowerCase();
    $('#usersTableBody tr').each(function() {
        $(this).toggle($(this).text().toLowerCase().includes(search));
    });
});

// -------------------- Validation --------------------
$("#username").on("input", function() {
    const usernameInput = $(this).val().trim().toLowerCase();
    const exists = users.some(user => user.username.toLowerCase() === usernameInput);
    $("#usernameError").text(exists ? "Username already exists" : "");
});

$("#email").on("input", function() {
    const emailInput = $(this).val().trim().toLowerCase();
    const exists = users.some(user => user.email.toLowerCase() === emailInput);
    $("#emailError").text(exists ? "Email already exists" : "");
});

// -------------------- Initialize --------------------
$(document).ready(function() {
    fetchUsers();
});
