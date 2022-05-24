const product = ["apple", "orange" , "chocolate", "pen", "cola",
                 "milk", "juice", "banana", "avocado" ,"Kiwifruit",
                 "lemon", "mango", "pineapple", "battery", "fish",
                 "meat", "pork", "pepsi","tv","potato",
                 "egg","kinfe", "mouse", "fork", "snake",
                 "coffee", "rice", "beer", "paper","toilet_paper",
                 "noodles", "tea", "book", "sake", "gun",
                 "dog", "cat"];
const lable = ["fruit", "fruit", "candy","stationery", "soft_drink",
               "drinks","drinks","fruit","fruit","fruit",
               "fruit","fruit","fruit","tools","sea_food",
               "food","food","soft_drink","electronics","food",
               "food","tools","tools","tools","food",
               "drinks", "food", "drinks","tools","tools",
               "food","drink","tools","food","tools",
               "pet","pet"];


class ProductObj {

    constructor(id, name, price, description, brand, image, type) {
      this.id = id;
      this.name = name;
      this.price = price;
      this.description = description;
      this.brand = brand;
      this.image = image;
      this.type = type;
    }

}

function genId(length) { //generate id 
    let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; //62 total
    let charactersLength = characters.length;

    let result = '';
    
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function rndInt(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

function result(len) { // len = length of list

    let rngList = [];

    for(let i = 1; i < len + 1; i++){

        //possibility of uid -> genId(5) = 916132832 = ~ 9.1*10^8 
        rngList.push( new ProductObj(genId(5), product[i], rndInt(1, 600), genId(15), genId(5), "https://github.com/r48n34/r48n34.github.io/blob/master/img/code-1.png", lable[i]) );
    }

    return rngList;
}

console.log(result(10)); // normal class object


/*
// download function

function download(filename, type, data) { //download txt file function
    var element = document.createElement('a');

    if(type === "txt"){
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    }
    else if(type === "json"){
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)));
    }
    
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}
*/

//download("hello", "json", result(10));