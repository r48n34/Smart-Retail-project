//Modal object of Member
const modalMember = document.getElementById('modalMember');
const enterValueMember = document.getElementById("enterValueMember"); //button to check enter 6 digit
const inputDigitMember = document.getElementById("inputDigitMember"); // value box for 6 digit
const errorMessageBoxMember = document.getElementById("errorMessageBoxMember"); // text message of error

// display the member modal
function openModalMember() {
  document.getElementById("backdropMember").style.display = "block"
  modalMember.style.display = "block"
  modalMember.className += "show"
}

// close the display of member modal
function closeModalMember() {
  document.getElementById("backdropMember").style.display = "none"
  modalMember.style.display = "none"
  modalMember.className += modalMember.className.replace("show", "")
}

enterValueMember.onclick = function(){
  checkMember();
}

//open server.js (node.js) to run this function [npm start]
function checkMember(){
  
  if(inputDigitMember.value.length < 8 ){ //input number < 8
    errorMessageBoxMember.innerHTML = "Invalid input."
    return;
  } 

  errorMessageBoxMember.innerHTML = "loding..."

  var data = {phoneNumber: inputDigitMember.value}; //request body

  fetch(serverLocation + '/validMember',
  {method: 'POST',
  body: JSON.stringify(data),
  headers: new Headers({'Content-Type': 'application/json'})
  })
  .then(function(response) {
      return response.text();
  })
  .then(function(e) {

      if(e == "0"){ // recive = "0" => not found
        console.log(e);
        errorMessageBoxMember.innerHTML = "DB can't find the record. <br> Please try again."
        return;
      }

      let obj = JSON.parse(e);
      console.log(obj);          
      console.log("welcome!")

      loginMember = true;
      infoBlock.memberId = obj.phoneNumber;
      infoBlock.memberName = obj.name;

      downMessage.innerHTML = "Welcome, " + obj.name + "!"
      loginMemberDom.innerHTML = "Member login: Yes";
      errorMessageBoxMember.innerHTML = "";

      closeModalMember(); //close window
      uploadBlock(); // updateRDB.js for upload block to server
  })
  .catch(function(err) {
    errorMessageBoxMember.innerHTML = "Server error. Please try again."
  });
  
}