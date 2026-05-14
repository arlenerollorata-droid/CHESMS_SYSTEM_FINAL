import 'dart:convert';
import 'package:http/http.dart' as http;
import 'dart:io';
import '../config/api_config.dart';

class AuthService {
  static String get baseUrl => ApiConfig.baseUrl;

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/mobile-auth/login'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      final responseData = jsonDecode(response.body);
      return responseData;
    } else if (response.statusCode == 400) {
      final responseData = jsonDecode(response.body);
      throw Exception(responseData['message'] ?? 'Invalid credentials');
    } else {
      throw Exception('Server error: ${response.statusCode}');
    }
  }

  Future<Map<String, dynamic>> register(
    String firstName,
    String? middleName,
    String lastName,
    String email,
    String password,
    String? contactNumber,
    String birthdate,
    String? gender,
    String civilStatus,
    String purok,
    String barangay,
    String municipality,
    String province,
    String? streetAddress,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/mobile-auth/register'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, dynamic>{
        'firstName': firstName,
        'middleName': middleName,
        'lastName': lastName,
        'email': email,
        'password': password,
        'contactNumber': contactNumber,
        'birthdate': birthdate,
        'gender': gender,
        'civilStatus': civilStatus,
        'purok': purok,
        'barangay': barangay,
        'municipality': municipality,
        'province': province,
        'streetAddress': streetAddress,
      }),
    );

    if (response.statusCode == 201) {
      final responseData = jsonDecode(response.body);
      return responseData;
    } else if (response.statusCode == 400) {
      final responseData = jsonDecode(response.body);
      throw Exception(responseData['message'] ?? 'Registration failed');
    } else {
      throw Exception('Server error: ${response.statusCode}');
    }
  }

  Future<Map<String, dynamic>> updateProfileImage(File imageFile, String token, String userId) async {
    final response = await http.put(
      Uri.parse('$baseUrl/residents/$userId'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(<String, dynamic>{
        'profileImage': imageFile.path,
      }),
    );

    if (response.statusCode == 200) {
      final responseData = jsonDecode(response.body);
      return responseData;
    } else if (response.statusCode == 400) {
      final responseData = jsonDecode(response.body);
      throw Exception(responseData['message'] ?? 'Upload failed');
    } else {
      throw Exception('Server error: ${response.statusCode}');
    }
  }

  Future<Map<String, dynamic>> updateUser(String userId, Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$baseUrl/residents/$userId'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to update user: ${response.statusCode}');
    }
  }
}

