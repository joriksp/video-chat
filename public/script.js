const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

const toggleSection = (leftSection, rightSection, backButton) => {
  leftSection.style.display = leftSection.style.display === "none" ? "flex" : "none";
  rightSection.style.display = rightSection.style.display === "none" ? "flex" : "none";
  backButton.style.display = backButton.style.display === "none" ? "block" : "none";
};

document.querySelector("#showChat").addEventListener("click", () => {
  toggleSection(
    document.querySelector(".main__left"),
    document.querySelector(".main__right"),
    document.querySelector(".header__back")
  );
});

document.querySelector(".header__back").addEventListener("click", () => {
  toggleSection(
    document.querySelector(".main__right"),
    document.querySelector(".main__left"),
    document.querySelector(".header__back")
  );
});

const user = prompt("Enter your name");

const peer = new Peer({
  host: '127.0.0.1',
  port: 3030,
  path: '/peerjs',
  config: {
    'iceServers': [
      { url: 'stun:stun01.sipphone.com' },
      { url: 'stun:stun.ekiga.net' },
      { url: 'stun:stunserver.org' },
      { url: 'stun:stun.softjoys.com' },
      { url: 'stun:stun.voiparound.com' },
      { url: 'stun:stun.voipbuster.com' },
      { url: 'stun:stun.voipstunt.com' },
      { url: 'stun:stun.voxgratia.org' },
      { url: 'stun:stun.xten.com' },
      {
        url: 'turn:192.158.29.39:3478?transport=udp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      },
      {
        url: 'turn:192.158.29.39:3478?transport=tcp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      }
    ]
  },
  debug: 3
});

let myVideoStream;

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
  });
};

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", userVideoStream => addVideoStream(video, userVideoStream));
};

navigator.mediaDevices.getUserMedia({ audio: true, video: true })
  .then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", call => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", userVideoStream => addVideoStream(video, userVideoStream));
    });

    socket.on("user-connected", userId => connectToNewUser(userId, stream));
  });

peer.on("open", id => {
  socket.emit("join-room", ROOM_ID, id, user);
});

document.getElementById("send").addEventListener("click", () => {
  const text = document.querySelector("#chat_message");
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

document.querySelector("#chat_message").addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.value.length !== 0) {
    socket.emit("message", e.target.value);
    e.target.value = "";
  }
});

socket.on("createMessage", (message, userName) => {
  const messages = document.querySelector(".messages");
  messages.innerHTML += `
    <div class="message">
      <b><i class="far fa-user-circle"></i> <span>${userName === user ? "me" : userName}</span></b>
      <span>${message}</span>
    </div>`;
});

const toggleMediaButton = (button, stream, type) => {
  const track = stream[`get${type}Tracks`]()[0];
  track.enabled = !track.enabled;
  button.innerHTML = track.enabled ? `<i class="fas fa-${type.toLowerCase()}"></i>` : `<i class="fas fa-${type.toLowerCase()}-slash"></i>`;
  button.classList.toggle("background__red");
};

document.querySelector("#muteButton").addEventListener("click", () => toggleMediaButton(document.querySelector("#muteButton"), myVideoStream, "Audio"));
document.querySelector("#stopVideo").addEventListener("click", () => toggleMediaButton(document.querySelector("#stopVideo"), myVideoStream, "Video"));

document.querySelector("#inviteButton").addEventListener("click", () => {
  prompt("Copy this link and send it to people you want to meet with", window.location.href);
});
