//In input password incorrect, all recived data should be {}
//Initial data to be input
const accessId = "yolo123"; //Input the access code

//automation variables
let accessCode = { pw: accessId };

function memList() {
  //function to get member list

  fetch(serverLocation + "/memberInfo", {
    method: "POST",
    body: JSON.stringify(accessCode),
    headers: new Headers({ "Content-Type": "application/json" }),
  })
    .then(function (response) {
      return response.text();
    })
    .then(function (e) {
      let k = JSON.parse(e);
      console.log("Member list: ");
      console.log(k);
    })
    .catch(function (err) {
      console.log("Server error. Please try again later.");
    });

  return;
}

function cartList() {
    //function to get cart list
  
    fetch(serverLocation + "/cartInfo", {
      method: "POST",
      body: JSON.stringify(accessCode),
      headers: new Headers({ "Content-Type": "application/json" }),
    })
      .then(function (response) {
        return response.text();
      })
      .then(function (e) {
        let k = JSON.parse(e);
        console.log("Cart list: ");
        console.log(k);
      })
      .catch(function (err) {
        console.log("Server error. Please try again later.");
      });
  
    return;
}

function setZero(cartId, stat) {
  //function to clear target cart with status

  let datablock = {
    pw: accessId,
    cartNo: cartId,
    status: stat,
  };

  fetch(serverLocation + "/setZero", {
    method: "POST",
    body: JSON.stringify(datablock),
    headers: new Headers({ "Content-Type": "application/json" }),
  })
    .then(function (response) {
      return response.text();
    })
    .then(function (e) {
      let k = JSON.parse(e);
      console.log(k);
    })
    .catch(function (err) {
      console.log("Server error. Please try again later.");
    });

  return;
}

function setCartStatus(cartId, stat) {
  //function to set target cart to status

  let datablock = {
      pw: accessId,
      cartNo: cartId,
      status: stat,
  };


  fetch(serverLocation + "/setCartStatus", {
    method: "POST",
    body: JSON.stringify(datablock),
    headers: new Headers({ "Content-Type": "application/json" }),
  })
    .then(function (response) {
      return response.text();
    })
    .then(function (e) {
      let k = JSON.parse(e);
      console.log(k);
    })
    .catch(function (err) {
      console.log("Server error. Please try again later.");
    });

  return;
}


function setTS(message) {
  //function to set thinkSpeak message

  let datablock = {
    pw: accessId,
    text: message,
  };

  fetch(serverLocation + "/writeThinkSpeakZeroCart", {
    method: "POST",
    body: JSON.stringify(datablock),
    headers: new Headers({ "Content-Type": "application/json" }),
  })
    .then(function (response) {
      return response.text();
    })
    .then(function (e) {
      let k = JSON.parse(e);
      console.log(k);
    })
    .catch(function (err) {
      console.log("Server error. Please try again later.");
    });

  return;
}