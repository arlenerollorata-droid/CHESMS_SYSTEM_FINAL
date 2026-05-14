import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/announcement.dart';
import '../models/event.dart';
import '../models/user.dart';

class ApiService {
  static String get baseUrl => ApiConfig.baseUrl;

  String _normalizeName(String value) {
    return value
        .toLowerCase()
        .trim()
        .replaceAll(RegExp(r'\s+'), ' ');
  }

  String _normalizePhone(String value) {
    return value.replaceAll(RegExp(r'\D'), '');
  }

  bool _hasMeaningfulHealthData(Map<String, dynamic> patient) {
    final prenatal = patient['prenatalData'];
    final tb = patient['tbDotsData'];

    bool hasPrenatal = false;
    if (prenatal is Map) {
      hasPrenatal =
          prenatal['dueDate'] != null ||
          prenatal['gestationalWeek'] != null ||
          prenatal['progressPercent'] != null ||
          (prenatal['nextVisitDate']?.toString().trim().isNotEmpty ?? false);
    }

    bool hasTbDots = false;
    if (tb is Map) {
      hasTbDots =
          tb['treatmentStartDate'] != null ||
          tb['adherencePercent'] != null ||
          (tb['nextVisitDate']?.toString().trim().isNotEmpty ?? false);
    }

    return hasPrenatal || hasTbDots;
  }

  int _matchScore({
    required Map<String, dynamic> patient,
    required String fullName,
    required String normalizedContact,
  }) {
    final patientName = _normalizeName((patient['name'] ?? '').toString());
    final patientContact = _normalizePhone((patient['contact'] ?? '').toString());
    final category = (patient['category'] ?? '').toString().toLowerCase().trim();

    int score = 0;

    if (fullName.isNotEmpty && patientName == fullName) score += 80;
    if (normalizedContact.isNotEmpty && patientContact == normalizedContact) score += 85;

    if (fullName.isNotEmpty && patientName.isNotEmpty) {
      if (patientName.contains(fullName) || fullName.contains(patientName)) {
        score += 60;
      }

      final fullTokens = fullName.split(' ').where((t) => t.isNotEmpty).toList();
      final patientTokens = patientName.split(' ').where((t) => t.isNotEmpty).toList();
      if (fullTokens.isNotEmpty && patientTokens.isNotEmpty) {
        final firstToken = fullTokens.first;
        final lastToken = fullTokens.last;
        if (patientTokens.contains(firstToken) && patientTokens.contains(lastToken)) {
          score += 40;
        }
      }
    }

    if (patientContact.isNotEmpty && normalizedContact.isNotEmpty) {
      if (patientContact.endsWith(normalizedContact) || normalizedContact.endsWith(patientContact)) {
        score += 25;
      }
    }

    if (_hasMeaningfulHealthData(patient)) score += 80;
    if (category == 'prenatal' || category == 'tb dots' || category == 'tb-dots' || category == 'tbdots') {
      score += 10;
    }

    return score;
  }

  List<Map<String, dynamic>> _extractUpcomingSchedules(List<dynamic> decoded) {
    final now = DateTime.now();
    final todayStart = DateTime(now.year, now.month, now.day);

    final upcoming = decoded
        .whereType<Map<String, dynamic>>()
        .where((item) {
          final rawDate = item['date']?.toString();
          if (rawDate == null || rawDate.isEmpty) return false;

          final parsedDate = DateTime.tryParse(rawDate);
          if (parsedDate == null) return false;

          final status = (item['status'] ?? '').toString().toLowerCase();
          final isExcluded =
              status == 'cancelled' || status == 'completed' || status == 'no-show';

          return !isExcluded && !parsedDate.isBefore(todayStart);
        })
        .toList()
      ..sort((a, b) {
        final aDate = DateTime.tryParse(a['date']?.toString() ?? '') ?? DateTime(2100);
        final bDate = DateTime.tryParse(b['date']?.toString() ?? '') ?? DateTime(2100);
        return aDate.compareTo(bDate);
      });

    return upcoming.map((e) => Map<String, dynamic>.from(e)).toList();
  }

  Future<List<Announcement>> fetchAnnouncements() async {
    final uri = Uri.parse('$baseUrl/announcements');
    final response = await http.get(uri);

    if (response.statusCode != 200) {
      throw Exception('Failed to load announcements');
    }

    final jsonList = jsonDecode(response.body) as List<dynamic>;
    return jsonList.map((json) => Announcement.fromJson(json as Map<String, dynamic>)).toList();
  }

  Future<List<EventItem>> fetchEvents() async {
    final uri = Uri.parse('$baseUrl/events');
    final response = await http.get(uri);

    if (response.statusCode != 200) {
      throw Exception('Failed to load events');
    }

    final jsonList = jsonDecode(response.body) as List<dynamic>;
    return jsonList.map((json) => EventItem.fromJson(json as Map<String, dynamic>)).toList();
  }

  Future<User> register(String email, String password, String name) async {
    final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    final firstName = parts.isNotEmpty ? parts.first : name.trim();
    final lastName = parts.length > 1 ? parts.sublist(1).join(' ') : 'User';

    final response = await http.post(
      Uri.parse('$baseUrl/mobile-auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'password': password,
        'birthdate': '2000-01-01',
        'civilStatus': 'Single',
        'purok': 'Purok 1',
        'barangay': 'Sample Barangay',
        'municipality': 'Talavera',
        'province': 'Nueva Ecija',
      }),
    );
    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      return User.fromJson(data['user']);
    } else {
      throw Exception('Registration failed: ${jsonDecode(response.body)['message']}');
    }
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/mobile-auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return {'user': User.fromJson(data['user']), 'token': data['token']};
    } else {
      throw Exception('Login failed: ${jsonDecode(response.body)['message']}');
    }
  }

  Future<Map<String, dynamic>?> fetchNextAppointmentForUser(Map<String, dynamic>? userData) async {
    if (userData == null) return null;

    final userId = (userData['_id'] ?? userData['id'])?.toString();
    if (userId == null || userId.isEmpty) return null;

    try {
      final uri = Uri.parse('$baseUrl/schedules/patient/$userId');
      final response = await http.get(uri);

      if (response.statusCode != 200) {
        return null;
      }

      final decoded = jsonDecode(response.body);
      if (decoded is! List) return null;

      var upcoming = _extractUpcomingSchedules(decoded);

      // Fallback for schedules that are stored with patientName but not linked
      // to the resident id in the patient field.
      if (upcoming.isEmpty) {
        final allSchedulesResponse = await http.get(Uri.parse('$baseUrl/schedules'));
        if (allSchedulesResponse.statusCode == 200) {
          final allDecoded = jsonDecode(allSchedulesResponse.body);
          if (allDecoded is List) {
            final fullName = (userData['name'] ?? '').toString().trim().toLowerCase();
            final filteredByName = allDecoded.whereType<Map<String, dynamic>>().where((item) {
              final patientName = (item['patientName'] ?? '').toString().trim().toLowerCase();
              if (patientName.isEmpty || fullName.isEmpty) return false;
              return patientName == fullName;
            }).toList();
            upcoming = _extractUpcomingSchedules(filteredByName);
          }
        }
      }

      if (upcoming.isEmpty) return null;

      final next = Map<String, dynamic>.from(upcoming.first);
      // Keep compatibility with current UI formatter.
      next['timeSlot'] = next['timeSlot'] ?? next['time'];
      return next;
    } catch (_) {
      return null;
    }
  }

  Future<Map<String, dynamic>?> fetchPatientProfileForUser(Map<String, dynamic>? userData) async {
    if (userData == null) return null;

    try {
      final response = await http.get(Uri.parse('$baseUrl/patients'));
      if (response.statusCode != 200) return null;

      final decoded = jsonDecode(response.body);
      if (decoded is! List) return null;

        final firstName = (userData['firstName'] ?? '').toString().trim();
        final middleName = (userData['middleName'] ?? '').toString().trim();
        final lastName = (userData['lastName'] ?? '').toString().trim();

        final nameFromParts = [firstName, middleName, lastName]
          .where((part) => part.isNotEmpty)
          .join(' ');

        final fullName = _normalizeName(
        (userData['name'] ?? '').toString().trim().isNotEmpty
          ? (userData['name'] ?? '').toString()
          : nameFromParts,
        );

        final contact = (userData['contactNumber'] ?? userData['phone'] ?? '').toString().trim();
        final normalizedContact = _normalizePhone(contact);

      final candidates = decoded.whereType<Map<String, dynamic>>().toList();
      if (candidates.isEmpty) return null;

      Map<String, dynamic>? best;
      int bestScore = -1;
      for (final patient in candidates) {
        final score = _matchScore(
          patient: patient,
          fullName: fullName,
          normalizedContact: normalizedContact,
        );

        if (score > bestScore) {
          bestScore = score;
          best = patient;
        }
      }

      // Avoid returning unrelated records if there is no meaningful match.
      if (bestScore < 40) return null;
      return best;
    } catch (_) {
      return null;
    }
  }

  /// Fetch category-specific medical history and clinical profile for a patient
  Future<Map<String, dynamic>?> fetchCategoryMedicalHistory(String patientId) async {
    try {
      final uri = Uri.parse('$baseUrl/records/category-history/profile?patientId=$patientId');
      final response = await http.get(uri);

      if (response.statusCode != 200) {
        return null;
      }

      final data = jsonDecode(response.body);
      return data as Map<String, dynamic>;
    } catch (e) {
      print('Error fetching category medical history: $e');
      return null;
    }
  }

  /// Fetch complete patient profile with all category-specific data
  Future<Map<String, dynamic>?> fetchPatientProfile(String patientId) async {
    try {
      final uri = Uri.parse('$baseUrl/patients/profile/by-id?patientId=$patientId');
      final response = await http.get(uri);

      if (response.statusCode != 200) {
        return null;
      }

      final data = jsonDecode(response.body);
      return data['patient'] as Map<String, dynamic>? ?? data as Map<String, dynamic>;
    } catch (e) {
      print('Error fetching patient profile: $e');
      return null;
    }
  }
}
