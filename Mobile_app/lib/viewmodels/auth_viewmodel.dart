import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'dart:io';
import '../services/auth_service.dart';

class AuthViewModel extends ChangeNotifier {
  final AuthService _authService = AuthService();

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  Map<String, dynamic>? _userData;
  Map<String, dynamic>? get userData => _userData;

  String? _token;
  String? get token => _token;

  AuthViewModel() {
    _loadFromPrefs();
  }

  Map<String, dynamic> _normalizeUserData(Map<String, dynamic> user) {
    final normalized = Map<String, dynamic>.from(user);
    final resolvedId = normalized['_id'] ?? normalized['id'];
    if (resolvedId != null) {
      normalized['_id'] = resolvedId.toString();
      normalized['id'] = resolvedId.toString();
    }
    return normalized;
  }

  Future<void> _loadFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    final userJson = prefs.getString('user');
    if (userJson != null) {
      _userData = _normalizeUserData(Map<String, dynamic>.from(jsonDecode(userJson)));
    }
    notifyListeners();
  }

  Future<void> _saveToPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    if (_token != null) {
      await prefs.setString('token', _token!);
    }
    if (_userData != null) {
      await prefs.setString('user', jsonEncode(_userData));
    }
  }

  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _clearError();
    try {
      final responseData = await _authService.login(email, password);
      _token = responseData['token'];
      _userData = _normalizeUserData(Map<String, dynamic>.from(responseData['user']));
      await _saveToPrefs();
      _setLoading(false);
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _setLoading(false);
      return false;
    }
  }

  Future<bool> register(
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
    _setLoading(true);
    _clearError();
    try {
      final responseData = await _authService.register(
        firstName,
        middleName,
        lastName,
        email,
        password,
        contactNumber,
        birthdate,
        gender,
        civilStatus,
        purok,
        barangay,
        municipality,
        province,
        streetAddress,
      );
      _token = responseData['token'];
      _userData = _normalizeUserData(Map<String, dynamic>.from(responseData['user']));
      await _saveToPrefs();
      _setLoading(false);
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _setLoading(false);
      return false;
    }
  }

  Future<void> logout() async {
    // Clear user data and token
    _token = null;
    _userData = null;
    _clearError();
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    notifyListeners();
  }

  Future<bool> updateProfileImage(File imageFile) async {
    _setLoading(true);
    _clearError();
    try {
      final userId = (_userData?['_id'] ?? _userData?['id'])?.toString();
      if (_token == null || userId == null || userId.isEmpty) {
        throw Exception('Missing user session. Please login again.');
      }

      final responseData = await _authService.updateProfileImage(
        imageFile,
        _token!,
        userId,
      );
      // Update user data with new profile image URL
      if (_userData != null) {
        _userData!['profileImage'] = responseData['profileImage'] ?? _userData!['profileImage'];
        await _saveToPrefs();
      }
      _setLoading(false);
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _setLoading(false);
      return false;
    }
  }

  Future<bool> updateProfile(Map<String, dynamic> newData) async {
    _setLoading(true);
    _clearError();
    try {
      final userId = (_userData?['_id'] ?? _userData?['id'])?.toString();
      if (userId == null || userId.isEmpty) {
        throw Exception('Missing user session. Please login again.');
      }

      final responseData = await _authService.updateUser(userId, newData);
      
      // Update user data locally
      if (_userData != null) {
        _userData!.addAll(responseData);
        await _saveToPrefs();
      }
      
      _setLoading(false);
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _setLoading(false);
      return false;
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
