#include "CustomerProfile.h"

CustomerProfile::CustomerProfile(const QString& id, const QString& emailOrPhone)
    : m_id(id), m_identifier(emailOrPhone)
{
}