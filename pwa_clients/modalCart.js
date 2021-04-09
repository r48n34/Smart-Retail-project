// Modal object of Cart //
const modalCart = document.getElementById('modalCart');
const enterValue = document.getElementById("enterValue"); //button to check enter 6 digit
const inputDigit = document.getElementById("inputDigit"); // value box for 6 digit
const errorMessageBox = document.getElementById("errorMessageBox"); // text message of error

//Modal object from QR
const modelQRcode = document.getElementById("modelQRcode"); 

// display the cart modal
function openModalCart() {
  document.getElementById("backdropCart").style.display = "block"
  modalCart.style.display = "block"
  modalCart.className += "show"
}

// close the display of cart modal
function closeModalCart() {
  document.getElementById("backdropCart").style.display = "none"
  modalCart.style.display = "none"
  modalCart.className += modalCart.className.replace("show", "")
}

enterValue.onclick = function(){
  checkDigit();
}

window.onload = function(){ //remember to enable this when not testing
  openModalCart();
}
 
function checkDigit(){ //current matcher = 000000, no db now
  //let value = parseInt(inputDigit.value, 10);
  //let newValue = value + "";

  if(inputDigit.value.length < 6 ){
    errorMessageBox.innerHTML = "Invalid input."
    return;
  }

  var data = {uid: inputDigit.value}; //request body

  fetch(serverLocation + '/validCart',
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
        errorMessageBox.innerHTML = "DB can't find the cart. <br> Please try again."
        return;
      }

      if(e == "-1"){ // recive = "0" => not found
        console.log(e);
        errorMessageBox.innerHTML = "Cart not available now."
        return;
      }

      loginCart = true;
      console.log(inputDigit.value);
      console.log("cart id confirm success.");
      loginCartDom.innerHTML = "Cart login: Yes (" + inputDigit.value + ")";
      infoBlock.cartid = inputDigit.value;
      modelQRcode.innerHTML = inputDigit.value;
      
      addDropOnline();  // adddrop.js enable product
      closeModalCart(); // close window
      openModalMember(); // modalMemebr.js open window for members

       
  })
  .catch(function(err) {
    errorMessageBox.innerHTML = "Server error. Please try again."
  });


}