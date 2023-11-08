#include <Arduino.h>
#include <ESP32_Supabase.h>
#include <WiFiClientSecure.h>
#include <WiFi.h>

#include <LiquidCrystal_I2C.h>
#include <NewPing.h>

// Put your supabase URL and Anon key here...
// Because Login already implemented, there's no need to use secretrole key
String API_URL = "https://ninnntxqlfkxrtwsxtao.supabase.co";
String API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbm5udHhxbGZreHJ0d3N4dGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkxMjU1MDYsImV4cCI6MjAxNDcwMTUwNn0.Wg5_xp25r6UuzRqL1P3tkxDUUzRqlTrK3N-MLPVQKmE";
String ESP32_DATA_TABLE = "esp32_data";
String PRODUCTS_TABLE = "products";

// Put your WiFi credentials (SSID and Password) here
const char* ssid = "jan"; 
const char* pswd = "hello1234"; 

// Sending interval packing in secs
int sendingInterval = 1200; // 20 minutes

HTTPClient https;
WiFiClientSecure client;

String JSON = "{\"name\": \"powerpuffs\", \"barcode\": 1234567890, \"ingredients\": \"sugar, spice, and everything nice\"}";


//define I2C address
LiquidCrystal_I2C lcd(0x3f,16,2);

// PINS
#define TRIGGER 33
#define ECHO    32

// OTHER MACROS
#define TRIGGER_DISTANCE 5  // Distance we want to trip that alarm at or under (in Inches)
#define MAX_DISTANCE 36     // Maximum distance we want to measure (in Inches)
#define PING_INTERVAL 3000  // 3 second intervals for ultrasonic sensor to get distance measurements 

// NewPing setup of pins and maximum distance
NewPing sonar(TRIGGER, ECHO, MAX_DISTANCE); 

// Variable to store the previous door status
int previousDoorStatus = -1; // Initialize to an invalid value


void setup() {
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

  lcd.init();
  lcd.clear();
  lcd.backlight();

  lcd.setCursor(2, 0);
  lcd.print("Hello");

  lcd.setCursor(0, 1);
  lcd.print("I'm PantryPal!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    lcdDisplay();
    espToDatabase();
  } else {
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


void lcdDisplay() {
    delay(PING_INTERVAL);

  // Send ping, get distance in inches (0 = outside set distance range)
  int distance = sonar.ping_in();

  int currentDoorStatus;

  lcd.clear();
  lcd.noBacklight();

  // Determine if the door is opened / closed
  if (distance > 0 && distance < TRIGGER_DISTANCE) {
    currentDoorStatus = 0;
  } else {
    currentDoorStatus = 1;
  }

  // If the door status changes, update the LCD and print to serial monitor
  if (currentDoorStatus != previousDoorStatus) {
    lcd.backlight();
    lcd.clear();
    lcd.setCursor(0, 0);
    if (currentDoorStatus == 0) {
      lcd.print("Door is closed.");
    } else {
      lcd.print("Door is open.");
    }
    Serial.print("Door is ");

    if (currentDoorStatus == 0) {
      Serial.println("closed");
    } else {
      Serial.println("open");
    }

    previousDoorStatus = currentDoorStatus;
  }

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" in");
}


void espToDatabase() {
  // Send http post request to server
  https.begin(client, API_URL + "/rest/v1/" + PRODUCTS_TABLE);
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
