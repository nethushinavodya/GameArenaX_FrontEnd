$(document).ready(function () {

    const storedEmail = localStorage.getItem('email'); // assuming you stored it earlier
    if (storedEmail) {
        $('#email').val(storedEmail);
        $('#email').prop('disabled', true); // disable the input
    }

    function loadActiveGames() {
        $.ajax({
            url: 'http://localhost:8080/api/v1/games/getByActive',
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                if (res.code === 201 || res.code === 200) {
                    console.log("Games Response Data:", res);
                    const games = res.data;
                    const $gamesDiv = $('#games').empty();

                    games.forEach(g => {
                        const item = `
                          <label class="flex items-center space-x-3 p-3 bg-surface-800 rounded-gaming border border-surface-700 hover:border-primary transition-colors cursor-pointer">
                              <input type="checkbox" name="games" value="${g.name}" class="text-primary focus:ring-primary focus:ring-offset-surface-800">
                              <span class="text-text-primary">${g.name}</span>
                          </label>`;
                        $gamesDiv.append(item);
                    });
                } else {
                    alert('Failed to load games: ' + res.message);
                }
            },
            error: function (xhr) {
                console.error(xhr.responseText);
                alert('Error loading games.');
            }
        });
    }

    loadActiveGames();

    $('#streamerApplicationForm').on('submit', function (e) {
        e.preventDefault();

        const selectedGames = [];
        $('input[name="games"]:checked').each(function () {
            selectedGames.push($(this).val());
        });

        const streamerDTO = {
            email: $('#email').val(),
            displayName: $('#displayName').val(),
            platform: $('#platform').val(),
            streamUrl: $('#streamUrl').val(),
            country: $('#country').val(),
            bio: $('#bio').val(),
            role: 'Streamer',
            isLive: false,
            isVerified: false,
            followerCount: 0,
            joinedAt: new Date().toISOString(),
            featuredGames: selectedGames
        };

        $.ajax({
            url: 'http://localhost:8080/api/v1/streamers/addStreamer',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(streamerDTO),
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            success: function (data) {
                if (data) {
                    console.log("Streamer Application Response Data:", data);
                    toastr.success('Streamer application submitted successfully!');
                    resetForm();
                    localStorage.setItem("role", "Streamer");
                    localStorage.setItem("token", data.data);

                    window.location.href = "index2.html";

                }else {
                    alert('Failed to submit streamer application: ' + data.message);
                }
            },
            error: function (xhr) {
                console.error('Failed to submit streamer application:', xhr.statusText);
            }
        });
    });
    function resetForm() {
        $('#streamerApplicationForm')[0].reset();
        if (storedEmail) {
            $('#email').val(storedEmail);
            $('#email').prop('disabled', true);
        }
    }
});