#include <WiFiClientSecure.h>
#include <WiFi.h>

// Put your supabase URL and Anon key here...
// Because Login already implemented, there's no need to use secretrole key
String API_URL = "";
String API_KEY = "";
String TABLE_NAME = "";

// Put your WiFi credentials (SSID and Password) here
const char* ssid = ""; 
const char* pswd = ""; 

// Sending interval packing in secs
int sendingInterval = 1200; // 20 minutes

HTTPClient https;
WiFiClientSecure client;

String JSON = "{\"barcode\": 234}";

void setup()
{
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
}

void loop()
{
  if (WiFi.status() == WL_CONNECTED) {
    // Send http post request to server
    https.begin(client, API_URL + "/rest/v1/" + TABLE_NAME);
    https.addHeader("Content-Type", "application/json");
    https.addHeader("Prefer", "return=representation");
    https.addHeader("apikey", API_KEY);
    https.addHeader("Authorization", "Bearer " + API_KEY);
    int httpCode = https.POST(JSON);
    String payload = https.getString();
    Serial.println(httpCode); // print http return code
    Serial.println(payload); // print request response payload
    https.end();
  }
  else {
    Serial.println("WiFi disconnected.");
  }
  // TODO: create function with each request method and call accordingly
  // on barcode scan => POST
  // on ultrasonic range change => POST && tell lcd MCU barcode and to GET from supabase
  // on poke from lcd MCU => GET product name from barcode
  // consider ESPNow or Websocket protocol between lcd and ultrasonic

  // TODO: remove this delay
  delay(1000*sendingInterval); // wait to send the next request
}