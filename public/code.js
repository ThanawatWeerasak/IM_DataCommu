(function () {

  const app = document.querySelector(".app");
  const socket = io();

  let uname;

  app.querySelector(".join-screen #join-user").addEventListener("click", function () {
    let username = app.querySelector(".join-screen #username").value;
    if (username.length == 0) {
      return;
    }
    socket.emit("newuser", username);
    uname = username;
    app.querySelector(".join-screen").classList.remove("active");
    app.querySelector(".chatScreen").classList.add("active");
  });

  app.querySelector(".chatScreen #send-message").addEventListener("click", function () {
    let message = app.querySelector(".chatScreen #message-input").value;
    if (message.length == 0) {
      return;
    }

    renderMessage("my", {
      username: uname,
      text: message,
    });

    socket.emit("chat", {
      username: uname,
      text: message,
    });

    app.querySelector(".chatScreen #message-input").value = "";
  });

  app.querySelector(".chatScreen #exit-chat").addEventListener("click", function () {
    socket.emit("exituser", uname);
    window.location.href = window.location.href;
  });

  socket.on("update", function (update) {
    renderMessage("update", update);
  });

  socket.on("chat", function (message) {
    renderMessage("other", message);
  });

  function renderMessage(type, message) {
    let messageContainer = app.querySelector(".chatScreen .messages");
    if (type == "my") {
      let el = document.createElement("div");
      el.setAttribute("class", "message my-message");
      el.innerHTML = `
        <div>
          <div class="name">You</div>
          <div class="text">${message.text}</div>
        </div>
      `;
      messageContainer.appendChild(el);
    } else if (type == "other") {
      let el = document.createElement("div");
      el.setAttribute("class", "message other-message");
      el.innerHTML = `
        <div>
          <div class="name">${message.username}</div>
          <div class="text">${message.text}</div>
        </div>
      `;
      messageContainer.appendChild(el);
    } else if (type == "update") {
      let el = document.createElement("div");
      el.setAttribute("class", "update");
      el.innerText = message;
      messageContainer.appendChild(el);
    }

    messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
  }

  // img input /////////////////////////////////////
  app
    .querySelector(".chatScreen #image-upload")
    .addEventListener("click", () => {
      app.querySelector(".chatScreen #image-input").click();
    });

  app
    .querySelector(".chatScreen #image-input")
    .addEventListener("change", (e) => {
      let img = e.target.files[0];
      if (!img) return;

      const reader = new FileReader();
      reader.onload = function () {
        const base64 = this.result.replace(/.*base64,/, "");
        socket.emit("image", { username: uname, base64 });
        console.log("Image sent to server");

        renderImg("myimg", {
          username: uname,
          base64: base64,
        });
      };
      reader.readAsDataURL(img);
    });

  function renderImg(type, img) {
    let messageContainer = app.querySelector(".chatScreen .messages");
    let el = document.createElement("div");

    if (type === "myimg") {
      el.setAttribute("class", "message my-message");
      el.innerHTML = `
      <div>
        <div class="name">You</div>
        <div class="">
          <img src="data:image/png;base64,${img.base64}" class="chat-image">
        </div>
      </div>
    `;
    } else if (type === "otherimg") {
      el.setAttribute("class", "message other-message");
      el.innerHTML = `
      <div>
        <div class="name">${img.username}</div>
        <div class="">
          <img src="data:image/png;base64,${img.base64}" class="chat-image">
        </div>
      </div>
    `;
    }

    messageContainer.appendChild(el);
    messageContainer.scrollTop =
      messageContainer.scrollHeight - messageContainer.clientHeight;
  }
  socket.on("image", (data) => {
    renderImg("otherimg", {
      username: data.username,
      base64: data.base64,
    });
  });

  /////////////////////////////////////////////

})();
