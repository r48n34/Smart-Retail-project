/*
class ProductList{ //offline list info

this.id = id; // product id
this.name = name; // product name
this.price = price; // product price x1
this.quantity = quantity; //product quantity, default set 1 when it's new to this list
        
this.brand = brand; // product brand
this.description = description; // product description
this.type = type; // product type e.g candy, food, tools
this.image = image; // product image from firebase ref link

}
*/

//offline json for 10 products
let request = new XMLHttpRequest();
request.open('GET', 'hello.txt', false);
request.send();
let text = JSON.parse(request.responseText);
//console.log(text);

let arr = []; // array for all product add / drop

const cartList = document.getElementById("cartList"); //div in Current Shopping Cart
const ProductInfoList = document.getElementById("ProductInfoList"); //div in Product info

const points = document.getElementById("points"); //message in other_info

//Local db and object to test
const foot = new ProductList("aaaaa", "apple", 5, 1, "Fruit Mother .ltd", "japan apple, plan at fuji", "fruit", "www.fsdfsd.com/apple.jpg");
const hand = new ProductList("bbbbb", "orange", 12, 1, "Fruit Mother .ltd", "USA orange, plan at Tax", "fruit", "www.fsdfsd.com/orange.jpg");
const tea = new ProductList("ccccc", "Tea", 8.5, 1, "Wason", "Mountain water tea, juice", "fruit", "www.fsdfsd.com/tea.jpg");
arr.push(foot);
arr.push(hand);
arr.push(tea);

let switchAddDrop = true; // whther use online mode

function addDropOnline(){
  
  if(switchAddDrop){

    let cartId = infoBlock.cartid;

    dbdb.ref("/" + cartId + "/ProductList").on('value',e => {
          
      let a = e.val();
      console.log(a);
      console.log(Object.keys(a).length);
      arr = [];
  
      for (const [key, value] of Object.entries(a)) {
        console.log(key);
        console.log(value);
  
        if(key != "empty"){
          arr.push( new ProductList(value.id, value.name, value.price, value.quantity, value.brand, value.description, value.type, value.image) );
        }
  
  
      }
  
      drawDom();
    
    });

    dbdb.ref("/" + cartId + "/infoBlock").on('value',e => {
      
      let a = e.val();     
      if(a.status == -1){ // finish, redirected to done.html page.
        window.location.href = "done.html";
      }

    });



  }
  else{ //offline
    drawDom();
  }
}
  

function cl(){
  cartList.innerHTML = "";
}

function updateListSub(obj){ //sub obj to array then update dom
  let newObj = {...obj};
  
  for(let i = 0; i<arr.length; i++){ // found same
    
    if(arr[i].id == newObj.id){      
      arr[i].quantity -= 1;

      if(arr[i].quantity == 0){
        arr.splice(i, 1);           
      }

      drawDom();     
      return;
    }

  }

  //not found
  console.log("Not found.")

}

function updateListAdd(obj){ //add obj to array then update dom
  let newObj = {...obj};

  for(let i = 0; i<arr.length; i++){ // found same

    if(arr[i].id == newObj.id){      
      
      arr[i].quantity += 1;

      drawDom();     
      return;
    }

  }

  //unique item
  arr.push(newObj);
  drawDom(); 

}

function drawDom(){ 

  cartList.innerHTML = ""; //Shopping Cart div
  ProductInfoList.innerHTML = ""; //product info div
  total = 0;     

  for(let i = 0; i < arr.length; i++){

    //   Current Shopping Cart   //

    // name //
    let h1 = document.createElement("h1");
    let t1 = document.createTextNode(arr[i].name);
    h1.appendChild(t1);
    h1.classList.add("leftMess");
    cartList.appendChild(h1);

    // q + price //
    h1 = document.createElement("h1");
    let pFinal = arr[i].price * arr[i].quantity;
    let message = "Quantity : " + arr[i].quantity + " Price: $" + pFinal; 
    t1 = document.createTextNode(message);

    total += pFinal;

    h1.appendChild(t1);
    h1.classList.add("rightMess");
    cartList.appendChild(h1);

    let line = document.createElement("HR"); //line
    line.classList.add("lineClass");
    cartList.appendChild(line); 

    //   product info   //

    // name //
    h1 = document.createElement("h1");
    t1 = document.createTextNode(arr[i].name);
    h1.appendChild(t1);
    h1.classList.add("leftMess");
    ProductInfoList.appendChild(h1);

    // info brand //
    h1 = document.createElement("h1");
    let text2 = "brand: " + arr[i].brand; //"description: " + arr[i].description;
    t1 = document.createTextNode(text2);
    h1.appendChild(t1);
    h1.classList.add("leftMess");
    ProductInfoList.appendChild(h1);

    // info description //
    h1 = document.createElement("h1");
    text2 = "description: " + arr[i].description;
    t1 = document.createTextNode(text2);
    h1.appendChild(t1);
    h1.classList.add("leftMess");
    ProductInfoList.appendChild(h1);

    // <br> to each product //
    ProductInfoList.innerHTML += "<br>";

  }

  totalprice.innerHTML = "Total: $" + total; // bottom right cash total
  points.innerHTML = "Points earn : " + total * 10; 
  
}
