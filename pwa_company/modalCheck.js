//Modal object of Member
const modalCheck = document.getElementById('modalCheck');
const errorMessageCheck = document.getElementById("errorMessageCheck"); // text message of error
const openPayment = document.getElementById("openPayment"); //payment button

const goPay0 = document.getElementById("goPay0"); //5 buttons for proceded pay
const goPay1 = document.getElementById("goPay1"); 
const goPay2 = document.getElementById("goPay2"); 
const goPay3 = document.getElementById("goPay3"); 
const goPay4 = document.getElementById("goPay4");

const buttonSection = document.getElementById("buttonSection");
const buttonLoading = document.getElementById("buttonLoading");

openPayment.onclick = function (){
  openModalCheck();
}

// display the member modal
function openModalCheck() {
  document.getElementById("backdropCheck").style.display = "block";
  modalCheck.style.display = "block";
  modalCheck.className += "show";
}

// close the display of member modal
function closeModalCheck() {
  document.getElementById("backdropCheck").style.display = "none";
  modalCheck.style.display = "none";
  modalCheck.className += modalCheck.className.replace("show", "");
}

//pay button clicked => push data to node.js server => server process record then done
function checkOut(){

  buttonSection.style.display = "none";
  buttonLoading.style.display = "block";

  var data = {
    cartId: inputCode.value,
    uid : infoBlock.memberId,
  }; //request body , inputCode.value fron checkout.js

  fetch(serverLocation + '/paymentRecord',
  {method: 'POST',
  body: JSON.stringify(data),
  headers: new Headers({'Content-Type': 'application/json'})
  })
  .then(function(response) {
      return response.text();
  })
  .then(function(e) {
    console.log(e);
    
    if(e == "Done"){
      window.location.href = "finish.html";
    }
       
  })
  .catch(function(err) {
    console.log("Server error. Please try again.");
    buttonSection.style.display = "block";
    buttonLoading.style.display = "none";
  });
  

}
