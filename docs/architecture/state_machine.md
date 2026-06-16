# State Machine Architecture

## 1. Overview
The Edge Application is strictly governed by a Finite State Machine (FSM). This ensures that workflows like Provisioning, Shopping, and Checkout occur in the correct, inescapable sequence.

## 2. States & Transitions

### `State: BOOT`
- **Actions:** Initialize hardware, read `cart_config.ini`, verify connectivity.
- **Transitions:**
  - If config is missing -> `PROVISIONING`
  - If config exists -> `CUSTOMER_ONBOARDING`

### `State: PROVISIONING`
- **Actions:** Show Mall ID entry screen. Wait for user input.
- **Transitions:**
  - On submit -> `WAITING_FOR_APPROVAL`

### `State: WAITING_FOR_APPROVAL`
- **Actions:** Publish MQTT announce. Show spinner UI. Wait for `claimed` message.
- **Transitions:**
  - On `claimed` MQTT message -> `SAVE_CONFIGURATION`
  - On timeout/cancel -> `PROVISIONING`

### `State: SAVE_CONFIGURATION`
- **Actions:** Write config to disk.
- **Transitions:**
  - Immediately -> `REBOOT_REQUIRED`

### `State: REBOOT_REQUIRED`
- **Actions:** Prompt user to restart or automatically restart the Jetson.

---

### `State: CUSTOMER_ONBOARDING` (Normal Idle State)
- **Actions:** Show dynamic QR code for login, listen for phone number entry.
- **Transitions:**
  - On valid login -> `ACTIVE_SHOPPING`

### `State: ACTIVE_SHOPPING`
- **Actions:** Show cart contents. Enable camera & weight validation logic. Wait for UART weight events.
- **Transitions:**
  - On checkout button pressed -> `CHECKOUT_PENDING`
  - On timeout/logout -> `CUSTOMER_ONBOARDING`

### `State: CHECKOUT_PENDING`
- **Actions:** Request payment URL via HTTP. Display QR code on UI. Subscribe to payment webhook topic.
- **Transitions:**
  - On payment success MQTT message -> `PAYMENT_COMPLETE`
  - On cancel -> `ACTIVE_SHOPPING`

### `State: PAYMENT_COMPLETE`
- **Actions:** Show Thank You screen. Play success buzzer.
- **Transitions:**
  - After 5 seconds -> `CUSTOMER_ONBOARDING` (Resets cart data).

## 3. Error States (Overlay)
Error states (e.g., "Weight Mismatch", "Network Offline") are treated as sub-states or overlays on top of `ACTIVE_SHOPPING`. They lock the UI temporarily until the condition is resolved (e.g., item removed).