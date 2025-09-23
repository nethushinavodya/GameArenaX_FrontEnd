// clanChat.js
const token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
let clanID = urlParams.get("clanId");
let currentPlayer = localStorage.getItem("playerId");

let stompClient = null;

function connectChat() {
    let socket = new SockJS("http://localhost:8080/ws");
    stompClient = Stomp.over(socket);

    stompClient.connect(
        { Authorization: "Bearer " + token },
        function (frame) {
            console.log("Connected: " + frame);

            // Subscribe to clan messages
            stompClient.subscribe(`/topic/clan/${clanID}/messages`, function (msg) {
                let message = JSON.parse(msg.body);
                showMessage(message);
            });
        },
        function (error) {
            console.error("Connection error:", error);
        }
    );
}

function sendMessage() {
    console.log("clicked")
    const chatInput = document.getElementById("chat-input"); // <-- id eke input eka ganna

    if (!chatInput.value.trim()) return;

    let msg = {
        senderId: currentPlayer,
        clanId: clanID,
        senderName: "You",
        message: chatInput.value,
        sentAt: new Date()
    };

    console.log(msg);

    stompClient.send("/app/clan/chat", { Authorization: "Bearer " + token }, JSON.stringify(msg));
    //input.value = "";
}

function showMessage(msg) {
    const chatMessages = document.getElementById("chat-messages");

    let div = document.createElement("div");
    div.classList.add("flex", "items-start", "space-x-3");

    div.innerHTML = `
        <img src="https://i.pravatar.cc/32?u=${msg.senderId}" alt="${msg.senderName}"
             class="w-8 h-8 rounded-full flex-shrink-0" />
        <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2 mb-1">
                <span class="text-sm font-medium text-text-primary">${msg.senderName}</span>
                <span class="text-xs text-text-secondary">${new Date(msg.sentAt).toLocaleTimeString()}</span>
            </div>
            <p class="text-sm text-text-primary break-words">${msg.message}</p>
        </div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.addEventListener("DOMContentLoaded", () => {
    connectChat();
    //document.getElementById("send-message").addEventListener("click", sendMessage);

});
