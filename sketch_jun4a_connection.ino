#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <HTTPClient.h>

// WiFi Credentials
const char* ssid = "Yncierto1";
const char* password = "OMGFML123";

// Server endpoint
const char* serverUrl = "http://192.168.148.177:3001/sensor-data";

// Temperature sensor setup
#define ONE_WIRE_BUS 4
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// Ultrasonic sensor setup
#define TRIG_PIN 5
#define ECHO_PIN 18

// EMA Smoothing
float smoothedDistance = 0;
bool firstRead = true;
const float alpha = 0.2;  // Smoothing factor: lower = smoother

void setup() {
  Serial.begin(115200);
  sensors.begin();
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Read temperature
  sensors.requestTemperatures();
  float tempC = sensors.getTempCByIndex(0);

  // Read and smooth distance using EMA
  float newDistance = getRawDistance();
  if (firstRead) {
    smoothedDistance = newDistance;
    firstRead = false;
  } else {
    smoothedDistance = alpha * newDistance + (1 - alpha) * smoothedDistance;
  }

  // Debug output
  Serial.print("Temperature: ");
  Serial.print(tempC);
  Serial.println(" °C");

  Serial.print("Water Level Distance (EMA): ");
  Serial.print(smoothedDistance, 1);
  Serial.println(" cm");

  // Send data to server
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{\"temperature\":" + String(tempC, 2) +
                         ", \"distance_cm\":" + String(smoothedDistance, 1) + "}";

    int httpResponseCode = http.POST(jsonPayload);
    Serial.println("Payload: " + jsonPayload);

    if (httpResponseCode > 0) {
      Serial.print("POST success, code: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("POST failed, error: ");
      Serial.println(http.errorToString(httpResponseCode).c_str());
    }

    http.end();
  } else {
    Serial.println("WiFi not connected!");
  }

  delay(1500);
}

// Function to get raw ultrasonic distance
float getRawDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH);
  float distance = duration * 0.034 / 2;
  return distance;
}
