#include <Arduino.h>
#include <ESP32_Supabase.h>
#include <WiFiClientSecure.h>
#include <WiFi.h>
#include <NewPing.h>
#include <time.h>
// Put your supabase URL and Anon key here...
// Because Login already implemented, there's no need to use secretrole key
String API_URL = "";
String API_KEY = "";
String TABLE_NAME = "door_status";  // Put your WiFi credentials (SSID and Password) here
const char *ssid = "";
const char *pswd = "";  // Sending interval packing in secs
int sendingInterval = 1200;         // 20 minutes
HTTPClient https;
WiFiClientSecure client;
String JSON = "{\"isOpen\": }";


long int lastChange = 0;
//main way to determine when to send HTTP requests.
String oldState = "Closed";
String newState = "Closed";

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
  Serial.println("Connected to WiFi!");

  //set up time config
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.println("\nWaiting for time");

  while (time(nullptr) < 1700000) {
    Serial.print(".");
    delay(1000);
  }
  Serial.println("Connected to time server!");
}
void loop() {

  //get time and epoch time
  time_t now = time(nullptr);
  long int epochTime = static_cast<long int>(now);

  //set lastChange if it hasn't been initialized
  if (lastChange == 0) {
    lastChange = epochTime;
  }




  int distance = sonar.ping_in();
  String JSON = "{\"isOpen\": ";
  if (distance > 3) {
    JSON = JSON + "\"false\"";
    long int timeChange = epochTime - lastChange;
    JSON += ", \"timeElapsed\": ";
    JSON += timeChange;
    JSON += "}";
    newState = "Closed";
  }

  else {
    JSON = JSON + +"\"true\"";
    long int timeChange = epochTime - lastChange;
    JSON += ", \"timeElapsed\": ";
    JSON += timeChange;
    JSON += "}";
    newState = "Open";
  }

  //send an HTTP request with the exact timestamp if the state of the fridge changes

  if (oldState != newState) {
    Serial.println("Changed state.");
    Serial.println("Time at state change: ");
    Serial.println(epochTime);
    if (WiFi.status() == WL_CONNECTED) {  // Send http post request to server
      https.begin(client, API_URL + "/rest/v1/" + TABLE_NAME);
      https.addHeader("Content-Type", "application/json");
      https.addHeader("Prefer", "return=representation");
      https.addHeader("apikey", API_KEY);
      https.addHeader("Authorization", "Bearer " + API_KEY);
      int httpCode = https.POST(JSON);
      Serial.println(JSON);
      String payload = https.getString();
      Serial.println(httpCode);  // print http return code
      Serial.println(payload);   // print request response payload
      https.end();
    } else {
      Serial.println("WiFi disconnected.");
    }
    oldState = newState;
    lastChange = epochTime;
    Serial.println("new state: " + newState);
  }

  delay(250);  // wait to send the next request
  Serial.println(distance);
}