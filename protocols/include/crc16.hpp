#ifndef PROTOCOLS_CRC16_HPP
#define PROTOCOLS_CRC16_HPP

#include <stdint.h>
#include <stddef.h>

namespace SmartCart {
namespace Protocol {

class CRC16 {
public:
    // Calculates CRC16 CCITT-FALSE
    // Polynomial: 0x1021, Initial: 0xFFFF
    static uint16_t calculate(const uint8_t* data, size_t length);
};

} // namespace Protocol
} // namespace SmartCart

#endif // PROTOCOLS_CRC16_HPP