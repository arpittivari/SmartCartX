#include <Arduino.h>
#include <HX711.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ==========================================
// CONFIGURATION
// ==========================================
// WiFi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT Broker Settings
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* mqtt_client_id = "ESP32_SensorHub_01";
const char* mqtt_topic_pub = "mall/cart_01/items";
const char* cart_id = "cart_01";

// Pin definitions for HX711 Load Cells
const int SCALE1_DT = 16;
const int SCALE1_SCK = 17;
const int SCALE2_DT = 18;
const int SCALE2_SCK = 19;

// ==========================================
// MACROS & DEBUGGING
// ==========================================
// Uncomment the following line to enable debug output over Serial.
// NOTE: When connected to the Pi, keep this commented out to avoid corrupting JSON parsing!
// #define DEBUG

#ifdef DEBUG
  #define DEBUG_PRINT(x) Serial.print("DEBUG: "); Serial.println(x)
  #define DEBUG_PRINTLN(x) Serial.println(x)
#else
  #define DEBUG_PRINT(x)
  #define DEBUG_PRINTLN(x)
#endif

// ==========================================
// GLOBALS
// ==========================================
HX711 scale1;
HX711 scale2;
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Weight logic variables
float weight1 = 0.0;
float weight2 = 0.0;
float lastStableWeight = 0.0;
float currentTrackingWeight = 0.0;
unsigned long stableStartTime = 0;

// Serial buffer
String serialBuffer = "";

// Timers
unsigned long lastWeightReadTime = 0;
const unsigned long weightReadInterval = 100; // Poll scales every 100ms
const float STABLE_TOLERANCE = 2.0;           // Fluctuations within 2g are considered stable

// ==========================================
// FUNCTION DECLARATIONS
// ==========================================
void setupWiFi();
void reconnectMQTT();
float getTotalWeight();
void processSerialData();

// ==========================================
// SETUP
// ==========================================
void setup() {
  Serial.begin(115200);

  #ifdef DEBUG
    // Give Serial time to initialize
    delay(1000);
    DEBUG_PRINTLN("Initializing SmartCart Sensor Hub...");
  #endif

  // Initialize Scales
  scale1.begin(SCALE1_DT, SCALE1_SCK);
  scale2.begin(SCALE2_DT, SCALE2_SCK);

  // Set calibration factors (Needs to be adjusted per load cell hardware)
  scale1.set_scale(2280.f);
  scale2.set_scale(2280.f);

  DEBUG_PRINTLN("Taring scales...");
  scale1.tare();
  scale2.tare();

  // Block momentarily during setup to get initial baseline weight
  while(!scale1.is_ready() || !scale2.is_ready()) {
    delay(10);
  }
  weight1 = scale1.get_units(10);
  weight2 = scale2.get_units(10);
  lastStableWeight = weight1 + weight2;
  currentTrackingWeight = lastStableWeight;
  stableStartTime = millis();

  #ifdef DEBUG
    Serial.print("DEBUG: Initial baseline weight: ");
    Serial.print(lastStableWeight);
    Serial.println("g");
  #endif

  // Setup Networking
  setupWiFi();
  mqttClient.setServer(mqtt_server, mqtt_port);
}

// ==========================================
// MAIN LOOP
// ==========================================
void loop() {
  unsigned long currentMillis = millis();

  // 1. Maintain WiFi Connection (Non-blocking)
  if (WiFi.status() != WL_CONNECTED) {
    setupWiFi();
  }

  // 2. Maintain MQTT Connection (Non-blocking)
  if (WiFi.status() == WL_CONNECTED && !mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  // 3. Non-blocking Weight Sensing & Stability Logic
  if (currentMillis - lastWeightReadTime >= weightReadInterval) {
    lastWeightReadTime = currentMillis;

    float currentWeight = getTotalWeight();

    // Check if the weight has fluctuated beyond our tolerance
    if (abs(currentWeight - currentTrackingWeight) > STABLE_TOLERANCE) {
      currentTrackingWeight = currentWeight;
      stableStartTime = currentMillis; // Reset stability timer
    }

    // If the weight has remained stable for 1.5 seconds
    if (currentMillis - stableStartTime >= 1500) {
      float weightChange = currentTrackingWeight - lastStableWeight;

      // If the stable weight change is greater than 10 grams (weight added)
      if (weightChange > 10.0) {

        #if ARDUINOJSON_VERSION_MAJOR >= 7
          JsonDocument doc;
        #else
          StaticJsonDocument<200> doc;
        #endif

        doc["event"] = "weight_added";
        doc["grams"] = weightChange;

        serializeJson(doc, Serial);
        Serial.println(); // Send JSON over Serial to Raspberry Pi

        #ifdef DEBUG
          Serial.print("DEBUG: Triggered Pi with weight change: ");
          Serial.print(weightChange);
          Serial.println("g");
        #endif
      }

      // Update baseline weight whenever it becomes stable
      // (This handles both adding and removing items safely)
      if (abs(currentTrackingWeight - lastStableWeight) > STABLE_TOLERANCE) {
        lastStableWeight = currentTrackingWeight;
      }
    }
  }

  // 4. Process incoming serial replies from Raspberry Pi
  processSerialData();
}

// ==========================================
// IMPLEMENTATIONS
// ==========================================
void setupWiFi() {
  static unsigned long lastWiFiAttempt = 0;
  unsigned long now = millis();

  // Attempt to connect every 5 seconds without blocking the loop completely
  if (WiFi.status() != WL_CONNECTED && (now - lastWiFiAttempt > 5000 || lastWiFiAttempt == 0)) {
    lastWiFiAttempt = now;
    DEBUG_PRINTLN("Connecting to WiFi...");
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
  }
}

void reconnectMQTT() {
  static unsigned long lastMQTTAttempt = 0;
  unsigned long now = millis();

  if (now - lastMQTTAttempt > 5000) {
    lastMQTTAttempt = now;
    DEBUG_PRINTLN("Attempting MQTT connection...");

    if (mqttClient.connect(mqtt_client_id)) {
      DEBUG_PRINTLN("MQTT connected!");
      lastMQTTAttempt = 0;
    } else {
      #ifdef DEBUG
        Serial.print("DEBUG: MQTT connect failed, rc=");
        Serial.println(mqttClient.state());
      #endif
    }
  }
}

float getTotalWeight() {
  // Using is_ready() ensures we never block the main loop waiting for HX711 hardware delays
  if (scale1.is_ready()) {
    weight1 = scale1.get_units(1);
  }
  if (scale2.is_ready()) {
    weight2 = scale2.get_units(1);
  }
  return weight1 + weight2;
}

void processSerialData() {
  while (Serial.available() > 0) {
    char c = Serial.read();

    if (c == '\n') {
      // End of JSON string reached, parse it
      #if ARDUINOJSON_VERSION_MAJOR >= 7
        JsonDocument doc;
      #else
        StaticJsonDocument<512> doc;
      #endif

      DeserializationError error = deserializeJson(doc, serialBuffer);

      if (!error) {
        const char* event = doc["event"];
        if (event != nullptr && String(event) == "item_verified") {
          const char* name = doc["name"];
          float price = doc["price"];
          float weight = doc["weight"];

          #if ARDUINOJSON_VERSION_MAJOR >= 7
            JsonDocument mqttDoc;
          #else
            StaticJsonDocument<256> mqttDoc;
          #endif

          // Assemble MQTT Publish Payload
          mqttDoc["cart_id"] = cart_id;
          mqttDoc["action"] = "add";
          mqttDoc["item"] = name;
          mqttDoc["price"] = price;
          mqttDoc["weight"] = weight;

          String mqttPayload;
          serializeJson(mqttDoc, mqttPayload);

          // Publish directly to Cloud MQTT Server
          if (mqttClient.connected()) {
            mqttClient.publish(mqtt_topic_pub, mqttPayload.c_str());
            DEBUG_PRINTLN("Published to MQTT: " + mqttPayload);
          } else {
            DEBUG_PRINTLN("MQTT not connected, dropped message.");
          }
        }
      } else {
        DEBUG_PRINTLN("Failed to parse incoming JSON from Pi");
      }

      serialBuffer = ""; // Clear buffer for next payload
    } else {
      serialBuffer += c; // Append character
    }
  }
}
