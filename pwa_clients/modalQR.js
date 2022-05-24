class MinInfoCheck {

    constructor(uid, pName, price, quantity) {
        this.uid = uid; // product id
        this.pName = pName; // product name
        this.price = price; // product price x1
        this.quantity = quantity; //product quantity

        this.pTotal = this.quantity * this.price;
    }

}

//Modal object of Member
const modalQR = document.getElementById('modalQR');
const errorMessageQR = document.getElementById("errorMessageBoxQR"); // text message of error
//const modelQRcode = document.getElementById("modelQRcode"); 

//qr code div
const qrDiv = document.getElementById("qrPol");

// display the member modal
function openModalQR() {
    qrDiv.innerHTML = "";
    document.getElementById("backdropQR").style.display = "block";
    modalQR.style.display = "block";
    modalQR.className += "show";
    qrCodePrint();
}

// close the display of member modal
function closeModalQR() {
    document.getElementById("backdropQR").style.display = "none";
    modalQR.style.display = "none";
    modalQR.className += modalMember.className.replace("show", "");
}

function qrCodePrint() {

    let final = [];

    arr.forEach(e => {
        final.push(new MinInfoCheck(e.uid, e.pName, e.price, e.quantity));
    });

    console.log(final);
    let k = JSON.stringify(final);

    var qr = new VanillaQR({

        url: k, // k = info top 
        size: 450,
        colorLight: "#ffffff",
        colorDark: "#000000",
        toTable: false, //output to table or canvas
        ecclevel: 1, //Ecc correction level 1-4
        noBorder: false, //Use a border or not
        borderSize: 4 //Border size to output at

    });

    qrDiv.appendChild(qr.domElement);

}
