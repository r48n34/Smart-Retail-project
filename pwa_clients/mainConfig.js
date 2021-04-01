//remember to open the server to run this scritp [server.js]
//script for Dom update

let infoBlock = {
    cartid: "",
    status: 0,
    memberId: "", // phone number
    memberName: "", //name
    //when user success typing id to this web, a info block will send to db.
    /* status
       0 = available
       1 = occupied (internal reasons, not means by occupied under users. e.g. cart locked, broken, repairing)
      -1 = end (success check out) -> push data to user db transaction -> delete and release
      -2 = end (no respond for a period) -> delete and release
     */
};

class ProductList{ //offline list info
        
    constructor(id, name, price, quantity, brand, description, type, image){
          
        this.id = id; // product id
        this.name = name; // product name
        this.price = price; // product price x1
        this.quantity = quantity; //product quantity, default set 1 when it's new to this list
          
        this.brand = brand; // product brand
        this.description = description; // product description
        this.type = type; // product type e.g candy, food, tools
        this.image = image; // product image from firebase ref link

    }


}

var firebaseConfig = { // your information can be seen from firebase 
    apiKey: "", 
    authDomain: "", 
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};
  
firebase.initializeApp(firebaseConfig);
firebase.analytics();

let dbdb = firebase.database();
var dbfs = firebase.firestore();

//var
let total = 0; //temp value
//total = Math.floor(Math.random() * (1000 - 50) ) + 50 ;
let loginCart = false; // is cart register?
let loginMember = false;// is member login?

//down nav message
const totalprice = document.getElementById("totalprice"); //text message of total price
const downMessage = document.getElementById("downMessage"); //text message of bottom left

const check = document.getElementById("check");// button in check out
const qrPol = document.getElementById("qrPol");// img qrcode dom

const loginCartDom = document.getElementById("loginCartDom");// nav message for login message cart
const loginMemberDom = document.getElementById("loginMemberDom");// nav message for login message member
 
//nav default message
loginCartDom.innerHTML = "Cart login: No";
loginMemberDom.innerHTML = "Member login: No";

//bottom default message
totalprice.innerHTML = "Total: $" + 0;
downMessage.innerHTML = "Welcome, user!"

function updateTotal(price){ //temp adjust message, not in use
    totalprice.innerHTML = "Total: $" + price;
}