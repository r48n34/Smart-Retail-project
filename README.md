# Smart-Retail-project
<img src="https://github.com/r48n34/Smart-Retail-project/blob/main/imgg/loasdgo-2.png" />
An integrated system combined hardware and software aspects for a revolution which aims to
improve both consumer shopping quality and business data automation.  

## Features
* Member registion
* Real-time shopping feedback
* Fast check out
* Transaction history checking
* Console control
* PWA base

## Preview
<img src="https://github.com/r48n34/Smart-Retail-project/blob/main/imgg/reg.gif" />
<img src="https://github.com/r48n34/Smart-Retail-project/blob/main/imgg/cart.gif" />
<img src="https://github.com/r48n34/Smart-Retail-project/blob/main/imgg/his.gif" />   
https://youtu.be/G1z9DpStDk8   


## Declare use
### Clients:  
Bootstrap 4  
Font Awesome  
Firebase   
Animate On Scroll Library (AOS)  
VanillaQR.js for qrCode generate
### Server:  
Node.js  
Firebase  
ThinkSpeak

## Download
Using `gh repo clone r48n34/Smart-Retail-project`  

## install
Step 1. Create a `Firebase project`, replace all the section that require Firebase data.  
Step 1.1 Create a `Thinkspeak channel` for arduino data communication.  
Step 2. Install `Node.js` to your devices.   
Step 3. Active `server.js` by `npm start` or `node server.js`.  
Step 4. Replace your ip in `pwa_company/ipconfigg.js` and `pwa_clients/overallConfig.js` as the node server location.  
Setp 4.1 Replace your Thinkspeak channel id and write API in `server.js`.  
Step 5. Open `pwa_clients/index.html` for user.  

