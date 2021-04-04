/*
  -----------------------------------------------------------------------------------------
              MFRC522      Arduino       Arduino   Arduino    Arduino          Arduino
              Reader/PCD   Uno/101       Mega      Nano v3    Leonardo/Micro   Pro Micro
  Signal      Pin          Pin           Pin       Pin        Pin              Pin
  -----------------------------------------------------------------------------------------
  RST/Reset   RST          9             5         D9         RESET/ICSP-5     RST
  SPI SS      SDA(SS)      10            53        D10        10               10
  SPI MOSI    MOSI         11 / ICSP-4   51        D11        ICSP-4           16
  SPI MISO    MISO         12 / ICSP-1   50        D12        ICSP-1           14
  SPI SCK     SCK          13 / ICSP-3   52        D13        ICSP-3           15

  Using Arduino Mega for following code
  Used sensor / IO devices
  1. SSD1306 OLED : SDA(20) SCL(21)
  2. MFRC522 RFID I/O : SDA(53) SCK(52) MOSI(51) MISO(50) IRQ(-) RST(5)
  3. Wifi module ESP8266: RX(TX) TX(RX) CH_PD(High)
  4. Potentiometer: (A5)
  5. RGB LED x 1: R(A0) G(A1) B(A2)

  Flow: Check Potentiometer -> Check RFID -> Check tag data -> Check online status -> upload(if online) -> display -> back to head.

*/

#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "ThingSpeak.h"
#include "WiFiEsp.h"
#include "SoftwareSerial.h"

#define RST_PIN         5          // Configurable, see typical pin layout above
#define SS_PIN          53         // Configurable, see typical pin layout above

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

#define OLED_RESET     -1 // Reset pin # (or -1 if sharing Arduino reset pin)
#define SCREEN_ADDRESS 0x3D ///< See datasheet for Address; 0x3D for 128x64, 0x3C for 128x32

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

const unsigned char logo [] PROGMEM = {
0x00, 0x0f, 0xf0, 0x00, 0x00, 0x0f, 0xf0, 0x00, 0x00, 0x0f, 0xb0, 0x00, 0x00, 0x08, 0x30, 0x00,
0x00, 0x08, 0x30, 0x00, 0x00, 0x08, 0x30, 0x00, 0x00, 0x08, 0x30, 0x00, 0x00, 0x08, 0x30, 0x00,
0x00, 0x08, 0x30, 0x00, 0x00, 0x0f, 0xf0, 0x00, 0x00, 0x0f, 0xf0, 0x00, 0x00, 0x0f, 0xf0, 0x00,
0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x80, 0x00, 0x00, 0x03, 0xc0, 0x00, 0x00, 0x07, 0xe0, 0x00,
0x00, 0x0f, 0xf0, 0x00, 0x00, 0x1f, 0xf8, 0x00, 0x00, 0x1b, 0xd8, 0x00, 0x00, 0x03, 0xc0, 0x00,
0x00, 0x1f, 0xf8, 0x00, 0x00, 0xff, 0xff, 0x00, 0x03, 0xfb, 0xff, 0xc0, 0x07, 0xe0, 0x07, 0xc0,
0x07, 0xc0, 0x03, 0xc0, 0x07, 0xf8, 0x1f, 0xc0, 0x07, 0xff, 0xff, 0xc0, 0x07, 0xff, 0xff, 0xc0,
0x03, 0xff, 0xff, 0x80, 0x00, 0x7f, 0xfe, 0x00, 0x00, 0x0f, 0xf0, 0x00, 0x00, 0x01, 0x80, 0x00,
};

MFRC522 mfrc522(SS_PIN, RST_PIN);  // Create MFRC522 instance
MFRC522::MIFARE_Key key;

const char ssid[] = "";  // your network SSID (name)
const char pass[] = "";   // your network password
int keyIndex = 0;            // your network key Index number (needed only for WEP)
WiFiEspClient client;

unsigned long myChannelNumber = 11111111; // your thinkSpeak ChannelNumber
const char * myWriteAPIKey = "your WriteAPIKe"; // your thinkSpeak WriteAPIKe

String myStatus = "";

const int red_light_pin = A0;
const int green_light_pin = A1;
const int blue_light_pin = A2;

bool isAdd = true;

struct ProductInfo
{
   String product; // product id
   int count; // product count
};

struct ProductInfo arr[120]; // array of ProductInfo
int pSize = 0; // length of the array -> point to head
double totalPay = 0.0; //total pay

// function to add product to arr
void addProduct(String id, double price){ 
  
  for (int i = 0; i < pSize; i++){  
    if(arr[i].product == id){ // Have same product, just add one to regarding index
      arr[i].count += 1;
      totalPay += price;
      return;         
    }
  }

  // not found, means a quique product, add to list
  arr[pSize].product = id;
  arr[pSize].count = 1;
  totalPay += price;
  pSize ++;

}
///////////////////////////////////

// function to sub product in arr
int subProduct(String id, double price){

  for (int i = 0; i < pSize; i++){  
    if(arr[i].product == id){ // Have same product
      arr[i].count --;

      totalPay -= price;
       
      if(arr[i].count == 0){ // count = 0, need to be remove  

        for(int k = i; k < pSize ; k++){
          arr[k].product = arr[k+1].product;
          arr[k].count = arr[k+1].count;
        } 

        pSize --;
        return 0;
                    
      }
       
      return 1;   
               
    }

  }

  return -1;
  
}

// function to debug -> print out all list object
void printProduct(){
    Serial.print("List size = ");
    Serial.print(pSize);
    Serial.println();
  
    for(int i = 0; i < pSize ; i++){
        Serial.print("Object :");
        Serial.print(i);
        Serial.print(" ");
        Serial.print(arr[i].product);
        Serial.print(" ");
        Serial.print(arr[i].count);
        Serial.println();
    }

}

///////////////////////////////////
//function to turn arr to single array
String arrToString(){
    String temp = "";
    for (int i = 0; i < pSize; i++){
        temp += arr[i].product;
        temp += ",";
        temp += arr[i].count;
        if(i+1 != pSize){
        temp += ",";
        }  
    
    }
    return temp;
    
}

///////////////////////////////////

///////////////////////////////////This is the background screen

void screen(){
    display.setTextSize(1);  
    display.setTextColor(WHITE);
    
    display.setCursor(5,4); 
    display.println("Name");
    display.display();
    
    display.setCursor(58,4); 
    display.println("Num");
    display.display();
        
    display.setCursor(95,4); 
    display.println("$");
    display.display();
        
    display.setCursor(5,40); 
    display.println("TOTAL: $"); 
    display.display();

    display.drawRect(0, 0, 128, 64, SSD1306_WHITE);
    display.display();
}

///////////////////////////////////This is the function to display item name and number

void screenName(String id, String pName, double price){
  
    display.clearDisplay();
    
    screen();

    int countNum = 1;

    for (int i = 0; i < pSize; i++){
        if(arr[i].product == id){
        countNum = arr[i].count;
            
        }
    }

    double total = countNum * price;

    display.setCursor(5,12); 
    display.println(pName);
    display.display();

    display.setCursor(64,12); 
    display.println(countNum);
    display.display();

    display.setCursor(95,12); 
    display.println(total);
    display.display();

    display.setCursor(58,40); 
    display.println(totalPay);
    display.display();
  
}

/////////////////////////////////// This is the welcome screen
void welcome(){

    display.clearDisplay(); 
    display.setTextSize(2);  
    display.setTextColor(WHITE);

    display.setCursor(4,4); 
    display.println("Welcome to");
    display.display();
        
    display.drawBitmap(52,20,logo,32,32,SSD1306_WHITE);
    display.display();

    display.setTextSize(1); 
    
    display.setCursor(4,54); 
    display.println("* Scan for payment *");
    display.display(); 
}

void loadingScreen(String text, int offset){
  
  display.clearDisplay(); 
    
  display.drawRect(0, 0, 128, 64, SSD1306_WHITE);
  display.display();
      
  display.setTextSize(1);  
  display.setTextColor(WHITE); 
  display.setCursor(52 + offset,50); 
  display.println(text);
  display.display();
   
}


bool wifiSwitch =  true;

void setup() {
  Serial.begin(115200);   // Initialize serial communications with the PC
    
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { // Address 0x3D for 128x64
  Serial.println(F("SSD1306 allocation failed"));
  for(;;); // Don't proceed, loop forever
  }

  display.display();
  delay(2000); // Pause for 2 seconds
  display.clearDisplay();

  loadingScreen("Initializing...",-8);


  while (!Serial);    // Do nothing if no serial port is opened (added for Arduinos based on ATMEGA32U4)
  SPI.begin();      // Init SPI bus
  mfrc522.PCD_Init();   // Init MFRC522
 
  for (byte i = 0; i < 6; i++) { //key
    key.keyByte[i] = 0xFF;
  }

  
  if(wifiSwitch){

    Serial2.begin(115200);   // Initialize serial communications with the PC  
    WiFi.init(&Serial2);
        // Connect or reconnect to WiFi
      if (WiFi.status() != WL_CONNECTED) {
        Serial.print("Attempting to connect to SSID: ");
        Serial.println(ssid);

        while (WiFi.status() != WL_CONNECTED) {
            WiFi.begin(ssid, pass); // Connect to WPA/WPA2 network
            Serial.print(".");
            delay(5000);
        }

        Serial.println("\nConnected");
        ThingSpeak.begin(client);
        uploadSpeak("");                 
        
      }
  
  }

  welcome();
   
  delay(6);       // Optional delay. Some board do need more time after init to be ready, see Readme
  mfrc522.PCD_DumpVersionToSerial();  // Show details of PCD - MFRC522 Card Reader details
  Serial.println(F("Scan PICC to see UID, SAK, type, and data blocks..."));
}

void loop() {

    int sensorValue = analogRead(A5);
    if(sensorValue >= 350){
      isAdd = false;
      RGB_color(255, 0, 0);
    }
    else{
      isAdd = true;
      RGB_color(0, 255, 0);
    }
 
      
    // Reset the loop if no new card present on the sensor/reader. This saves the entire process when idle.
    if ( ! mfrc522.PICC_IsNewCardPresent()) {
        return;
    }

    // Select one of the cards
    if ( ! mfrc522.PICC_ReadCardSerial()) {
        return;
    }

    if(wifiSwitch){
    
        if (WiFi.status() != WL_CONNECTED) {

            Serial.print("Attempting to connect to SSID: ");
            Serial.println(ssid);

            while (WiFi.status() != WL_CONNECTED) {
                WiFi.begin(ssid, pass); // Connect to WPA/WPA2 network
                Serial.print(".");
                delay(5000);
            }

            Serial.println("\nConnected");
            ThingSpeak.begin(client); 
        }
  
    }
  

    //byte dataBlock[16]; // new block array to store new array block
    byte sector         = 1; //Sector
    byte blockAddr      = 5; //Block 5 = [Sector: [1] block: [1]]
    byte trailerBlock  = 7;
    
    //Block to be write to
    // 0x41, 0x70, 0x70, 0x6c, 0x65, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 apple (B5)
    // 0x38, 0x58, 0x4E, 0x50, 0x4E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 8XNPN (B6)
    // 0x36, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 6 (B4)

    // 0x4F, 0x72, 0x61, 0x6E, 0x67, 0x65, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 orange (B5)
    // 0x34, 0x67, 0x4A, 0x65, 0x4C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 4gJeL (B6)
    // 0x35, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 5 (B4)

  
    MFRC522::StatusCode status;
    byte buffer[18];
    byte size = sizeof(buffer);

    // Show the whole sector as it currently is
    Serial.println(F("Old data in sector:")); 
    mfrc522.PICC_DumpMifareClassicSectorToSerial(&(mfrc522.uid), &key, sector); //print function
    Serial.println();

    String price = getStringRead(4);
    String productName = getStringRead(5);
    String productId = getStringRead(6);

    if(productName != "" && productName != "" && productId.length() == 5){

      if(isAdd){
        addProduct(productId, price.toDouble());
      }
      else{
        int temp = subProduct(productId, price.toDouble());

        if(temp == -1){ // Sub product not exist
          loadingScreen("Not exist!", 0);
          mfrc522.PICC_HaltA();
          mfrc522.PCD_StopCrypto1();
          return;
        }
        else if(temp == 0){ // Sub product not exist 
          if(wifiSwitch){     
            String k = arrToString();
            loadingScreen("Uploading...", 0);
            uploadSpeak(k);
            printProduct();
          }
          
          loadingScreen("All clear.", 0);
          mfrc522.PICC_HaltA();
          mfrc522.PCD_StopCrypto1();
          return;
        }
        
      }

      String k = arrToString();

      if(wifiSwitch){ //have wifi
        loadingScreen("Uploading...", 0);
        uploadSpeak(k);
        screenName(productId, productName, price.toDouble());
  
      }
      else{ // no wifi  
        screenName(productId, productName, price.toDouble());
      }
      printProduct();
 
    }
   
      
    // Halt PICC & Stop encryption on PCD
    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();
    delay(500);
  
}

void dump_byte_array(byte *buffer, byte bufferSize) {
  for (byte i = 0; i < bufferSize; i++) {
    Serial.print(buffer[i] < 0x10 ? " 0" : " ");
    Serial.print(buffer[i], HEX);
  }
}

String getStringRead(byte blockAddr){ //Get words from regarding block
  MFRC522::StatusCode status;
  byte buffer[18];
  byte size = sizeof(buffer);
    
  status = (MFRC522::StatusCode) mfrc522.MIFARE_Read(blockAddr, buffer, &size); //copy current blockData to buffer **
  if (status != MFRC522::STATUS_OK) {
    Serial.print(F("MIFARE_Read() failed: "));
    Serial.println(mfrc522.GetStatusCodeName(status));
    return "";
  }
    
  String myword = "";   
  for (byte i = 0; i < 16; i++) { //store the old block info to new array
 
    if(mytransfer(buffer[i]) != '\0'){
      myword += mytransfer(buffer[i]);
    }
            
  }

  return myword;
  
}

char mytransfer(byte k){ // ascii to char
  //https://upload.wikimedia.org/wikipedia/commons/1/1b/ASCII-Table-wide.svg
  //By reemo
  //only accept numbers, words for naming in below, else return \0
  char n[] = "0123456789";
  char b[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  char s[] = "abcdefghijklmnopqrstuvwxyz";

  if(k >= 0x30 && k <= 0x39){ //numbers
    return n[k - 0x30];
  }
  else if(k >= 0x41 && k <= 0x5a){ //big letters
    return b[k - 0x41];
  }
  else if(k >= 0x61 && k <= 0x7a){ //small letters
    return s[k - 0x61];
  }
  else if(k == 0x20){
    return ' ';
  }
  
  return '\0';
  
  
}

void uploadSpeak(String content){ // upload and retry

    while(true){
    
        ThingSpeak.setField(2, content);
        myStatus = String("hi");
        ThingSpeak.setStatus(myStatus);
        
        int x = ThingSpeak.writeFields(myChannelNumber, myWriteAPIKey);
        
        if(x == 200){
          Serial.println("Channel update successful.");
          return;
        }
        else{
          Serial.println("Problem updating channel. HTTP error code " + String(x));
          Serial.println("Reconnect after 25 seconds");
          delay(25000);
            
        }
    
    }

}

void RGB_color(int red_value, int green_value, int blue_value){
  analogWrite(red_light_pin, red_value);
  analogWrite(green_light_pin, green_value);
  analogWrite(blue_light_pin, blue_value);
}