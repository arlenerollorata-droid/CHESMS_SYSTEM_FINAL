import 'dart:io';

class ApiConfig {
  // SETUP FOR REAL DEVICE:
  // 1. Find your PC's IP: Windows: ipconfig | Mac/Linux: ifconfig
  // 2. Look for IPv4 Address (e.g., 192.168.1.100)
  // 3. Option A - Update IP below and run: flutter run
  // 4. Option B - Run: flutter run --dart-define=API_BASE_URL=http://YOUR_PC_IP:5000
  static const String _apiBaseUrlFromEnv = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: '',
  );

  // Real device IP: 192.168.1.3
  static const String _realDeviceIp = '192.168.1.3';

  static String get baseUrl {
    if (_apiBaseUrlFromEnv.trim().isNotEmpty) {
      return _normalize(_apiBaseUrlFromEnv.trim());
    }

    if (Platform.isAndroid) {
      return 'http://$_realDeviceIp:5000/api';
    }

    return 'http://$_realDeviceIp:5000/api';
  }

  static String _normalize(String rawBase) {
    final withoutTrailingSlash = rawBase.endsWith('/')
        ? rawBase.substring(0, rawBase.length - 1)
        : rawBase;

    if (withoutTrailingSlash.endsWith('/api')) {
      return withoutTrailingSlash;
    }

    return '$withoutTrailingSlash/api';
  }
}
