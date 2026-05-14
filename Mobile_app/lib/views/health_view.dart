import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../utils/theme.dart';
import '../viewmodels/auth_viewmodel.dart';

class HealthView extends StatefulWidget {
  const HealthView({Key? key}) : super(key: key);

  @override
  State<HealthView> createState() => _HealthViewState();
}

class _HealthViewState extends State<HealthView> {
  final ApiService _apiService = ApiService();
  Map<String, dynamic>? _patientProfile;
  bool _isLoading = true;

  Map<String, dynamic> _asMap(dynamic value) {
    if (value is Map<String, dynamic>) return value;
    if (value is Map) {
      return value.map((key, val) => MapEntry(key.toString(), val));
    }
    return <String, dynamic>{};
  }

  List<Map<String, dynamic>> _asListOfMap(dynamic value) {
    if (value is! List) return <Map<String, dynamic>>[];
    return value.map(_asMap).where((item) => item.isNotEmpty).toList();
  }

  /// Calculate weeks remaining from today to due date
  int _calculateWeeksRemaining(dynamic dueDateValue) {
    if (dueDateValue == null) return 0;
    
    final dateStr = dueDateValue is String
        ? dueDateValue
        : dueDateValue is DateTime
            ? dueDateValue.toIso8601String()
            : dueDateValue.toString();
    
    if (dateStr.isEmpty || dateStr == 'null') return 0;
    
    try {
      final dueDate = DateTime.tryParse(dateStr);
      if (dueDate == null) return 0;
      final today = DateTime.now();
      final difference = dueDate.difference(today);
      final weeksRemaining = (difference.inDays / 7).ceil();
      return weeksRemaining.clamp(0, 40); // Clamp between 0 and 40 weeks
    } catch (_) {
      return 0;
    }
  }

  @override
  void initState() {
    super.initState();
    _loadHealthProfile();
  }

  Future<void> _loadHealthProfile() async {
    Map<String, dynamic>? profile;
    try {
      final authViewModel = Provider.of<AuthViewModel>(context, listen: false);
      profile = await _apiService.fetchPatientProfileForUser(authViewModel.userData);
    } catch (_) {
      profile = null;
    }

    if (!mounted) return;
    setState(() {
      _patientProfile = profile;
      _isLoading = false;
    });
  }

  Future<void> _refreshHealth() async {
    await _loadHealthProfile();
  }

  bool get _isTbDots {
    final category = (_patientProfile?['category'] ?? '').toString().toLowerCase().trim();
    return category == 'tb dots' || category == 'tb-dots' || category == 'tbdots';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: RefreshIndicator(
        onRefresh: _refreshHealth,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: _isLoading
                ? const Padding(
                    padding: EdgeInsets.only(top: 100),
                    child: Center(child: CircularProgressIndicator()),
                  )
                : (_isTbDots ? _buildTbDotsContent(context) : _buildPrenatalContent(context)),
          ),
        ),
      ),
    );
  }

  Widget _buildPrenatalContent(BuildContext context) {
    final prenatal = _asMap(_patientProfile?['prenatalData']);
    final dueDateRaw = prenatal['dueDate'];
    final dueDate = _formatDate(dueDateRaw) ?? 'TBA';

    // Calculate weeks remaining based on due date
    final weeksRemaining = _calculateWeeksRemaining(dueDateRaw);

    int? gestationalWeek;
    final weekRaw = prenatal['gestationalWeek'];
    if (weekRaw is num) {
      gestationalWeek = weekRaw.toInt().clamp(0, 40);
    } else if (weekRaw is String) {
      final parsed = int.tryParse(weekRaw);
      if (parsed != null) {
        gestationalWeek = parsed.clamp(0, 40);
      }
    }
    if (gestationalWeek == null && weeksRemaining > 0) {
      gestationalWeek = (40 - weeksRemaining).clamp(0, 40);
    }

    final week = gestationalWeek?.toString() ?? '--';

    String trimester;
    final trimesterRaw = (prenatal['trimester'] ?? '').toString().trim();
    if (trimesterRaw.isNotEmpty) {
      trimester = trimesterRaw;
    } else if (gestationalWeek != null) {
      if (gestationalWeek <= 13) {
        trimester = '1st Trimester';
      } else if (gestationalWeek <= 27) {
        trimester = '2nd Trimester';
      } else {
        trimester = '3rd Trimester';
      }
    } else {
      trimester = 'Trimester not set';
    }

    final riskLevel = (prenatal['riskLevel'] ?? 'Low Risk').toString().toUpperCase();
    final progressRaw = prenatal['progressPercent'];
    int progressPercent;
    if (progressRaw is num) {
      progressPercent = progressRaw.toInt().clamp(0, 100);
    } else if (progressRaw is String) {
      progressPercent = (int.tryParse(progressRaw) ?? 0).clamp(0, 100);
    } else if (gestationalWeek != null) {
      progressPercent = ((gestationalWeek / 40) * 100).round().clamp(0, 100);
    } else {
      progressPercent = 0;
    }

    var visitHistory = _asListOfMap(prenatal['visitHistory']);

    // If no visit history but patient has lastVisit, use that as the most recent visit
    if (visitHistory.isEmpty && _patientProfile?['lastVisit'] != null) {
      visitHistory = [
        {
          'date': _patientProfile?['lastVisit'],
          'week': week,
          'staff': 'BHW',
          'notes': 'Last visit'
        }
      ];
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildPregnancyTrackerCard(context, week, trimester, dueDate, riskLevel, progressPercent, weeksRemaining),
        const SizedBox(height: 16),
        _buildInsightCard(context, (prenatal['babyInsight'] ?? '').toString()),
        const SizedBox(height: 16),
        _buildVitalsGrid(context),
        const SizedBox(height: 24),
        _buildSectionTitle(context, 'Upcoming Visit'),
        const SizedBox(height: 16),
        _buildUpcomingVisitCard(
          context,
          title: 'Prenatal Checkup',
          date: _formatDate(prenatal['nextVisitDate']) ?? 'TBA',
          time: (prenatal['nextVisitTime'] ?? 'TBA').toString(),
          location: (prenatal['nextVisitLocation'] ?? 'Brgy. Health Center').toString(),
          accent: const Color(0xFFF59E0B),
        ),
        const SizedBox(height: 24),
        _buildSectionTitle(context, 'Visit History', actionText: 'See all visits'),
        const SizedBox(height: 16),
        if (visitHistory.isEmpty)
          _buildEmptyCard(context, 'No prenatal visit history yet')
        else
          ...visitHistory.take(4).map((visit) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _buildHistoryCard(
                  context,
                  _formatDate(visit['date']) ?? 'Unknown date',
                  '${visit['week'] ?? 'Follow-up'} • ${visit['staff'] ?? 'BHW'}',
                ),
              )),
        const SizedBox(height: 20),
        _buildDangerSignsButton(context),
      ],
    );
  }

  Widget _buildTbDotsContent(BuildContext context) {
    final tb = _asMap(_patientProfile?['tbDotsData']);
    final adherenceRaw = tb['adherencePercent'];
    int adherence;
    if (adherenceRaw is num) {
      adherence = adherenceRaw.toInt().clamp(0, 100);
    } else if (adherenceRaw is String) {
      adherence = (int.tryParse(adherenceRaw) ?? 0).clamp(0, 100);
    } else {
      adherence = 0;
    }
    final treatmentPhase = (tb['treatmentPhase'] ?? 'Intensive').toString();
    final regimen = (tb['regimen'] ?? 'Daily').toString();

    final medicationLogs = _asListOfMap(tb['medicationLogs']);
    var visitHistory = _asListOfMap(tb['visitHistory']);

    // If no visit history but patient has lastVisit, use that as the most recent visit
    if (visitHistory.isEmpty && _patientProfile?['lastVisit'] != null) {
      visitHistory = [
        {
          'date': _patientProfile?['lastVisit'],
          'week': 'TB DOTS',
          'staff': 'BHW',
          'notes': 'Last TB DOTS visit'
        }
      ];
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildTbDotsTrackerCard(context, treatmentPhase, regimen, adherence),
        const SizedBox(height: 16),
        _buildMedicationTrackingCard(context, medicationLogs),
        const SizedBox(height: 24),
        _buildSectionTitle(context, 'Next Visit'),
        const SizedBox(height: 16),
        _buildUpcomingVisitCard(
          context,
          title: 'TB DOTS Follow-up',
          date: _formatDate(tb['nextVisitDate']) ?? 'TBA',
          time: (tb['nextVisitTime'] ?? 'TBA').toString(),
          location: (tb['nextVisitLocation'] ?? 'Brgy. Health Center').toString(),
          accent: const Color(0xFFDC2626),
        ),
        const SizedBox(height: 24),
        _buildSectionTitle(context, 'Visit History', actionText: 'See all visits'),
        const SizedBox(height: 16),
        if (visitHistory.isEmpty)
          _buildEmptyCard(context, 'No TB DOTS visit history yet')
        else
          ...visitHistory.take(4).map((visit) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _buildHistoryCard(
                  context,
                  _formatDate(visit['date']) ?? 'Unknown date',
                  '${visit['notes'] ?? 'DOTS monitoring'} • ${visit['staff'] ?? 'BHW'}',
                  iconColor: const Color(0xFFDC2626),
                ),
              )),
      ],
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title, {String? actionText}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          title,
          style: TextStyle(
            color: Theme.of(context).textTheme.bodyLarge?.color,
            fontSize: 16,
            fontWeight: FontWeight.w800,
          ),
        ),
        if (actionText != null)
          Text(
            actionText,
            style: const TextStyle(
              color: AppTheme.primaryBlue,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          )
      ],
    );
  }

  Widget _buildPregnancyTrackerCard(
    BuildContext context,
    String week,
    String trimester,
    String dueDate,
    String riskLevel,
    int progressPercent,
    int weeksRemaining,
  ) {
    final parsedWeek = int.tryParse(week);
    final monthLabel = parsedWeek != null ? 'MONTH ${(parsedWeek / 4).ceil()}' : 'MONTH --';
    final weeksToGoLabel = weeksRemaining > 0
        ? '$weeksRemaining weeks to go'
        : parsedWeek != null
            ? '${(40 - parsedWeek).clamp(0, 40)} weeks to go'
            : 'Weeks to go unavailable';

    return Container(
      decoration: BoxDecoration(
        gradient: AppTheme.primaryGradient,
        borderRadius: BorderRadius.circular(20),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Week $week', style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          Text(
            '$trimester • $weeksToGoLabel',
            style: const TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 24),
          LinearProgressIndicator(
            value: progressPercent / 100,
            minHeight: 6,
            borderRadius: BorderRadius.circular(3),
            backgroundColor: Colors.white24,
            valueColor: const AlwaysStoppedAnimation(Color(0xFFF59E0B)),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(monthLabel, style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.w800)),
              Text('$progressPercent% COMPLETED', style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.w800)),
            ],
          ),
          const SizedBox(height: 20),
          Text('ESTIMATED DUE DATE', style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          Text(dueDate, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800)),
          const SizedBox(height: 10),
          Text(riskLevel, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }

  Widget _buildTbDotsTrackerCard(BuildContext context, String phase, String regimen, int adherence) {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFFDC2626), Color(0xFF7F1D1D)]),
        borderRadius: BorderRadius.circular(20),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('TB DOTS Tracker', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w800)),
          const SizedBox(height: 6),
          Text('$phase Phase • $regimen regimen', style: const TextStyle(color: Colors.white70, fontSize: 14)),
          const SizedBox(height: 18),
          LinearProgressIndicator(
            value: adherence / 100,
            minHeight: 6,
            borderRadius: BorderRadius.circular(3),
            backgroundColor: Colors.white24,
            valueColor: const AlwaysStoppedAnimation(Color(0xFF34D399)),
          ),
          const SizedBox(height: 8),
          Text('MEDICATION ADHERENCE: $adherence%', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }

  Widget _buildInsightCard(BuildContext context, String insight) {
    final text = insight.trim().isNotEmpty
        ? insight
        : 'Your baby is now the size of an ear of corn. Continue your prenatal vitamins and hydration.';

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
      ),
      padding: const EdgeInsets.all(16),
      child: Text(
        text,
        style: TextStyle(
          color: Theme.of(context).textTheme.bodyLarge?.color,
          fontSize: 13,
          height: 1.4,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildMedicationTrackingCard(BuildContext context, List<Map<String, dynamic>> logs) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Medicine Tracking', style: TextStyle(color: Theme.of(context).textTheme.bodyLarge?.color, fontWeight: FontWeight.w800, fontSize: 14)),
          const SizedBox(height: 12),
          if (logs.isEmpty)
            Text('No medicine logs yet', style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color, fontSize: 12))
          else
            ...logs.take(4).map((log) {
              final taken = (log['taken'] ?? true) == true;
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    Icon(taken ? Icons.check_circle : Icons.cancel, color: taken ? const Color(0xFF16A34A) : const Color(0xFFDC2626), size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '${log['medicine'] ?? 'Medicine'} • ${_formatDate(log['date']) ?? 'Unknown date'}',
                        style: TextStyle(color: Theme.of(context).textTheme.bodyLarge?.color, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _buildVitalsGrid(BuildContext context) {
    return Row(
      children: [
        Expanded(child: _buildVitalBox(context, Icons.monitor_weight_outlined, 'WEIGHT', (_patientProfile?['weight'] ?? 'N/A').toString())),
        const SizedBox(width: 12),
        Expanded(child: _buildVitalBox(context, Icons.favorite_border, 'BP', (_patientProfile?['bp'] ?? 'N/A').toString())),
        const SizedBox(width: 12),
        Expanded(child: _buildVitalBox(context, Icons.water_drop_outlined, 'BLOOD SUGAR', (_patientProfile?['bloodSugar'] ?? 'N/A').toString())),
      ],
    );
  }

  Widget _buildVitalBox(BuildContext context, IconData icon, String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Icon(icon, color: AppTheme.primaryBlue, size: 24),
          const SizedBox(height: 8),
          Text(label, style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color, fontSize: 10, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(color: Theme.of(context).textTheme.bodyLarge?.color, fontSize: 14, fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }

  Widget _buildUpcomingVisitCard(
    BuildContext context, {
    required String title,
    required String date,
    required String time,
    required String location,
    required Color accent,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      child: IntrinsicHeight(
        child: Row(
          children: [
            Container(
              width: 8,
              decoration: BoxDecoration(
                color: accent,
                borderRadius: const BorderRadius.only(topLeft: Radius.circular(16), bottomLeft: Radius.circular(16)),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 20.0, horizontal: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: TextStyle(color: Theme.of(context).textTheme.bodyLarge?.color, fontSize: 14, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 6),
                    Text('$date • $time', style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color, fontSize: 11, fontWeight: FontWeight.w500)),
                    const SizedBox(height: 2),
                    Text(location, style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color, fontSize: 11, fontWeight: FontWeight.w500)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryCard(BuildContext context, String dateStr, String subtitle, {Color iconColor = AppTheme.primaryBlue}) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: iconColor.withOpacity(0.12), shape: BoxShape.circle),
            child: Icon(Icons.medical_services, color: iconColor, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(dateStr, style: TextStyle(color: Theme.of(context).textTheme.bodyLarge?.color, fontSize: 14, fontWeight: FontWeight.w800)),
                const SizedBox(height: 4),
                Text(subtitle, style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color, fontSize: 11, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDangerSignsButton(BuildContext context) {
    return OutlinedButton(
      style: OutlinedButton.styleFrom(
        foregroundColor: const Color(0xFFDC2626),
        side: const BorderSide(color: Color(0xFFDC2626), width: 1.5),
        backgroundColor: Theme.of(context).colorScheme.surface,
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      onPressed: () {},
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: const [
          Icon(Icons.warning_amber_rounded, size: 20),
          SizedBox(width: 8),
          Text('Know the Danger Signs', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }

  Widget _buildEmptyCard(BuildContext context, String text) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Theme.of(context).colorScheme.surface, borderRadius: BorderRadius.circular(16)),
      child: Text(text, style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color, fontWeight: FontWeight.w600)),
    );
  }

  String? _formatDate(dynamic input) {
    if (input == null) return null;
    final parsed = DateTime.tryParse(input.toString());
    if (parsed == null) return null;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${months[parsed.month - 1]} ${parsed.day}, ${parsed.year}';
  }
}
