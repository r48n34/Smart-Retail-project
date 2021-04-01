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
let dbdb = firebase.database();
var dbfs = firebase.firestore();

let DefaultInfoBlock = {
    cartid: "", status: 0, memberId: "", memberName: "",
};

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

let productList = [];
let total = 0;

//blockOne content
const blockOne = document.getElementById("blockOne"); //div
const inputCode = document.getElementById("inputCode");
const inuptErrorMessage = document.getElementById("inuptErrorMessage");

//blockLoading content
const blockLoading = document.getElementById("blockLoading"); //div

//blockTwo content
const blockTwo = document.getElementById("blockTwo"); //div
const listt = document.getElementById("listt"); //div list
const totalMessage = document.getElementById("totalMessage"); //total dom
const welcomeMessage = document.getElementById("welcomeMessage"); // welcome jason
const goMainPage = document.getElementById("goMainPage"); //back button

const wrongMessage = () => {inuptErrorMessage.innerHTML = "Cart number not exist."};
const wrongMessageDeny = () => {inuptErrorMessage.innerHTML = "Cart not avaiable to check out."};

goMainPage.onclick = function (){ location.reload(); } // refresh pages for reset

//Input box function for process input value
inputCode.oninput = function (){

    inuptErrorMessage.innerHTML =  "";

    if(inputCode.value.length == 6){
        console.log(inputCode.value);

        //server check
        dbfs.collection("cartList").doc(inputCode.value).get()  
        .then(function(doc) {
            let k = doc.data();

            if(!doc.exists){
                wrongMessage();
                return;
            }

            if(k.status != 0){
                wrongMessageDeny();
                return;
            }

            enterStage();

        }).catch(function(error) {

            console.log("Error getting document:", error);

        });

    } 

}

function enterStage(){ // main => loading
    blockOne.style.display = "none";
    blockLoading.style.display = "block";
    dbToLocal();
}

function enterStageTwo(){ // loading => payment
    blockLoading.style.display = "none";
    blockTwo.style.display = "block";
}

function dbToLocal(){ //get record from realtimeDB to local

    let inputId = inputCode.value;

    dbdb.ref("/" + inputId.toString()).once('value',e => { //get data from Realtime DB 
      
        let data = e.val();
        let a = data.ProductList;
        let b = data.infoBlock;
        infoBlock = b;

        for (const [key, value] of Object.entries(a)){
            if(key != "empty"){
                productList.push(value);
                total += value.price * value.quantity;
            }
        }

        draw(); // dom draw
        enterStageTwo(); //load in second page
  
    });


}

function draw(){ // dom draw

    welcomeMessage.innerHTML = "Welcome " + infoBlock.memberName + "!";

    for(let i = 0; i < productList.length; i++){
    
        // name //
        let h1 = document.createElement("h1");
        let t1 = document.createTextNode(productList[i].name);
        h1.appendChild(t1);
        h1.classList.add("leftMess");
        listt.appendChild(h1);
    
        // q + price //
        h1 = document.createElement("h1");
        let pFinal = productList[i].price * productList[i].quantity;
        let message = "Quantity : " + productList[i].quantity + " Price: $" + pFinal; 
        t1 = document.createTextNode(message);
       
        h1.appendChild(t1);
        h1.classList.add("rightMess");
        listt.appendChild(h1);
    
        // line //
        let line = document.createElement("HR"); //line
        line.classList.add("lineClass");
        listt.appendChild(line); 
               
    
    }

    totalMessage.innerHTML = "Total = $" + total + "<br>" + "points = " + total * 10;
    

}