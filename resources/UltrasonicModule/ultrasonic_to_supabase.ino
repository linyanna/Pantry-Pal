#include <Arduino.h>
#include <ESP32_Supabase.h>
#include <WiFiClientSecure.h>
#include <WiFi.h>
#include <NewPing.h>
// Put your supabase URL and Anon key here...
// Because Login already implemented, there's no need to use secretrole key
String API_URL = "";
String API_KEY = "";
String TABLE_NAME = "";  // Put your WiFi credentials (SSID and Password) here
const char *ssid = "";
const char *pswd = "";  // Sending interval packing in secs
int sendingInterval = 1200;       // 20 minutes
HTTPClient https;
WiFiClientSecure client;
String JSON = "{\"isOpen\": }";

#define TRIGGER 33
#define ECHO 32

// OTHER MACROS
#define TRIGGER_DISTANCE 12  // Distance we want to trip that alarm at or under (in Inches)
#define MAX_DISTANCE 36      // Maximum distance we want to measure (in Inches)
#define PING_INTERVAL 50

NewPing sonar(TRIGGER, ECHO, MAX_DISTANCE);  // NewPing setup of pins and maximum distance.
void setup() {
  Serial.begin(9600);
  Serial.println("Starting setup.");
  client.setInsecure();  // Connecting to Wi-Fi
  Serial.println("Connecting to WiFi");
  WiFi.begin(ssid, pswd);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println(".");
  }
  Serial.println("Connected!");
}
void loop() {
  int distance = sonar.ping_in();
  String JSON = "{\"isOpen\": ";
  if (distance > 3) {
    JSON = JSON + "\"false\"}";
}
else {
  JSON = JSON + + "\"true\"}";
}
Serial.print("new distance version:");
Serial.print(distance);
Serial.println(" in.");
if (WiFi.status() == WL_CONNECTED) {  // Send http post request to server
  https.begin(client, API_URL + "/rest/v1/" + TABLE_NAME);
  https.addHeader("Content-Type", "application/json");
  https.addHeader("Prefer", "return=representation");
  https.addHeader("apikey", API_KEY);
  https.addHeader("Authorization", "Bearer " + API_KEY);
  int httpCode = https.POST(JSON);
  String payload = https.getString();
  Serial.println(httpCode);  // print http return code
  Serial.println(payload);   // print request response payload
  https.end();
} else {
  Serial.println("WiFi disconnected.");
}  // TODO: create function with each request method and call accordingly
// on barcode scan => POST
// on ultrasonic range change => POST && tell lcd MCU barcode and to GET from supabase
// on poke from lcd MCU => GET product name from barcode
// consider ESPNow or Websocket protocol between lcd and ultrasonic
// TODO: remove this delay
delay(3000);  // wait to send the next request
}