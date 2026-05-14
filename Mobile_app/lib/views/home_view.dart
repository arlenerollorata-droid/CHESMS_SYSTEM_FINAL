import 'package:flutter/material.dart';
import '../models/announcement.dart';
import '../models/event.dart';
import '../services/api_service.dart';
import '../utils/theme.dart';
import 'news_details_view.dart';
import 'package:provider/provider.dart';
import '../viewmodels/auth_viewmodel.dart';
import 'emergency_view.dart';
import 'health_records_view.dart';
import 'all_events_view.dart';
import 'event_details_view.dart';

class HomeView extends StatefulWidget {
  final VoidCallback? onNavigateToProfileTab;
  final VoidCallback? onNavigateToEventTab;

  const HomeView({super.key, this.onNavigateToProfileTab, this.onNavigateToEventTab});

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  Announcement? _healthAlert;
  EventItem? _nextEvent;
  Map<String, dynamic>? _nextAppointment;
  bool _isLoading = true;
  bool _hasError = false;
  String? _errorMessage;
  String? _lastLoadedUserId;

  @override
  void initState() {
    super.initState();
    _loadHomeContent();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final authViewModel = Provider.of<AuthViewModel>(context);
    final userId = (authViewModel.userData?['_id'] ?? authViewModel.userData?['id'])?.toString();
    if (userId != null && userId != _lastLoadedUserId) {
      _lastLoadedUserId = userId;
      _loadHomeContent();
    }
  }

  Future<void> _loadHomeContent() async {
    try {
      final authViewModel = Provider.of<AuthViewModel>(context, listen: false);
      final announcements = await ApiService().fetchAnnouncements();
      final events = await ApiService().fetchEvents();
      final nextAppointment = await ApiService().fetchNextAppointmentForUser(authViewModel.userData);
      final patientProfile = await ApiService().fetchPatientProfileForUser(authViewModel.userData);

      final healthAlerts = announcements
          .where(_isPublicHealthAlert)
          .toList();
      healthAlerts.sort((a, b) => b.createdAt.compareTo(a.createdAt));

      final mergedAppointment = _pickClosestUpcomingAppointment(
        scheduleAppointment: nextAppointment,
        patientProfile: patientProfile,
      );

      final upcomingEvents = events.where(_isEventUpcoming).toList()
        ..sort((a, b) {
          final aDate = _eventSortDateTime(a);
          final bDate = _eventSortDateTime(b);
          return aDate.compareTo(bDate);
        });

      setState(() {
        _healthAlert = healthAlerts.isNotEmpty ? healthAlerts.first : null;
        _nextEvent = upcomingEvents.isNotEmpty ? upcomingEvents.first : null;
        _nextAppointment = mergedAppointment;
        _isLoading = false;
        _hasError = false;
        _errorMessage = null;
      });
    } catch (error) {
      setState(() {
        _isLoading = false;
        _hasError = true;
        _errorMessage = error.toString();
      });
    }
  }

  Future<void> _refreshHome() async {
    await _loadHomeContent();
  }

  bool _isPublicHealthAlert(Announcement item) {
    final category = item.category.toLowerCase().trim();
    final priority = item.priority.toLowerCase().trim();
    final title = item.title.toLowerCase();
    final content = item.content.toLowerCase();

    if (category.contains('health alert')) return true;
    if (category.contains('urgent') || category.contains('emergency')) return true;
    if (priority == 'high') return true;

    final emergencyText =
        title.contains('urgent') ||
        title.contains('emergency') ||
        title.contains('alert') ||
        title.contains('outbreak') ||
        content.contains('urgent') ||
        content.contains('emergency') ||
        content.contains('alert') ||
        content.contains('outbreak');

    if (emergencyText) return true;

    return false;
  }

  DateTime? _parseDate(String? dateString) {
    if (dateString == null || dateString.isEmpty) return null;

    final iso = DateTime.tryParse(dateString);
    if (iso != null) return iso;

    // Supports formats like "Fri Apr 17 2026"
    final parts = dateString.trim().split(RegExp(r'\s+'));
    if (parts.length >= 4) {
      const monthMap = {
        'Jan': 1,
        'Feb': 2,
        'Mar': 3,
        'Apr': 4,
        'May': 5,
        'Jun': 6,
        'Jul': 7,
        'Aug': 8,
        'Sep': 9,
        'Oct': 10,
        'Nov': 11,
        'Dec': 12,
      };

      final month = monthMap[parts[1]];
      final day = int.tryParse(parts[2]);
      final year = int.tryParse(parts[3]);

      if (month != null && day != null && year != null) {
        return DateTime(year, month, day);
      }
    }

    return null;
  }

  TimeOfDay? _parseTime(String? value) {
    if (value == null || value.trim().isEmpty) return null;
    final text = value.trim().toUpperCase();

    // Handles 24h ("14:30")
    final hhmm24 = RegExp(r'^(\d{1,2}):(\d{2})$').firstMatch(text);
    if (hhmm24 != null) {
      final h = int.tryParse(hhmm24.group(1)!);
      final m = int.tryParse(hhmm24.group(2)!);
      if (h != null && m != null && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        return TimeOfDay(hour: h, minute: m);
      }
    }

    // Handles 12h ("08:00 AM")
    final hhmm12 = RegExp(r'^(\d{1,2}):(\d{2})\s*(AM|PM)$').firstMatch(text);
    if (hhmm12 != null) {
      var h = int.tryParse(hhmm12.group(1)!);
      final m = int.tryParse(hhmm12.group(2)!);
      final ap = hhmm12.group(3);
      if (h != null && m != null && h >= 1 && h <= 12 && m >= 0 && m <= 59) {
        if (ap == 'PM' && h != 12) h += 12;
        if (ap == 'AM' && h == 12) h = 0;
        return TimeOfDay(hour: h, minute: m);
      }
    }

    return null;
  }

  DateTime _combineDateWithTime(DateTime date, TimeOfDay? time, {bool endOfDayIfNull = false}) {
    if (time == null) {
      return endOfDayIfNull
          ? DateTime(date.year, date.month, date.day, 23, 59, 59)
          : DateTime(date.year, date.month, date.day);
    }
    return DateTime(date.year, date.month, date.day, time.hour, time.minute);
  }

  bool _isEventUpcoming(EventItem event) {
    final eventDate = _parseDate(event.date);
    if (eventDate == null) return false;

    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final eventDay = DateTime(eventDate.year, eventDate.month, eventDate.day);

    if (eventDay.isAfter(today)) return true;
    if (eventDay.isBefore(today)) return false;

    // Same-day event: keep visible until endTime/day ends
    final end = _combineDateWithTime(eventDate, _parseTime(event.endTime ?? event.startTime), endOfDayIfNull: true);
    return !end.isBefore(now);
  }

  DateTime _eventSortDateTime(EventItem event) {
    final baseDate = _parseDate(event.date) ?? DateTime(2100);
    final start = _parseTime(event.startTime);
    return _combineDateWithTime(baseDate, start, endOfDayIfNull: false);
  }

  Map<String, dynamic>? _buildSpecialCareVisit(Map<String, dynamic>? profile) {
    if (profile == null) return null;

    final category = (profile['category'] ?? '').toString().toLowerCase().trim();
    if (category == 'prenatal') {
      final prenatal = (profile['prenatalData'] as Map?)?.cast<String, dynamic>() ?? <String, dynamic>{};
      final nextVisitDate = prenatal['nextVisitDate']?.toString();
      if (nextVisitDate != null && nextVisitDate.isNotEmpty && nextVisitDate != 'null') {
        return {
          'date': nextVisitDate,
          'timeSlot': (prenatal['nextVisitTime'] ?? '').toString(),
          'location': (prenatal['nextVisitLocation'] ?? 'Brgy. Health Center').toString(),
          'service': 'Prenatal Checkup',
          'scheduleType': 'Prenatal',
        };
      }
    }

    if (category == 'tb dots' || category == 'tb-dots' || category == 'tbdots') {
      final tb = (profile['tbDotsData'] as Map?)?.cast<String, dynamic>() ?? <String, dynamic>{};
      final nextVisitDate = tb['nextVisitDate']?.toString();
      if (nextVisitDate != null && nextVisitDate.isNotEmpty && nextVisitDate != 'null') {
        return {
          'date': nextVisitDate,
          'timeSlot': (tb['nextVisitTime'] ?? '').toString(),
          'location': (tb['nextVisitLocation'] ?? 'Brgy. Health Center').toString(),
          'service': 'TB DOTS Follow-up',
          'scheduleType': 'TB DOTS',
        };
      }
    }

    return null;
  }

  DateTime? _appointmentDateTime(Map<String, dynamic>? appointment) {
    if (appointment == null) return null;
    final date = _parseDate((appointment['date'] ?? '').toString());
    if (date == null) return null;

    final timeText = (appointment['timeSlot'] ?? appointment['time'] ?? '').toString();
    final time = _parseTime(timeText);
    return _combineDateWithTime(date, time, endOfDayIfNull: true);
  }

  Map<String, dynamic>? _pickClosestUpcomingAppointment({
    required Map<String, dynamic>? scheduleAppointment,
    required Map<String, dynamic>? patientProfile,
  }) {
    final candidates = <Map<String, dynamic>>[];
    if (scheduleAppointment != null) candidates.add(scheduleAppointment);

    final special = _buildSpecialCareVisit(patientProfile);
    if (special != null) candidates.add(special);

    if (candidates.isEmpty) return null;

    final now = DateTime.now();
    final upcoming = candidates.where((item) {
      final dt = _appointmentDateTime(item);
      return dt != null && !dt.isBefore(now);
    }).toList();

    if (upcoming.isEmpty) return null;

    upcoming.sort((a, b) {
      final aDate = _appointmentDateTime(a) ?? DateTime(2100);
      final bDate = _appointmentDateTime(b) ?? DateTime(2100);
      return aDate.compareTo(bDate);
    });

    return Map<String, dynamic>.from(upcoming.first);
  }

  String _formatEventDate(EventItem event) {
    final date = _parseDate(event.date);
    if (date == null) {
      return 'TBA';
    }
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    final month = months[date.month - 1];
    final day = date.day.toString().padLeft(2, '0');
    final time = event.startTime != null && event.startTime!.isNotEmpty ? event.startTime : 'TBA';
    return '$month $day • $time';
  }

  String _formatAppointmentDate(Map<String, dynamic> appointment) {
    final parsedDate = _parseDate((appointment['date'] ?? '').toString());
    final timeSlot = (appointment['timeSlot'] ?? appointment['time'] ?? '').toString();
    if (parsedDate == null) {
      return timeSlot.isNotEmpty ? timeSlot : 'TBA';
    }

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    final month = months[parsedDate.month - 1];
    final day = parsedDate.day.toString().padLeft(2, '0');
    final timePart = timeSlot.isNotEmpty ? timeSlot : 'TBA';
    return '$month $day • $timePart';
  }

  Color _categoryColor(String category) {
    final normalized = category.toLowerCase().trim();
    if (normalized.contains('health alert') ||
        normalized.contains('urgent') ||
        normalized.contains('emergency')) {
      return const Color(0xFFEF4444);
    }
    if (normalized.contains('event')) {
      return const Color(0xFFF59E0B);
    }
    return AppTheme.primaryBlue;
  }

  String _shortenContent(String content) {
    final trimmed = content.trim();
    if (trimmed.length <= 90) return trimmed;
    return '${trimmed.substring(0, 90).trim()}...';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: RefreshIndicator(
        onRefresh: _refreshHome,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 16),
                _buildGreeting(context),
                const SizedBox(height: 16),
                _buildAlertBanner(context),
                const SizedBox(height: 24),
                _buildSectionTitle(context, 'Quick Actions'),
                const SizedBox(height: 16),
                _buildQuickActionsGrid(context),
                const SizedBox(height: 24),
                _buildSectionTitle(context, 'Next Appointment'),
                const SizedBox(height: 16),
                _buildNextAppointmentCard(context),
                const SizedBox(height: 24),
                _buildSectionTitle(
                  context, 
                  'Barangay Events', 
                  actionText: 'View all',
                  onActionTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const AllEventsView()),
                    );
                  },
                ),
                const SizedBox(height: 16),
                _buildEventCard(context),
                const SizedBox(height: 24),
                _buildHealthTipCard(context),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildGreeting(BuildContext context) {
    final authViewModel = Provider.of<AuthViewModel>(context);
    final userName = authViewModel.userData?['name'] ?? 'User';
    final userProfileImage = authViewModel.userData?['profileImage']?.toString();
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        GestureDetector(
          onTap: () {
            widget.onNavigateToProfileTab?.call();
          },
          child: CircleAvatar(
            radius: 24,
            backgroundImage: (userProfileImage != null && userProfileImage.isNotEmpty)
                ? NetworkImage(userProfileImage)
                : null,
            backgroundColor: AppTheme.primaryLight,
            child: (userProfileImage == null || userProfileImage.isEmpty)
                ? const Icon(Icons.person, color: AppTheme.primaryBlue)
                : null,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Magandang araw,',
                style: TextStyle(
                  color: Theme.of(context).textTheme.bodyMedium?.color,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                '$userName! 👋',
                style: TextStyle(
                  color: Theme.of(context).textTheme.bodyLarge?.color,
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAlertBanner(BuildContext context) {
    final hasAlert = _healthAlert != null;
    final title = hasAlert ? _healthAlert!.title : 'Dengue Awareness\nWeek';
    final description = hasAlert
        ? (_healthAlert!.content.isNotEmpty ? _healthAlert!.content : 'Keep your surroundings clean.\nImplement the 4S strategy today\nto protect your family.')
        : 'Keep your surroundings clean.\nImplement the 4S strategy today\nto protect your family.';
    final actionColor = hasAlert ? const Color(0xFFEF4444) : const Color(0xFFF59E0B);
    final tagColor = hasAlert ? const Color(0xFFEF4444) : Colors.red;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppTheme.primaryGradient,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primaryBlue.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          )
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            right: -10,
            bottom: -15,
            child: Icon(
              Icons.campaign,
              size: 100,
              color: Colors.white.withOpacity(0.1),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'PUBLIC HEALTH ALERT',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                description,
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: actionColor,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => NewsDetailsView(
                        item: {
                          'tag': 'PUBLIC HEALTH ALERT',
                          'title': title,
                          'description': description,
                          'time': hasAlert
                              ? _healthAlert!.createdAt.toIso8601String()
                              : DateTime.now().toIso8601String(),
                          'isPinned': hasAlert && _healthAlert!.priority == 'High',
                          'color': tagColor,
                          'content': description,
                          'createdAt': hasAlert ? _healthAlert!.createdAt.toIso8601String() : DateTime.now().toIso8601String(),
                          'author': hasAlert ? _healthAlert!.author : 'Barangay Health Center',
                        },
                      ),
                    ),
                  );
                },
                child: const Text(
                  'Learn More',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title, {String? actionText, VoidCallback? onActionTap}) {
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
          GestureDetector(
            onTap: onActionTap,
            child: Text(
              actionText,
              style: const TextStyle(
                color: AppTheme.primaryBlue,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          )
      ],
    );
  }

  Widget _buildQuickActionsGrid(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.3,
      children: [
        _buildActionCard(context, Icons.folder_shared, 'My Records', AppTheme.primaryBlue, onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const HealthRecordsView()),
          );
        }),
        _buildActionCard(context, Icons.calendar_month, 'Events', const Color(0xFFD97706), onTap: () {
          widget.onNavigateToEventTab?.call();
        }),
        _buildActionCard(context, Icons.medical_services, 'Emergency', const Color(0xFFDC2626), onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const EmergencyView()),
          );
        }),
        _buildActionCard(context, Icons.vaccines, 'Vaccines', const Color(0xFF9333EA)),
      ],
    );
  }

  Widget _buildActionCard(BuildContext context, IconData icon, String title, Color color, {VoidCallback? onTap}) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: TextStyle(
                  color: Theme.of(context).textTheme.bodyLarge?.color,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNextAppointmentCard(BuildContext context) {
    final hasAppointment = _nextAppointment != null;
    final title = hasAppointment
      ? (_nextAppointment!['service'] ?? _nextAppointment!['scheduleType'] ?? 'Upcoming Appointment').toString()
      : 'No upcoming appointment';
    final when = hasAppointment ? _formatAppointmentDate(_nextAppointment!) : 'Check back later';
    final location = hasAppointment
      ? (_nextAppointment!['location'] ?? 'Health Center').toString()
      : 'Book from the health desk';

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: IntrinsicHeight(
        child: Row(
          children: [
            Container(
              width: 8,
              decoration: const BoxDecoration(
                color: Color(0xFFD97706), 
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(16),
                  bottomLeft: Radius.circular(16),
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: TextStyle(
                              color: Theme.of(context).textTheme.bodyLarge?.color,
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(Icons.calendar_today, size: 14, color: Theme.of(context).textTheme.bodyMedium?.color),
                              const SizedBox(width: 6),
                              Text(when, style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color, fontSize: 12, fontWeight: FontWeight.w500)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(Icons.location_on, size: 14, color: Theme.of(context).textTheme.bodyMedium?.color),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  location,
                                  style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color, fontSize: 12, fontWeight: FontWeight.w500),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFD97706).withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.medical_information, color: Color(0xFFD97706), size: 24),
                    )
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEventCard(BuildContext context) {
    final hasEvent = _nextEvent != null;
    final title = hasEvent ? _nextEvent!.title : 'No upcoming event';
    final tag = hasEvent ? (_nextEvent!.category.toUpperCase()) : 'EVENT';
    final location = hasEvent ? (_nextEvent!.location ?? 'Location not available') : 'Check back later';

    final eventDate = hasEvent ? _parseDate(_nextEvent!.date) : null;
    final day = eventDate != null ? eventDate.day.toString().padLeft(2, '0') : '--';
    const months = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
    ];
    final month = eventDate != null ? months[eventDate.month - 1] : '---';
    final time = hasEvent
        ? '${_nextEvent!.startTime ?? 'TBA'} - ${_nextEvent!.endTime ?? 'TBA'}'
      : 'TBA';

    return GestureDetector(
      onTap: () {
        if (hasEvent) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => EventDetailsView(event: _nextEvent!),
            ),
          );
        }
      },
      child: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            )
          ],
        ),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              width: 6,
              decoration: const BoxDecoration(
                color: AppTheme.primaryBlue,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(20),
                  bottomLeft: Radius.circular(20),
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Align(
                      alignment: Alignment.center,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 20),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryBlue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              day,
                              style: const TextStyle(
                                color: AppTheme.primaryBlue,
                                fontSize: 24,
                                fontWeight: FontWeight.w800,
                                height: 1.0,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              month,
                              style: const TextStyle(
                                color: AppTheme.primaryBlue,
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  title,
                                  style: TextStyle(
                                    color: Theme.of(context).textTheme.bodyLarge?.color,
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                    height: 1.2,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  tag,
                                  style: TextStyle(
                                    color: Theme.of(context).textTheme.bodyLarge?.color,
                                    fontSize: 8,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              const Icon(Icons.location_on, size: 14, color: AppTheme.primaryBlue),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  location,
                                  style: TextStyle(
                                    color: Theme.of(context).textTheme.bodyMedium?.color,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w500,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              const Icon(Icons.access_time_filled, size: 14, color: AppTheme.primaryBlue),
                              const SizedBox(width: 6),
                              Text(
                                time,
                                style: TextStyle(
                                  color: Theme.of(context).textTheme.bodyMedium?.color,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    ));
  }

  Widget _buildHealthTipCard(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: const BoxDecoration(
                  color: Color(0xFFF59E0B),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.lightbulb, color: Colors.white, size: 16),
              ),
              const SizedBox(width: 10),
              Text(
                'Health Tip of the Day',
                style: TextStyle(
                  color: Theme.of(context).textTheme.bodyLarge?.color,
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            '"Staying hydrated is key for seniors. Try to drink at least 8 glasses of water a day, even if you don\'t feel thirsty, to maintain energy and kidney health."',
            style: TextStyle(
              color: Theme.of(context).textTheme.bodyMedium?.color,
              fontSize: 12,
              fontStyle: FontStyle.italic,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('WELLNESS GUIDE', style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
              Row(
                children: const [
                  Text('Share Tip', style: TextStyle(color: AppTheme.primaryBlue, fontSize: 11, fontWeight: FontWeight.w700)),
                  SizedBox(width: 4),
                  Icon(Icons.share, size: 12, color: AppTheme.primaryBlue),
                ],
              )
            ],
          )
        ],
      ),
    );
  }
}
