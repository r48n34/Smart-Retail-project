/*
All reserved by reemo 2021.
Mainly in three parts:
1. Communication with cart.html (Clients)
2. Communication with checkout.html (Business)
3. Communication with access.html (Business)

Write functions are mainly implemented on server side
Read functions are implemented on both side
Warning: All Firebase / Thinkspeak channel & data are eliminated due to privacy and security.
Apply your own DB config / channel before used.
*/

const express = require('express');
const firebase = require('firebase')
require("firebase/firestore");
require("firebase/database");

const app = express();
const https = require('https');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

// Class block for members info map
class UserInfo {
    constructor(name, phoneNumber, points) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.points = points;
    }
}

// Class block for cart info map
class CartInfo {
    constructor(cartid, status, memberId, memberName) {

        this.cartid = cartid;
        this.status = status;
        this.memberId = memberId;
        this.memberName = memberName;

        /*
          0 = available
          1 = occupied (internal reasons, not means by occupied under users. e.g. cart locked, broken, repairing)
         -1 = end (success check out) -> push data to user db transaction -> delete and release
         -2 = end (no respond for a period) -> delete and release
        */
    }
}

class ProductList { //offline list info, adapted for online product info

    constructor(id, name, price, quantity, brand, description, type, image) {

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

const accessId = "yolo123"; // pw for business side access 

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

//Default header to prevent localhost Origin fail
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // change the ip to target locahost
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    express.json();
    next();
});

app.get('/', function (req, res) { //debug function
    console.log("Got a GET request for the homepage");
    res.send("yoloooo");

});

//////////////////// Console function ///////////////////////

app.post('/memberInfo', jsonParser, function (req, res) { // send all members list

    if (req.body.pw == accessId) {
        console.log("Got a valid MemberInfo check request from " + req.hostname);
        res.send(JSON.stringify(Object.fromEntries(memberListDB)));
        return;
    }
    else {
        console.log("Got a invalid MemberInfo check request from " + req.hostname);
        res.send(JSON.stringify({}));
        return;
    }


});

app.post('/cartInfo', jsonParser, function (req, res) { // send all cart list on DB

    if (req.body.pw == accessId) {
        console.log("Got a valid cartInfo check request from " + req.hostname);
        res.send(JSON.stringify(Object.fromEntries(cartListDB)));
        return;
    }
    else {
        console.log("Got a invalid cartInfo check request from " + req.hostname);
        res.send(JSON.stringify({}));
        return;
    }

});

app.post('/setZero', jsonParser, function (req, res) { // clear cart list on DB

    if (req.body.pw == accessId) {
        console.log("Got a valid setZero request from " + req.hostname);

        let id = req.body.cartNo;
        let s = parseInt(req.body.status);

        setZeroHelper(id, s);

        res.send(JSON.stringify({ process: "done" }));
        return;
    }
    else {
        console.log("Got a invalid setZero request from " + req.hostname);
        res.send(JSON.stringify({}));
        return;
    }


});

function setZeroHelper(id, s) {

    let ProductList = { //default clean list
        empty: true,
    };

    let infoBlock = { //default clean blobk
        cartid: id.toString(),
        memberId: "",
        memberName: "",
        status: s,
    };

    dbdb.ref("/" + id.toString() + "/ProductList").set(ProductList);
    dbdb.ref("/" + id.toString() + "/infoBlock").set(infoBlock);

    dbfs.collection("cartList").doc(id.toString()).update({ status: s });
    writeValueThinkSpeak("");

}

app.post('/setCartStatus', jsonParser, function (req, res) { // set Cart with status 

    if (req.body.pw == accessId) {
        console.log("Got a valid setCartStatus request from " + req.hostname);

        let s = parseInt(req.body.status);

        let infoBlock = {
            status: s,
        };

        let id = req.body.cartNo;

        dbdb.ref("/" + id.toString() + "/infoBlock").update(infoBlock); //online db push
        dbfs.collection("cartList").doc(id.toString()).update(infoBlock);


        res.send(JSON.stringify({ process: "done" }));
        return;
    }
    else {
        console.log("Got a invalid setCartStatus request from " + req.hostname);
        res.send(JSON.stringify({}));
        return;
    }


});

app.post('/writeThinkSpeakZeroCart', jsonParser, function (req, res) { // write ThinkSpeak for Cart "000000"

    if (req.body.pw == accessId) {
        console.log("Got a valid writeThinkSpeakZeroCart request from " + req.hostname);

        let mes = req.body.text;
        writeValueThinkSpeak(mes);

        res.send(JSON.stringify({ process: "done" }));
        return;
    }
    else {
        console.log("Got a invalid writeThinkSpeakZeroCart request from " + req.hostname);
        res.send(JSON.stringify({}));
        return;
    }


});

//////////////////// End Console function //////////////////

//////////////////// Member function ///////////////////////


app.post('/memberRegister', jsonParser, function (req, res) { // Member register

    console.log("Got a Cart check request from " + req.hostname);
    console.log("Recived body :");
    console.log(req.body);

    console.log(req.body.regName); //member Name
    console.log(req.body.regPhone); //member phone no.

    let infoBlock = {
        name: req.body.regName,
        phoneNumber: req.body.regPhone,
        points: 0,
    };

    let phoneNo = req.body.regPhone;

    if (memberListDB.has(phoneNo)) { // register phone no. existed
        res.send("Dup");
        return;
    }

    dbfs.collection("memberList").doc(phoneNo.toString()).set(infoBlock);
    res.send("Done");


});


app.post('/memberRecordcheck', jsonParser, async (req, res) => { // for memebr to check shopping history

    console.log("Got a memberRecordcheck request from " + req.hostname);
    console.log("Recived body :");
    console.log(req.body);

    console.log(req.body.phoneNo);
    if (req.body.phoneNo == "99999999") { // "99999999" is for user without members login
        res.send("Not");
        console.log("bubu.");
        return;
    }

    let a = await getOnly(req.body.phoneNo); //get Ref
    let b = await getRecordHist(a); // get all data in ref

    if (b.length == 0) { // No rec on db
        res.send("No");
        return;
    }

    res.send(b);


});

function getOnly(id) { //get Ref
    return new Promise((resolve, reject) => {
        const citiesRef = dbfs.collection('shoppingHistory').doc(id).collection("history").get();
        resolve(citiesRef);
    });
}

function getRecordHist(value) { // get all data in ref
    return new Promise((resolve, reject) => {

        let obj = [];
        const snapshot = value;
        snapshot.forEach(doc => {
            obj.push(doc.data());
        });

        resolve(JSON.stringify(obj));
    });

}

//////////////////// End Member function ///////////////////////

//////////////////// Clients function ///////////////////////
let switchDB = true; // true = on the online DB function, false = off

let memberListDB = new Map(); // local file to store members data, prevent data transfer fee
let cartListDB = new Map(); // local file to store cart data
let cartProductList = new Map(); // key = cartID, value = array of product in cart

const apple = new ProductList("8XNPN", "Apple", 5, 1, "Fuji", "japan apple, plan at fuji", "fruit", "www.fsdfsd.com/apple.jpg");
const orange = new ProductList("4gJeL", "0range", 5, 1, "Fuji", "USA orange, plan at Tax", "fruit", "www.fsdfsd.com/orange.jpg");
const juice = new ProductList("Pzi3p", "juice", 8.5, 1, "Mountain", "Mountain water juice", "drinks", "www.fsdfsd.com/tea.jpg");


if (switchDB) { // def memberListDB as online DB or offline push set

    //  FireStore collection memberList //
    const docnew = dbfs.collection('memberList');

    docnew.onSnapshot(docSnapshot => {
        memberListDB = new Map();

        docSnapshot.forEach(function (que) {

            let k = que.data();

            if (!memberListDB.has(k.phoneNumber)) { //unique member
                memberListDB.set(k.phoneNumber, new UserInfo(k.name, k.phoneNumber, k.points));
                console.log("New members has been added to server");
            }
            else {
                let temp = memberListDB.get(k.phoneNumber);

                if (temp.name != k.name) {
                    console.log("members" + temp.name + " name updated to" + k.name + " !");
                    temp.name = k.name;
                }

                if (temp.points != k.points) {
                    console.log("members" + temp.name + " points updated to" + k.points + " !");
                    temp.points = k.points;
                }

            }


        });

        console.log(memberListDB);

    },
        err => {
            console.log(`Encountered error: ${err}`);
        });

    ///////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////
    //  FireStore collection CartList product //
    const docnewCart = dbfs.collection('cartList');

    docnewCart.onSnapshot(docSnapshot => {
        cartListDB = new Map();
        cartProductList = new Map();

        docSnapshot.forEach(function (que) {

            let k = que.data();
            if (!cartProductList.has(k.cartId)) {
                cartProductList.set(k.cartId, []);
                cartListDB.set(k.cartId, new CartInfo(k.cartId, k.status, "", ""));
            }

        });

        console.log(cartProductList);
        console.log(cartListDB);

    },
        err => {
            console.log(`Encountered error: ${err}`);
        });

    ///////////////////////////////////////////////////////

}
else {
    //  FireStore collection memberList (offline)  // ok
    memberListDB.set("11111111", new UserInfo("Jason Chan", "11111111", 30));
    memberListDB.set("22222222", new UserInfo("May wong", "22222222", 20));
    memberListDB.set("33333333", new UserInfo("John wick", "33333333", 10));
    ///////////////////////////////////////////////////////
    //  FireStore collection Cart (offline)  //
    cartListDB.set("000000", new CartInfo("000000", 0, "", ""));
    cartListDB.set("111111", new CartInfo("111111", 1, "", ""));
    cartListDB.set("222222", new CartInfo("222222", 1, "", ""));
    ///////////////////////////////////////////////////////
    //  FireStore collection Cart product (offline)  //
    cartProductList.set("000000", []);
    cartProductList.set("111111", []);
    cartProductList.set("222222", []);

}

app.post('/validMember', jsonParser, function (req, res) { // request is a member exist, then return member data

    console.log("Got a validMember request from " + req.hostname);
    console.log("Recived body :");
    console.log(req.body);

    if (memberListDB.has(req.body.phoneNumber)) {

        let k = JSON.stringify(memberListDB.get(req.body.phoneNumber));
        res.send(k);
        console.log("Match success.");
        console.log("");
        return;
    }
    else {
        console.log("Match failed.");
        console.log("");
        res.send("0");
        return;
    }


});

app.post('/updateBlock', jsonParser, function (req, res) { // update block to realtime DB, which data get from clients

    console.log("Got a updateBlock request from " + req.hostname);
    console.log("Recived body :");
    console.log(req.body);

    let ref = req.body.cartid; //location id

    let infoBlock = { //structure of infoBlock
        cartid: req.body.cartid,
        memberId: req.body.memberId,
        memberName: req.body.memberName,
        status: req.body.status,
    };

    console.log(infoBlock);

    dbdb.ref("/" + ref.toString() + "/infoBlock").update(infoBlock); //online db push
    cartListDB.set(ref.toString(), new CartInfo(ref.toString(), 0, req.body.memberId, req.body.memberName)); //set local data

    res.send("Update done.");


});

app.post('/validCart', jsonParser, function (req, res) { // request is a cart exist, then return related value

    console.log("Got a Cart check request from " + req.hostname);
    console.log("Recived body :");
    console.log(req.body);

    if (cartListDB.has(req.body.uid)) {

        let temp = cartListDB.get(req.body.uid);

        if (temp.status != 0) { // Not aviable
            console.log("Match success, not available cart");
            console.log("");
            res.send("-1");
            return;

        }

        console.log("Match success and Available");
        console.log("");
        let k = JSON.stringify(temp);
        res.send(k);

        return;
    }
    else {
        console.log("Match failed, not exist.");
        console.log("");
        res.send("0");
        return;
    }


});

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
});

//////////////////// End Clients function ///////////////////////

//get data from thinkspeak with https req
//var rq = "";
const url = "https://api.thingspeak.com";
let channelId = ""; ///channels/your_chennel_id

let fieldNum = 2;
let field = "/fields/" + fieldNum.toString(); //auto

let result = 3;
let resultNum = "results=" + result.toString(); //auto

let key = "api_key=xxxxxxxxxxx" // api_key = your_write_api_key
let resq = channelId + field + ".json?" + resultNum + "&" + key;

function getValueThinkSpeak() { //Get data from thinkSpeak
    //one channel for one cart, so this function is a "000000" works only place.

    https.get(url + resq, (resp) => {
        let data = '';

        // received.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            let k = JSON.parse(data);

            let res = k.feeds[result - 1].field2; // remember to change field2 to fieldn if using field n, n = number
            console.log(res);

            if (res === undefined || res === null) {
                console.log("Undefined or null object on getValueThinkSpeak(), return now");
                return;
            }

            let obj = "";

            if (res != "") {
                obj = res.split(",");
            }
            console.log(obj);

            // New array info, update db
            if (JSON.stringify(cartProductList.get("000000")) != JSON.stringify(obj)) {
                console.log("Oh Noooooooooooooooo!");

                cartProductList.set("000000", obj);
                console.log(cartProductList.get("000000"));

                getAll(obj); //push to Realtime DB


            }
            else {
                console.log("No update.");
            }


        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}

//getValueThinkSpeak(); // get one
setInterval(getValueThinkSpeak, 5000); // get every 5 seconds form thinkSpeak

function writeValueThinkSpeak(value) { //write data to thinkSpeak
    //one channel for one cart, so this function is a "000000" works only place.
    let valueString = value.toString();
    // "4gJeL,3,Ti3h1,2,Z73Bs,1"

    https.get("https://api.thingspeak.com/update.json?api_key=your_write_key&field2=" + valueString, (resp) => {
        let data = '';

        // received.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            let k = JSON.parse(data);
            console.log(k);
            console.log("ok");

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}

//writeValueThinkSpeak("4gJeL,3,Ti3h1,2,Z73Bs,1");

// get data from ThinkSpeak with string split, then get data from FireStore and change that quantity.
// After all, push to Realtime DB. 
async function getAll(obj) {

    if (obj == "") { //update array, while the value is "", represent a blank array

        let ProductList = {
            empty: true,
        };

        console.log(ProductList);
        dbdb.ref("/" + "000000" + "/ProductList").set(ProductList); //hand input "000000"
        return;

    }

    let ProductList = { //update array, having product on cart
        empty: false,
    };

    for (let i = 0; i < obj.length; i += 2) {

        let long = await getItemFireStore(obj[i]);
        long.quantity = parseInt(obj[i + 1], 10);
        ProductList[long.id] = long;

    }

    console.log(ProductList);
    dbdb.ref("/" + "000000" + "/ProductList").set(ProductList); //hand input "000000"

}

function getItemFireStore(id) { //getAll(obj) helper for get each doc on DB
    return new Promise((resolve, reject) => {
        console.log(id);
        dbfs.collection("ProductList").doc(id).get()
            .then(function (doc) { resolve(doc.data()) });
    });
}

//add current shopping record (Realtime DB) to Firestore DB
function updateShopsrecord(memberId, cartId) {

    dbdb.ref("/" + cartId.toString() + "/ProductList").once('value', e => { //get data from Realtime DB 

        let a = e.val();
        let pro = [];
        let total = 0;

        for (const [key, value] of Object.entries(a)) {
            if (key != "empty") {
                pro.push(value);
                total += value.price * value.quantity;
            }

            if (key == "empty" && value == true) {
                console.log("enpty cart!!");
                return;
            }
        }

        let now = Date();
        let jsonRecord = JSON.parse(JSON.stringify(pro));

        let record = {
            date: now,
            place: "Kwun Tong Dist",
            cashier: "003",
            product: jsonRecord,
            totalPrice: total,
        };

        console.log(record);
        console.log(now);

        let timeText = now.split(" ");
        let messTime = timeText[1] + "-" + timeText[2] + "-" + timeText[3] + "-" + timeText[4];

        //last doc remove = firebase alto gen a id number (push record to Firestore DB)
        dbfs.collection("shoppingHistory").doc(memberId.toString()).collection("history").doc(messTime).set(record);

        addPtmem(memberId.toString(), total);

        // let ProductListDef = { //default clean list
        //     empty: true,
        // };

        let infoBlockDef = { //default clean blobk
            cartid: cartId,
            memberId: "",
            memberName: "",
            status: -1,
        };

        //dbdb.ref("/" + cartId + "/ProductList").set(ProductListDef);
        dbdb.ref("/" + cartId + "/infoBlock").set(infoBlockDef);
        setTimeout(setZeroHelper, 8, "000000", 0);

    });


}

function addPtmem(id, addPt) { //get Ref

    dbfs.collection("memberList").doc(id)
        .get()
        .then(function (doc) {

            if (doc.exists) {
                let k = doc.data();

                let infoBlock = {
                    points: k.points + addPt,
                };

                dbfs.collection("memberList").doc(id.toString()).update(infoBlock);

            }
            else {
                console.log("No such document!");
            }

        }).catch(function (error) {
            console.log("Error getting document:", error);
        });

}

app.post('/paymentRecord', jsonParser, function (req, res) { // request is a cart exist, then return related value

    console.log("Got a Cart check request from " + req.hostname);
    console.log("Recived body :");
    console.log(req.body);

    console.log(req.body.cartId); //cart id
    console.log(req.body.uid); //member id

    if (req.body.uid != "") { //only member can keep record in current time.
        updateShopsrecord(req.body.uid, req.body.cartId);
    }
    else {
        let k = "99999999"; // tele.no for ppl haven registered
        updateShopsrecord(k, req.body.cartId);
    }

    res.send("Done");

});

app.post('/test', jsonParser, function (req, res) {

    console.log("Got a Member check request from " + req.hostname);
    console.log("Recived body :");
    console.log(req.body);

    res.send("Hi");

});