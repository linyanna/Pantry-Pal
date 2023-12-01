#include <ESP32_Supabase.h>
#include <WiFiClientSecure.h>
#include <WiFi.h>
#include <HardwareSerial.h>
#include "SparkFun_DE2120_Arduino_Library.h" //Click here to get the library: http://librarymanager/All#SparkFun_DE2120

// Pin macros
#define RX 23
#define TX 19
#define wifiLed 25 // blue led
#define addLed 26 // green led
#define removeLed 27 // red led
#define scanModeBtn 13
#define BUFFER_LEN 40

// Scan mode and state
int scanMode = 1; // 1 = add, -1 = remove
int scanState = LOW;

// Put your supabase URL and Anon key here...
// Because Login already implemented, there's no need to use secretrole key
String API_URL = "https://ninnntxqlfkxrtwsxtao.supabase.co";
String API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbm5udHhxbGZreHJ0d3N4dGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkxMjU1MDYsImV4cCI6MjAxNDcwMTUwNn0.Wg5_xp25r6UuzRqL1P3tkxDUUzRqlTrK3N-MLPVQKmE";
String TABLE_NAME = "esp32_barcodes";

// Put your WiFi credentials (SSID and Password) here
const char* ssid = "Weefee"; 
const char* pswd = "tofeeornottofee1w3"; 

// Declare objects
HardwareSerial scannerSerial(1);
DE2120 scanner;
HTTPClient https;
WiFiClientSecure client;
uint8_t byteFromSerial;
char scanBuffer[BUFFER_LEN];


void setup() {
  pinMode(wifiLed, OUTPUT);
  pinMode(addLed, OUTPUT);
  pinMode(removeLed, OUTPUT);
  pinMode(scanModeBtn, INPUT);

  Serial.begin(115200);
  while(!Serial);
  Serial.println("Starting scanner sketch!");
  scannerSerial.begin(115200, SERIAL_8N1, RX, TX); // set your TX/RX Pin
  client.setInsecure();

  // Connecting to Scanner
  if (scanner.begin(scannerSerial) == false)
  {
    Serial.println("Scanner did not respond. Please check wiring. Did you scan the POR232 barcode? Freezing...");
    while(1);
  }
  Serial.println("Scanner online!");

  // Connecting to Wi-Fi
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, pswd);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(100);
    Serial.print(".");
  }
  Serial.println("Connected!");
  digitalWrite(wifiLed, HIGH);
}

void loop() {
  scanState = digitalRead(scanModeBtn); 

  // Update add/remove on scan mode button press
  if (scanState == LOW) {
    scanMode = -1 * scanMode;
  }

  // Write to scan mode LEDs: add = green, remove = red
  if (scanMode == 1) {
    digitalWrite(addLed, HIGH);
    digitalWrite(removeLed, LOW);
  }
  else {
    digitalWrite(addLed, LOW);
    digitalWrite(removeLed, HIGH);
  }

  if (scanner.readBarcode(scanBuffer, BUFFER_LEN))
  {
    Serial.print("Code found: ");
    Serial.print(scanBuffer);
    Serial.println();

    // Ensure Wifi is connected before attempting a request
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("Sending request now...");

      // Send http post request to server
      https.begin(client, API_URL + "/rest/v1/" + TABLE_NAME);
      https.addHeader("Content-Type", "application/json");
      https.addHeader("Prefer", "return=representation");
      https.addHeader("apikey", API_KEY);
      https.addHeader("Authorization", "Bearer " + API_KEY);

      // Adjust request depending on scan mode (add or remove)
      String JSON = "{\"barcode\": \"";
      for (int i = 0; i < strlen(scanBuffer)-1; i++) // 1 less than length to remove new line
        JSON += scanBuffer[i];

      if (scanMode == 1) {
        JSON += "\", \"scan_mode\": \"add\"}"; 
      } else {
        JSON += "\", \"scan_mode\": \"remove\"}"; 
      }
      int httpCode = https.POST(JSON);
      String payload = https.getString();

      // Print code and payload
      Serial.print(httpCode); // print http return code
      Serial.print(": ");
      Serial.println(payload); // print request response payload
      https.end();

      Serial.println("Request sent!");
    }
    else {
      digitalWrite(wifiLed, LOW);
      Serial.println("WiFi disconnected.");
    }
  }

  delay(200);
}
