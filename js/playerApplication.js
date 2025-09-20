$(document).ready(function () {

    // ---- Set email from localStorage and disable input ----
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

    // ---- Submit Player Application ----
    $('#playerApplicationForm').on('submit', function (e) {
        e.preventDefault();

        const selectedGames = [];
        $('input[name="games"]:checked').each(function () {
            selectedGames.push($(this).val());
        });

        const playerDTO = {
            email: $('#email').val(),
            playerName: $('#playerName').val(),
            country: $('#country').val(),
            about: $('#about').val(),
            role: 'Player',
            status: 'Active',
            isOnline: true,
            games: selectedGames
        };

        $.ajax({
            url: 'http://localhost:8080/api/v1/player/addPlayer',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(playerDTO),
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            success: function (res) {
                if (res.code === 201 || res.code === 200) {
                    alert('Successfully applied!');

                    window.location.href = "player_profile.html";
                    resetForm();
                } else {
                    alert('Error: ' + res.message);
                }
            },
            error: function (xhr) {
                console.error(xhr.responseText);
                alert('Submission failed.');
            }
        });
    });

    // ---- Reset helper ----
    function resetForm() {
        $('#playerApplicationForm')[0].reset();
        $('#aboutCount').text('0');

        // reset email again from localStorage after form reset
        if (storedEmail) {
            $('#email').val(storedEmail);
            $('#email').prop('disabled', true);
        }
    }

});
