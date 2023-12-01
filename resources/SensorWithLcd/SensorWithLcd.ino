// Include liquidCrystal_I2C.h 
// Tools -> Manage Libraries and type liquidCrystal_I2C

#include <Arduino.h>
#include <ESP32_Supabase.h>
#include <WiFiClientSecure.h>
#include <WiFi.h>
#include <LiquidCrystal_I2C.h>
#include <NewPing.h>
#include <time.h>

// Put your supabase URL and Anon key here...
// Because Login already implemented, there's no need to use secretrole key
String API_URL = "";
String API_KEY = "";
String TABLE_NAME = "door_status";  

// Put your WiFi credentials (SSID and Password) here
const char *ssid = "";
const char *pswd = "";  

// Sending interval packing in secs
int sendingInterval = 1200; // 20 minutes
HTTPClient https;
WiFiClientSecure client;
String JSON = "{\"isOpen\": }";

long int lastChange = 0;

// Define I2C address
LiquidCrystal_I2C lcd(0x3f,16,2);

// PINS
#define TRIGGER 33
#define ECHO 32

// OTHER MACROS
#define TRIGGER_DISTANCE 12  // Distance we want to trip that alarm at or under (in Inches)
#define MAX_DISTANCE 36      // Maximum distance we want to measure (in Inches)
#define PING_INTERVAL 1000   // 1 second interval for ultrasonic sensor to get distance measurements 

// NewPing setup of pins and maximum distance.
NewPing sonar(TRIGGER, ECHO, MAX_DISTANCE);  

// Variable to store the previous door status
int previousDoorStatus = -1;  // Initialize to invalid value

void setup() {
  // Initialize serial and wait for port to open
  Serial.begin(9600);

  // Connecting to Wi-Fi
  Serial.println("Connecting to WiFi");
  WiFi.begin(ssid, pswd);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println(".");
  }
  Serial.println("Connected to WiFi!");

  // Set up time config
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.println("\nWaiting for time");

  while (time(nullptr) < 1700000) {
    Serial.print(".");
    delay(1000);
  }
  Serial.println("Connected to time server!");
  client.setInsecure(); 

  // This delay gives the chance to wait for a Serial Monitor without blocking if none is found
  lcd.init();
  lcd.clear();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("WiFi");
  lcd.setCursor(0, 1);
  lcd.print("connected");

  delay(PING_INTERVAL);

  lcd.clear();

  lcd.setCursor(0, 0);
  lcd.print("Hello");
  lcd.setCursor(0, 1);
  lcd.print("I'm PantryPal!");
}

void loop() {
  delay(PING_INTERVAL);

  // Get time and epoch time
  time_t now = time(nullptr);
  long int epochTime = static_cast<long int>(now);

  // Set lastChange if it hasn't been initialized
  if (lastChange == 0) {
    lastChange = epochTime;
  }

  // Send ping, get distance in inches (0 = outside set distance range)
  int distance = sonar.ping_in();
  int currentDoorStatus;

  String JSON = "{\"isOpen\": ";

  // Determine if the door is opened or closed
  if (distance > 0 && distance < TRIGGER_DISTANCE) {
    // Door is closed
    currentDoorStatus = 0;
    JSON = JSON + "\"false\"";
    long int timeChange = epochTime - lastChange;
    JSON += ", \"timeElapsed\": ";
    JSON += timeChange;
    JSON += "}";
  } else {
    // Door is open
    currentDoorStatus = 1;
    JSON = JSON + +"\"true\"";
    long int timeChange = epochTime - lastChange;
    JSON += ", \"timeElapsed\": ";
    JSON += timeChange;
    JSON += "}";
  }

  // Turn off display if less than a minute and more than 2 minutes
  long int timeChange = epochTime - lastChange;
  if (timeChange < 60 || timeChange > 90) {
    lcd.clear();
    lcd.noBacklight();
  } else if (timeChange >= 60 && currentDoorStatus == 1) {
    lcd.backlight();
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Please close");
    lcd.setCursor(0, 1);
    lcd.print("door!");
  }

  // If the door status changes, update the LCD and print to serial monitor
  if (currentDoorStatus != previousDoorStatus) {
    // Display time of door status change
    Serial.println("Time at state change: ");
    Serial.println(epochTime);

    // Change lcd display to current status
    lcd.backlight();
    lcd.clear();
    lcd.setCursor(0, 0);
      
    if (currentDoorStatus == 0) {
      lcd.print("Door is closed");
    } else {
      lcd.print("Door is open");
    }

    // Send an HTTP request with the exact timestamp if the state of the fridge changes
    if (WiFi.status() == WL_CONNECTED) {  
      // Send http post request to server
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
      lcd.clear();

      lcd.setCursor(0, 0);
      lcd.print("WiFi");
      lcd.setCursor(0, 1);
      lcd.print("disconnected");
    }

    Serial.print("Door is ");
    if (currentDoorStatus == 0) {
      Serial.println("closed");
    } else {
      Serial.println("open");
    }

    previousDoorStatus = currentDoorStatus;
    lastChange = epochTime;
  }

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" in");
}