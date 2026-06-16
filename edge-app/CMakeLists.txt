cmake_minimum_required(VERSION 3.16)
project(SmartCartEdgeApp VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_INCLUDE_CURRENT_DIR ON)

set(CMAKE_AUTOUIC ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)

find_package(Qt6 REQUIRED COMPONENTS Core Gui Qml Quick SerialPort)

add_subdirectory(../protocols protocols)

include(FetchContent)
FetchContent_Declare(
  paho_mqtt_c
  GIT_REPOSITORY https://github.com/eclipse/paho.mqtt.c.git
  GIT_TAG v1.3.13
)
set(PAHO_WITH_SSL OFF CACHE BOOL "" FORCE)
set(PAHO_BUILD_SAMPLES OFF CACHE BOOL "" FORCE)
set(PAHO_BUILD_DOCUMENTATION OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(paho_mqtt_c)

FetchContent_Declare(
  paho_mqtt_cpp
  GIT_REPOSITORY https://github.com/eclipse/paho.mqtt.cpp.git
  GIT_TAG v1.3.2
)
set(PAHO_WITH_SSL OFF CACHE BOOL "" FORCE)
set(PAHO_BUILD_SAMPLES OFF CACHE BOOL "" FORCE)
set(PAHO_BUILD_DOCUMENTATION OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(paho_mqtt_cpp)

qt_add_executable(edge_app
    src/main.cpp
    src/core/AppContext.h
    src/core/AppContext.cpp
    src/core/ConfigManager.h
    src/core/ConfigManager.cpp
    src/models/CustomerProfile.h
    src/models/CustomerProfile.cpp
    src/models/ShoppingSession.h
    src/models/ShoppingSession.cpp
    src/controllers/StateManager.cpp
    src/controllers/StateManager.h
    src/services/TelemetryService.h
    src/services/TelemetryService.cpp
    src/models/CartStatusModel.h
    src/models/CartStatusModel.cpp
    src/services/MqttService.h
    src/services/MqttService.cpp
    src/services/ProvisioningService.h
    src/services/ProvisioningService.cpp
    src/services/ShoppingService.h
    src/services/ShoppingService.cpp
    src/services/CheckoutService.h
    src/services/SerialService.h
    src/services/SerialService.cpp
    src/drivers/MockSensorProvider.h
    src/drivers/MockSensorProvider.cpp
)

target_link_libraries(edge_app PRIVATE
    Qt6::Core
    Qt6::Gui
    Qt6::Qml
    Qt6::Quick
    Qt6::SerialPort
    protocols
    paho-mqttpp3
)

qt_add_qml_module(edge_app
    URI SmartCart
    VERSION 1.0
    QML_FILES
        qml/Main.qml
        qml/SplashScreen.qml
        qml/ProvisioningView.qml
        qml/WaitingApprovalView.qml
        qml/CustomerOnboardingView.qml
        qml/ShoppingView.qml
        qml/CheckoutScreen.qml
        qml/PaymentCompleteScreen.qml
)

option(BUILD_TESTING "Build tests" OFF)

if(BUILD_TESTING)
    enable_testing()
    include(FetchContent)
    FetchContent_Declare(
      googletest
      URL https://github.com/google/googletest/archive/03597a01ee50ed33e9dfd640b249b4be3799d395.zip
    )
    set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
    FetchContent_MakeAvailable(googletest)

    add_executable(EdgeAppTests
        tests/test_state_machine.cpp
        src/controllers/StateManager.cpp
    )
    find_package(Qt6 REQUIRED COMPONENTS Test)
    target_link_libraries(EdgeAppTests PRIVATE 
        Qt6::Core
        Qt6::Test
        GTest::gtest_main
    )
    
    include(GoogleTest)
    gtest_discover_tests(EdgeAppTests)
endif()