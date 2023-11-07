// Include liquidCrystal_I2C.h and NewPing.h
// Tools -> Manage Libraries and type liquidCrystal_I2C
// Tools -> Manage Libraries and type NewPing
#include <LiquidCrystal_I2C.h>
#include <NewPing.h>

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
  // Initialize serial and wait for port to open
  Serial.begin(9600);
  // This delay gives the chance to wait for a Serial Monitor without blocking if none is found
  delay(1500);

  lcd.init();
  lcd.clear();
  lcd.backlight();

  lcd.setCursor(2, 0);
  lcd.print("Hello");

  lcd.setCursor(0, 1);
  lcd.print("I'm PantryPal!");
}

void loop() {
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