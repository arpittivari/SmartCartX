# 🛒 SmartCart Central: The Future of Autonomous Retail

**SmartCart Central** is a premier e-commerce hardware platform delivering the next generation of smart shopping cart solutions. We combine cutting-edge AI hardware with a robust, multi-tenant cloud management system to transform the retail experience.

From autonomous checkout to real-time fleet analytics, SmartCart Central provides everything retailers need to deploy and manage a fleet of intelligent shopping carts.

![SmartCart Hardware](https://i.imgur.com/your-hardware-render.png)
*(Replace with actual product image)*

## 🚀 The SmartCart Hardware Ecosystem

Our platform is not just software; it's a complete hardware-software ecosystem designed for the modern retailer.

*   **Intelligent Carts:** ESP8266/ESP32-powered carts with weight sensors and AI vision for 99.9% accurate product recognition.
*   **Checkout-Free Experience:** Shoppers simply scan (or let the AI recognize), bag, and go. Payment is automatic.
*   **Robust Security:** Each hardware unit utilizes unique, dynamically generated MQTT credentials and secure TLS communication.
*   **Long-Lasting Battery:** Optimized power management for full-day operation with real-time battery health monitoring.

## 🌐 The Central Platform (Software)

To power our hardware, we provide a futuristic, real-time, multi-tenant management system.

*   **Real-Time Fleet Dashboard:** Monitor cart status (Idle, Shopping, Offline), battery levels, and precise indoor location.
*   **Multi-Tenant Architecture:** Built for scale. Supports multiple mall locations, each with isolated data, admins, and product catalogs.
*   **Sales & Usage Analytics:** Deep insights into shopper behavior, peak hours, and product performance.
*   **Remote Management:** Over-the-air updates, remote lock/unlock, and maintenance alerts.

## 🛠️ Tech Stack

*   **Hardware Firmware:** C++, Arduino Framework (ESP8266/ESP32), PubSubClient, ArduinoJson
*   **Cloud Backend:** Node.js, Express, MongoDB, Mongoose, MQTT.js, Socket.IO, JWT
*   **Web Frontend (Store & Admin):** React, TypeScript, Vite, Material-UI (MUI), Recharts
*   **Infrastructure:** Docker, Docker Compose, Mosquitto MQTT Broker

## 🚀 Getting Started with the Platform

SmartCart Central is open-source! You can deploy your own instance of the management platform to control your custom hardware.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/)
*   An MQTT Broker (e.g., [Mosquitto](https://mosquitto.org/download/))
*   MongoDB Database

### 1. Initial Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd smartcart-central
    ```

2.  **Configure Environment Variables:**
    *   Navigate to `/backend` and copy `.env.example` to `.env`.
    *   Fill in `MONGO_URI`, `JWT_SECRET`, and MQTT credentials.

3.  **Install Dependencies:**
    ```bash
    npm run install-all
    ```
    *Or manually:* `npm install` in root, backend, and frontend directories.

### 2. Running the System

We use Docker Compose for a seamless startup.

1.  **Launch:**
    ```bash
    docker-compose up --build
    ```

2.  **Access the Platform:**
    *   **Public Hardware Store & Landing:** [http://localhost:5173](http://localhost:5173)
    *   **Admin Dashboard:** Log in via the portal.
    *   **Backend API:** [http://localhost:5000](http://localhost:5000)

### 3. Connect Your Hardware

1.  Log in to the Admin Dashboard.
2.  Register a new Cart in "Cart Management".
3.  Obtain the unique MQTT credentials.
4.  Flash your ESP32/8266 with our firmware (located in `/firmware`) using these credentials.
5.  Power on. Your cart is now live on the network!

---

**SmartCart Central** — *Empowering the future of retail, one cart at a time.*
