# MQTT Integration Plan

## 1. Overview
The Edge Application uses the **Eclipse Paho MQTT C++** library for all cloud communications. This document defines the configuration, topic structures, and lifecycle of the MQTT connection, ensuring absolute compatibility with the existing Node.js backend.

## 2. Library Integration
- **Framework:** Eclipse Paho MQTT C++ (and its underlying C library).
- **Integration Method:** CMake `FetchContent`.
- **Qt Wrapper:** The Paho client will be wrapped in a `QObject`-derived `MqttService` class. Signals will be emitted to pass payload data safely across thread boundaries into the Qt event loop.

## 3. Connection Lifecycle

### 3.1 Unprovisioned State
- Connect anonymously or using default provisioning credentials.
- Client ID: `pi_{MAC_ADDRESS}`
- Subscribe to: `smartcart/provisioning/claimed/{MAC_ADDRESS}`

### 3.2 Provisioned State (Normal Operation)
- Connect using persisted `mqtt_user` and `mqtt_pass`.
- Client ID: `{CART_ID}`
- Subscribe to:
  - `smartcart/{MAC_ADDRESS}/commands` (Server commands, e.g., Payment Links)
  - `cart/{MAC_ADDRESS}/ads` (AI Ad Recommendations)
  - `cart/{CART_ID}/payment` (Payment Success Webhooks)

## 4. Topic & Payload Specifications

*Note: All payloads must be strictly valid JSON.*

### 4.1 Provisioning (Jetson -> Cloud)
- **Topic:** `smartcart/provisioning/announce/{MALL_ID}`
- **QoS:** 1
- **Payload:**
  ```json
  {
    "macAddress": "AA:BB:CC:DD:EE:FF"
  }
  ```

### 4.2 Provisioning Claim (Cloud -> Jetson)
- **Topic:** `smartcart/provisioning/claimed/{MAC_ADDRESS}`
- **Payload:**
  ```json
  {
    "status": "claimed",
    "cartId": "CART_001",
    "mqttUser": "user123",
    "mqttPass": "pass123"
  }
  ```

### 4.3 Shopping Events (Jetson -> Cloud)
- **Topic:** `smartcart/{MAC_ADDRESS}/item_added` (or similar event types)
- **QoS:** 1
- **Payload:**
  ```json
  {
    "id": "12345",
    "brand_name": "Product Name",
    "price": 4.99,
    "weight_grams": 250
  }
  ```

### 4.4 Telemetry (Jetson -> Cloud)
- **Topic:** `smartcart/{MAC_ADDRESS}/telemetry`
- **QoS:** 0 (or 1 depending on backend requirement)
- **Payload:**
  ```json
  {
    "battery": 85.5,
    "health": 100,
    "state": "shopping"
  }
  ```

### 4.5 Server Commands (Cloud -> Jetson)
- **Topic:** `smartcart/{MAC_ADDRESS}/commands`
- **Payload (Example: Payment Info):**
  ```json
  {
    "command": "paymentInfo",
    "paymentUrl": "https://gateway.example.com/pay/123"
  }
  ```

## 5. Error Handling & Reconnection
- **Automatic Reconnect:** Paho client must be configured with `set_automatic_reconnect(true)`.
- **Offline Queuing:** If the network drops, telemetry can be discarded, but critical events (Checkout) should be queued or blocked at the UI level until connectivity is restored.