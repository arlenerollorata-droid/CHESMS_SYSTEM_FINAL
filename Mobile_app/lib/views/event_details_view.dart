import 'package:flutter/material.dart';
import '../models/event.dart';
import '../utils/theme.dart';
import 'event_registration_view.dart';

class EventDetailsView extends StatelessWidget {
  final EventItem event;

  const EventDetailsView({Key? key, required this.event}) : super(key: key);

  Color _getBadgeColor(String category) {
    final cat = category.toLowerCase();
    if (cat.contains('health') || cat.contains('medical')) {
      return const Color(0xFFF59E0B);
    } else if (cat.contains('routine') || cat.contains('service')) {
      return const Color(0xFF14B8A6);
    } else if (cat.contains('community')) {
      return const Color(0xFFF59E0B);
    } else {
      return AppTheme.primaryBlue;
    }
  }

  DateTime? _parseEventDate(String date) {
    if (date.isEmpty) return null;

    // Try ISO 8601 format first (e.g., "2026-04-11T00:00:00Z")
    try {
      return DateTime.parse(date);
    } catch (_) {}

    // Try text format: "Sat Apr 11 2026"
    try {
      final parts = date.trim().split(RegExp(r'\s+'));
      if (parts.length >= 3) {
        final monthStr = parts[1]; // e.g., "Apr"
        final dayStr = parts[2]; // e.g., "11"
        final yearStr = parts[3]; // e.g., "2026"

        const monthMap = {
          'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
          'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
        };

        final month = monthMap[monthStr];
        final day = int.tryParse(dayStr);
        final year = int.tryParse(yearStr);

        if (month != null && day != null && year != null) {
          return DateTime(year, month, day);
        }
      }
    } catch (_) {}

    return null;
  }

  @override
  Widget build(BuildContext context) {
    final tagColor = _getBadgeColor(event.category);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    final eventDate = _parseEventDate(event.date);
    
    final dateText = eventDate != null 
        ? '${eventDate.month}/${eventDate.day}/${eventDate.year}' 
        : event.date;

    final timeText = '${event.startTime ?? 'TBA'} - ${event.endTime ?? 'TBA'}';

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.primaryBlue),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Event Details',
          style: TextStyle(
            color: AppTheme.primaryBlue,
            fontWeight: FontWeight.w800,
            fontSize: 18,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.share, color: AppTheme.primaryBlue),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [

            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: tagColor,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      event.category.toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    event.title,
                    style: TextStyle(
                      color: Theme.of(context).textTheme.bodyLarge?.color,
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      const Icon(Icons.calendar_today, size: 14, color: AppTheme.primaryBlue),
                      const SizedBox(width: 6),
                      Text(
                        'Date: $dateText',
                        style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.access_time_filled, size: 14, color: Color(0xFFB45309)),
                      const SizedBox(width: 6),
                      Text(
                        'Time: $timeText',
                        style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 14, color: Color(0xFF059669)),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          'Location: ${event.location ?? 'TBA'}',
                          style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color, fontSize: 12, fontWeight: FontWeight.w600),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Divider(color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.1)),
                  const SizedBox(height: 20),
                  Text(
                    event.description ?? 'No additional details available for this event.',
                    style: TextStyle(
                      color: Theme.of(context).textTheme.bodyLarge?.color,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      height: 1.6,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Container(
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E3A8A).withOpacity(0.3) : const Color(0xFFEFF6FF), // AppTheme.primaryLight
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: IntrinsicHeight(
                      child: Row(
                        children: [
                          Container(
                            width: 6,
                            decoration: const BoxDecoration(
                              color: AppTheme.primaryBlue,
                              borderRadius: BorderRadius.only(
                                topLeft: Radius.circular(12),
                                bottomLeft: Radius.circular(12),
                              ),
                            ),
                          ),
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Text(
                                'Please make sure to arrive at the specified location at least 15 minutes before the start time. Don\'t forget to bring any necessary requirements or identification if needed.',
                                style: TextStyle(
                                  color: isDark ? const Color(0xFFBFDBFE) : const Color(0xFF1E3A8A),
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  height: 1.5,
                                ),
                              ),
                            ),
                          )
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                  Row(
                    children: [
                      Container(
                         padding: const EdgeInsets.all(10),
                         decoration: BoxDecoration(
                           color: AppTheme.primaryBlue,
                           borderRadius: BorderRadius.circular(8),
                         ),
                         child: const Icon(Icons.business, color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'ORGANIZED BY:',
                            style: TextStyle(
                              color: Theme.of(context).textTheme.bodyMedium?.color,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const Text(
                            'Barangay Health Center',
                            style: TextStyle(
                              color: AppTheme.primaryBlue,
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryBlue,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      onPressed: () {
                         Navigator.push(
                           context,
                           MaterialPageRoute(
                             builder: (context) => EventRegistrationView(event: event),
                           ),
                         );
                      },
                      icon: const Icon(Icons.how_to_reg),
                      label: const Text(
                        'Register for Event',
                        style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}
