#include <ESP32_Supabase.h>
#include <WiFiClientSecure.h>
#include <WiFi.h>

// declare pin variables
const int wifiLed = 21; // blue led
const int addLed = 19; // green led
const int removeLed = 18; // red led
const int scanModeBtn = 13; // switch between add and remove
const int sendRequestBtn = 14;

// scan mode and state
int scanMode = 1; // 1 = add, -1 = remove
int scanState = LOW;
int sendRequestState = LOW;

// Put your supabase URL and Anon key here...
// Because Login already implemented, there's no need to use secretrole key
String API_URL = "";
String API_KEY = "";
String TABLE_NAME = "";

// Put your WiFi credentials (SSID and Password) here
const char* ssid = ""; 
const char* pswd = ""; 

HTTPClient https;
WiFiClientSecure client;

// JSON content for requests
String JSON = "{\"barcode\": \"0028400314077\", \"scan_mode\": \"add\"}";
String removeJSON = "{\"barcode\": \"0028400314077\", \"scan_mode\": \"remove\"}";

void setup() {
  pinMode(wifiLed, OUTPUT);
  pinMode(addLed, OUTPUT);
  pinMode(removeLed, OUTPUT);
  pinMode(scanModeBtn, INPUT);
  pinMode(sendRequestBtn, INPUT);

  Serial.begin(9600);
  client.setInsecure();

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
  sendRequestState = digitalRead(sendRequestBtn);

  // Update on scan mode button press
  if (scanState == LOW) {
    scanMode = -1 * scanMode;
  }

  // Write to scan mode LEDs
  if (scanMode == 1) {
      digitalWrite(addLed, HIGH);
      digitalWrite(removeLed, LOW);
    } else {
      digitalWrite(addLed, LOW);
      digitalWrite(removeLed, HIGH);
    }

  // Ensure Wifi is connected before attempting a request
  if (WiFi.status() == WL_CONNECTED) {
    if (sendRequestState == LOW) {
      Serial.println("Sending request now...");

      // Send http post request to server
      https.begin(client, API_URL + "/rest/v1/" + TABLE_NAME);
      https.addHeader("Content-Type", "application/json");
      https.addHeader("Prefer", "return=representation");
      https.addHeader("apikey", API_KEY);
      https.addHeader("Authorization", "Bearer " + API_KEY);

      // Adjust request depending on scan mode (add or remove)
      int httpCode = -1;
      if (scanMode == 1) {
        httpCode = https.POST(JSON);
      } else {
        httpCode = https.POST(removeJSON);
      }
      String payload = https.getString();
      Serial.print(httpCode); // print http return code
      Serial.print(": ");
      Serial.println(payload); // print request response payload
      https.end();

      Serial.println("Request sent!");
    }
  }
  else {
    digitalWrite(wifiLed, LOW);
    Serial.println("WiFi disconnected.");
  }

  delay(100);
}
