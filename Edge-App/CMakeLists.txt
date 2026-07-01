cmake_minimum_required(VERSION 3.16)
project(SmartCartEdgeApp VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_INCLUDE_CURRENT_DIR ON)

set(CMAKE_AUTOUIC ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)

# Yahan PrintSupport add karo
find_package(Qt6 REQUIRED COMPONENTS Core Gui Qml Quick SerialPort Multimedia PrintSupport)

# Explicit source relative path for protocols
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../protocols protocols)

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
    src/models/Product.h
    src/models/Product.cpp
    src/models/ProductCatalog.h
    src/models/ProductCatalog.cpp
    src/models/CartItem.h
    src/models/CartItem.cpp
    src/models/CartModel.h
    src/models/CartModel.cpp
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
    src/drivers/Stm32Simulator.h
    src/drivers/Stm32Simulator.cpp
    src/controllers/DebugController.h
    src/controllers/DebugController.cpp
    src/controllers/SettingsController.h
    src/controllers/SettingsController.cpp
    src/drivers/simulated/SimulatedWeightSensor.cpp
    src/drivers/simulated/SimulatedBatteryMonitor.cpp
    src/drivers/simulated/SimulatedButtonInput.cpp
    src/drivers/simulated/MockBarcodeScanner.cpp
    src/drivers/pc/PcWebcamCamera.cpp
    src/drivers/pc/QtAudioPlayer.cpp
    src/drivers/stm32/STM32WeightSensor.cpp
    src/drivers/stm32/STM32BatteryMonitor.cpp
    src/drivers/stm32/STM32ButtonInput.cpp
    src/di/HardwareProviderFactory.cpp
    src/drivers/interfaces/interfaces.cpp
    src/drivers/jetson/JetsonCamera.cpp
    src/drivers/usb/UsbBarcodeScanner.cpp
    src/drivers/interfaces/IBatteryMonitor.h
    src/drivers/interfaces/IWeightSensor.h
    src/drivers/interfaces/IBarcodeScanner.h
    src/drivers/interfaces/IButtonInput.h
    src/drivers/interfaces/ICamera.h
    src/drivers/interfaces/IAudioPlayer.h
)



target_link_libraries(edge_app PRIVATE
    Qt6::Core
    Qt6::Gui
    Qt6::Qml
    Qt6::Quick
    Qt6::SerialPort
    Qt6::Multimedia
    Qt6::PrintSupport
    protocols
)

if(WIN32)
    target_link_libraries(edge_app PRIVATE ws2_32)
endif()

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
        qml/DebugPanel.qml
        qml/BootSequenceView.qml
        qml/SettingsScreen.qml
        qml/theme/Theme.qml
)

set_source_files_properties(qml/theme/qmldir PROPERTIES QT_RESOURCE_ALIAS "qmldir")
qt_add_resources(edge_app "theme_resources"
    PREFIX "/SmartCart/qml/theme"
    FILES qml/theme/qmldir
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

        tests/test_simulated_button_input.cpp
        src/controllers/StateManager.cpp
        src/drivers/simulated/SimulatedButtonInput.cpp
        src/drivers/interfaces/interfaces.cpp
        src/drivers/interfaces/IButtonInput.h
        src/drivers/interfaces/IBatteryMonitor.h
        src/drivers/interfaces/IWeightSensor.h
        src/drivers/interfaces/IBarcodeScanner.h
        src/drivers/interfaces/ICamera.h
        src/drivers/interfaces/IAudioPlayer.h

        tests/test_shopping_session.cpp
        src/controllers/StateManager.cpp
        src/models/ShoppingSession.cpp
        src/models/CustomerProfile.cpp

    )

# Explicitly mapping local paths for compilation stability
    target_include_directories(edge_app PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/../protocols/include
)
    find_package(Qt6 REQUIRED COMPONENTS Test)

    target_link_libraries(EdgeAppTests PRIVATE
        Qt6::Core
        Qt6::Test
        GTest::gtest_main
        Qt6::Multimedia
    )
    include(GoogleTest)
    gtest_discover_tests(EdgeAppTests)
endif()