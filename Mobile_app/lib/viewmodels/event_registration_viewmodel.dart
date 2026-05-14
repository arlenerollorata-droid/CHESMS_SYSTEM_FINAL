import 'package:flutter/material.dart';
import '../services/api_service.dart';

class EventRegistrationViewModel extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  String _fullName = '';
  String _age = '';
  String _mobileNumber = '';
  String _medicalCondition = 'None';
  String _allergies = '';
  String _contactPerson = '';
  String _contactNumber = '';
  bool _isAgreedToTerms = false;
  bool _isLoading = false;

  // Getters
  String get fullName => _fullName;
  String get age => _age;
  String get mobileNumber => _mobileNumber;
  String get medicalCondition => _medicalCondition;
  String get allergies => _allergies;
  String get contactPerson => _contactPerson;
  String get contactNumber => _contactNumber;
  bool get isAgreedToTerms => _isAgreedToTerms;
  bool get isLoading => _isLoading;

  // Setters
  void setFullName(String value) { _fullName = value; notifyListeners(); }
  void setAge(String value) { _age = value; notifyListeners(); }
  void setMobileNumber(String value) { _mobileNumber = value; notifyListeners(); }
  void setMedicalCondition(String value) { _medicalCondition = value; notifyListeners(); }
  void setAllergies(String value) { _allergies = value; notifyListeners(); }
  void setContactPerson(String value) { _contactPerson = value; notifyListeners(); }
  void setContactNumber(String value) { _contactNumber = value; notifyListeners(); }
  void setAgreedToTerms(bool value) { _isAgreedToTerms = value; notifyListeners(); }

  bool canSubmit() {
    return _fullName.isNotEmpty && 
           _age.isNotEmpty && 
           _mobileNumber.isNotEmpty && 
           _contactPerson.isNotEmpty && 
           _contactNumber.isNotEmpty && 
           _isAgreedToTerms;
  }

  Future<bool> submitRegistration(String eventId) async {
    if (!canSubmit()) return false;
    
    _isLoading = true;
    notifyListeners();

    try {
      final registrationData = {
        'fullName': _fullName,
        'age': int.tryParse(_age) ?? 0,
        'mobileNumber': _mobileNumber,
        'medicalCondition': _medicalCondition,
        'allergies': _allergies,
        'contactPerson': _contactPerson,
        'contactNumber': _contactNumber,
      };

      final success = await _apiService.registerForEvent(eventId, registrationData);
      
      _isLoading = false;
      notifyListeners();
      return success;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}
