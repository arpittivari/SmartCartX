#include "packet.hpp"
#include "crc16.hpp"
#include <string.h>

namespace SmartCart {
namespace Protocol {

size_t PacketBuilder::build(Command cmd, const uint8_t* payload, uint8_t payload_length, uint8_t* out_buffer, size_t max_out) {
    if (max_out < sizeof(PacketHeader) + payload_length + 2) {
        return 0; // Buffer too small
    }

    PacketHeader header;
    header.magic = MAGIC_HEADER; // Note: Little Endian architecture assumed
    header.command = cmd;
    header.payload_length = payload_length;

    size_t idx = 0;
    memcpy(&out_buffer[idx], &header, sizeof(PacketHeader));
    idx += sizeof(PacketHeader);

    if (payload_length > 0 && payload != nullptr) {
        memcpy(&out_buffer[idx], payload, payload_length);
        idx += payload_length;
    }

    // CRC is calculated over Command, Length, and Payload
    // skip the magic header bytes for CRC calc
    uint16_t crc = CRC16::calculate(&out_buffer[2], 2 + payload_length);
    
    // Little endian CRC
    out_buffer[idx++] = crc & 0xFF;
    out_buffer[idx++] = (crc >> 8) & 0xFF;

    return idx;
}

PacketParser::PacketParser() {
    reset();
}

void PacketParser::reset() {
    m_state = State::WAIT_MAGIC_1;
    m_expected_len = 0;
    m_payload_idx = 0;
    m_received_crc = 0;
}

void PacketParser::feed(const uint8_t* data, size_t length) {
    for (size_t i = 0; i < length; ++i) {
        if (m_state == State::PACKET_READY) {
            // Buffer is full of a valid packet, ignore new data until consumed
            return;
        }

        uint8_t byte = data[i];

        switch (m_state) {
            case State::WAIT_MAGIC_1:
                if (byte == (MAGIC_HEADER & 0xFF)) {
                    m_state = State::WAIT_MAGIC_2;
                }
                break;
            case State::WAIT_MAGIC_2:
                if (byte == ((MAGIC_HEADER >> 8) & 0xFF)) {
                    m_state = State::WAIT_CMD;
                } else {
                    reset();
                    // Re-evaluate this byte as a potential first magic byte
                    if (byte == (MAGIC_HEADER & 0xFF)) m_state = State::WAIT_MAGIC_2;
                }
                break;
            case State::WAIT_CMD:
                m_current_cmd = static_cast<Command>(byte);
                m_state = State::WAIT_LEN;
                break;
            case State::WAIT_LEN:
                m_expected_len = byte;
                m_payload_idx = 0;
                if (m_expected_len > 0) {
                    m_state = State::WAIT_PAYLOAD;
                } else {
                    m_state = State::WAIT_CRC_1;
                }
                break;
            case State::WAIT_PAYLOAD:
                m_payload_buffer[m_payload_idx++] = byte;
                if (m_payload_idx >= m_expected_len) {
                    m_state = State::WAIT_CRC_1;
                }
                break;
            case State::WAIT_CRC_1:
                m_received_crc = byte;
                m_state = State::WAIT_CRC_2;
                break;
            case State::WAIT_CRC_2: {
                m_received_crc |= (byte << 8);
                
                // Validate CRC
                uint8_t crc_buf[257];
                crc_buf[0] = static_cast<uint8_t>(m_current_cmd);
                crc_buf[1] = m_expected_len;
                if (m_expected_len > 0) {
                    memcpy(&crc_buf[2], m_payload_buffer, m_expected_len);
                }
                
                uint16_t calculated_crc = CRC16::calculate(crc_buf, 2 + m_expected_len);
                if (calculated_crc == m_received_crc) {
                    m_state = State::PACKET_READY;
                } else {
                    // CRC Mismatch, drop packet
                    reset();
                }
                break;
            }
            case State::PACKET_READY:
                break;
        }
    }
}

bool PacketParser::hasPacket() const {
    return m_state == State::PACKET_READY;
}

Command PacketParser::getCommand() const {
    return m_current_cmd;
}

const uint8_t* PacketParser::getPayload() const {
    return m_payload_buffer;
}

uint8_t PacketParser::getPayloadLength() const {
    return m_expected_len;
}

void PacketParser::consumePacket() {
    reset();
}

} // namespace Protocol
} // namespace SmartCart