#ifndef PROTOCOLS_PACKET_HPP
#define PROTOCOLS_PACKET_HPP

#include <stdint.h>
#include <stddef.h>

namespace SmartCart {
namespace Protocol {

constexpr uint16_t MAGIC_HEADER = 0x55AA;

enum class Command : uint8_t {
    CMD_HEARTBEAT = 0x01,
    CMD_WEIGHT_TELEMETRY = 0x02,
    CMD_BATTERY_TELEMETRY = 0x03,
    CMD_BUTTON_EVENT = 0x04,
    CMD_LED_CONTROL = 0x05,
    CMD_BUZZER_CONTROL = 0x06,
    CMD_DIAGNOSTIC = 0x07
};

#pragma pack(push, 1)

struct PacketHeader {
    uint16_t magic;
    Command command;
    uint8_t payload_length;
};

// Payloads
struct HeartbeatPayload {
    uint32_t uptime_ms;
};

struct WeightPayload {
    int32_t weight_grams;
};

struct BatteryPayload {
    uint16_t voltage_mv;
    uint8_t state_of_charge_pct;
    uint8_t is_charging;
};

struct ButtonPayload {
    uint8_t button_id;
    uint8_t event_type; // 0=Released, 1=Pressed, 2=LongPress
};

struct LedPayload {
    uint8_t red;
    uint8_t green;
    uint8_t blue;
    uint8_t mode; // 0=Solid, 1=Blink
};

struct BuzzerPayload {
    uint8_t pattern;
};

struct DiagnosticPayload {
    uint8_t error_code;
    char message[15];
};

#pragma pack(pop)

class PacketBuilder {
public:
    static size_t build(Command cmd, const uint8_t* payload, uint8_t payload_length, uint8_t* out_buffer, size_t max_out);
};

class PacketParser {
public:
    PacketParser();
    
    // Feed bytes into the parser
    void feed(const uint8_t* data, size_t length);
    
    // Returns true if a full valid packet is ready to be read
    bool hasPacket() const;
    
    // Gets the current valid packet
    Command getCommand() const;
    const uint8_t* getPayload() const;
    uint8_t getPayloadLength() const;
    
    // Consume the current packet so the next can be parsed
    void consumePacket();

private:
    enum class State {
        WAIT_MAGIC_1,
        WAIT_MAGIC_2,
        WAIT_CMD,
        WAIT_LEN,
        WAIT_PAYLOAD,
        WAIT_CRC_1,
        WAIT_CRC_2,
        PACKET_READY
    };

    State m_state;
    Command m_current_cmd;
    uint8_t m_expected_len;
    uint8_t m_payload_buffer[255];
    uint8_t m_payload_idx;
    uint16_t m_received_crc;
    
    void reset();
};

} // namespace Protocol
} // namespace SmartCart

#endif // PROTOCOLS_PACKET_HPP