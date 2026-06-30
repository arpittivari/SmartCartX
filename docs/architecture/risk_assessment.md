# Risk Assessment & Mitigation

## 1. Migration Risks

### Risk 1: Jetson & STM32 UART Desynchronization
- **Impact:** High. Loss of weight events means items won't be added to the cart, breaking the shopping flow.
- **Cause:** Noise on the UART line causing dropped bytes, or Jetson CPU spikes delaying UART parsing.
- **Mitigation:** Implement strict CRC16 checking. Ensure STM32 UART TX uses DMA. On the Jetson, run the `UartDriver` in a high-priority background `QThread` distinct from the main GUI thread.

### Risk 2: MQTT Reconnection Failures in Retail Environments
- **Impact:** High. If a cart loses Wi-Fi in an aisle and fails to reconnect, checkout is impossible.
- **Cause:** Flaky mall Wi-Fi and improper Paho MQTT client configuration.
- **Mitigation:** Use Paho's built-in automatic reconnect feature with exponential backoff. Queue critical events (like "Item Added") locally and flush them when QoS 1 confirms delivery. Do NOT rely solely on QNetworkAccessManager for network state; use MQTT keep-alives.

### Risk 3: STM32 Memory Fragmentation
- **Impact:** Severe. A cart freezing mid-shop requires a hard reboot, infuriating customers.
- **Cause:** Dynamic memory allocation (`malloc`/`new`) in FreeRTOS tasks over a long uptime.
- **Mitigation:** Mandate `configSUPPORT_STATIC_ALLOCATION = 1`. All task stacks, queues, and message buffers must be statically allocated at compile time. No dynamic memory usage is permitted in the STM32 firmware.

### Risk 4: QML Performance on Embedded Linux
- **Impact:** Medium. Sluggish UI animations.
- **Cause:** Over-reliance on Javascript inside QML or complex Canvas rendering.
- **Mitigation:** Use Qt Quick Compiler. Move all data manipulation, timer logic, and heavy lifting to C++. QML should ONLY read properties and emit signals. Use EGLFS instead of X11/Wayland if possible for direct framebuffer access.

### Risk 5: Transitioning from Python OCR to C++ Jetson Inference
- **Impact:** Medium. Delays in item scanning.
- **Cause:** Porting the `pytesseract` and Pandas logic directly to C++ might be inefficient.
- **Mitigation:** While out of scope for the immediate protocol/hardware rewrite, future Computer Vision integration should use NVIDIA TensorRT and DeepStream C++ APIs rather than generic OpenCV/Tesseract to utilize the Jetson's GPU effectively.