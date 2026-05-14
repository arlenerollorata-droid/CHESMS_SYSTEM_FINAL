import 'package:flutter/material.dart';
import '../models/event.dart';
import '../services/api_service.dart';
import '../utils/theme.dart';
import 'event_details_view.dart';

class EventView extends StatefulWidget {
  const EventView({Key? key}) : super(key: key);

  @override
  State<EventView> createState() => _EventViewState();
}

class _EventViewState extends State<EventView> {
  Future<List<EventItem>> _eventsFuture = Future.value([]);
  DateTime _selectedDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    _eventsFuture = ApiService().fetchEvents();
  }

  Future<void> _refreshEvents() async {
    setState(() {
      _eventsFuture = ApiService().fetchEvents();
    });
    // Wait for the future to complete
    await _eventsFuture;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: RefreshIndicator(
        onRefresh: _refreshEvents,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 16),
                _buildCalendarCard(context),
                const SizedBox(height: 32),
                _buildEventHeader(context),

                FutureBuilder<List<EventItem>>(
                  future: _eventsFuture,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(child: CircularProgressIndicator());
                    }
                    if (snapshot.hasError) {
                      return Center(
                        child: Text(
                          'Unable to load events.\n${snapshot.error}',
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 14),
                        ),
                      );
                    }

                    final events = snapshot.data ?? [];
                    final eventsForSelectedDate = _getEventsForSelectedDate(events);

                    if (eventsForSelectedDate.isEmpty) {
                      return const Center(
                        child: Text('No events found for selected date.'),
                      );
                    }

                    return Column(
                      children: eventsForSelectedDate.map((event) {
                        final parsedDate = _parseDate(event.date);
                        final day = parsedDate.day.toString().padLeft(2, '0');
                        const months = [
                          'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                          'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
                        ];
                        final month = months[parsedDate.month - 1];
                        final timeLabel = '${event.startTime ?? 'TBA'} - ${event.endTime ?? 'TBA'}';

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16.0),
                          child: _buildEventCard(
                            context: context,
                            event: event,
                            day: day,
                            month: month,
                            title: event.title,
                            tag: event.category.toUpperCase(),
                            location: event.location ?? 'Location not available',
                            time: timeLabel,
                            onRegister: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Registered for ${event.title}')),
                              );
                            },
                          ),
                        );
                      }).toList(),
                    );
                  },
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCalendarCard(BuildContext context) {
    final daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    final mockDays = [
      -23, -24, -25, -26, -27, -28, 1,
      2,   3,   4,   5,   6,   7,   8,
      9,   10,  11,  12,  13,  14,  15,
      16,  17,  18,  19,  20,  21,  22,
      23,  24,  25,  26,  27,  28,  29,
      30,  31,  -1,  null, null, null, null
    ];

    final eventDays = {12, 15, 20, 28};
    final selectedDay = _selectedDate.day;

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 15,
            offset: const Offset(0, 5),
          )
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${_getMonthName(_selectedDate.month)} ${_selectedDate.year}',
                style: TextStyle(
                  color: Theme.of(context).textTheme.bodyLarge?.color,
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
              ),
              Row(
                children: [
                  IconButton(
                    onPressed: () {
                      setState(() {
                        _selectedDate = DateTime(_selectedDate.year, _selectedDate.month - 1, 1);
                        _eventsFuture = ApiService().fetchEvents();
                      });
                    },
                    icon: Icon(Icons.chevron_left, color: Theme.of(context).textTheme.bodyMedium?.color),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                  const SizedBox(width: 16),
                  IconButton(
                    onPressed: () {
                      setState(() {
                        _selectedDate = DateTime(_selectedDate.year, _selectedDate.month + 1, 1);
                        _eventsFuture = ApiService().fetchEvents();
                      });
                    },
                    icon: Icon(Icons.chevron_right, color: Theme.of(context).textTheme.bodyMedium?.color),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              )
            ],
          ),
          const SizedBox(height: 24),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: daysOfWeek.map((day) => SizedBox(
              width: 32,
              child: Text(
                day,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Theme.of(context).textTheme.bodyMedium?.color,
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                ),
              ),
            )).toList(),
          ),
          const SizedBox(height: 16),

          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: mockDays.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
              childAspectRatio: 0.9,
            ),
            itemBuilder: (context, index) {
              final dayInfo = mockDays[index];
              if (dayInfo == null) return const SizedBox();

              final isMuted = dayInfo < 0;
              final displayDay = dayInfo.abs();
              final isSelected = dayInfo == selectedDay;
              final hasEvent = eventDays.contains(displayDay) && !isMuted;

              return GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedDate = DateTime(_selectedDate.year, _selectedDate.month, displayDay);
                  });
                },
                child: Container(
                  decoration: BoxDecoration(
                    color: isSelected ? AppTheme.primaryBlue : Colors.transparent,
                    shape: BoxShape.circle,
                    boxShadow: isSelected ? [
                      BoxShadow(
                        color: AppTheme.primaryBlue.withOpacity(0.4),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      )
                    ] : null,
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Text(
                        displayDay.toString(),
                        style: TextStyle(
                          color: isSelected ? Colors.white : (isMuted ? Theme.of(context).textTheme.bodyMedium!.color!.withOpacity(0.3) : Theme.of(context).textTheme.bodyLarge?.color),
                          fontSize: 14,
                          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                        ),
                      ),
                      if (hasEvent)
                        Positioned(
                          bottom: 6,
                          child: Container(
                            width: 4,
                            height: 4,
                            decoration: BoxDecoration(
                              color: isSelected ? Colors.white : AppTheme.primaryBlue,
                              shape: BoxShape.circle,
                            ),
                          ),
                        )
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildEventHeader(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Row(
            children: [
              Container(
                width: 6,
                decoration: BoxDecoration(
                  color: const Color(0xFFF59E0B),
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'Events on ${_getMonthName(_selectedDate.month)} ${_selectedDate.day}',
                style: TextStyle(
                  color: Theme.of(context).textTheme.bodyLarge?.color,
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          FutureBuilder<List<EventItem>>(
            future: _eventsFuture,
            builder: (context, snapshot) {
              final events = snapshot.data ?? [];
              final eventsForSelectedDate = _getEventsForSelectedDate(events);
              return Text(
                '${eventsForSelectedDate.length} Event${eventsForSelectedDate.length == 1 ? '' : 's'} Found',
                style: TextStyle(
                  color: Theme.of(context).textTheme.bodyMedium?.color,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildEventCard({
    required BuildContext context,
    required EventItem event,
    required String day,
    required String month,
    required String title,
    required String tag,
    required String location,
    required String time,
    required VoidCallback onRegister,
  }) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => EventDetailsView(event: event),
          ),
        );
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
                              )
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
                                  style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color, fontSize: 11, fontWeight: FontWeight.w500),
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
                                style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color, fontSize: 11, fontWeight: FontWeight.w500),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Align(
                            alignment: Alignment.centerRight,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primaryBlue,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                                shadowColor: AppTheme.primaryBlue.withOpacity(0.5),
                              ),
                              onPressed: onRegister,
                              child: const Text('Register', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
                            ),
                          )
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            )
          ],
        ),
      ),
    ));
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

  List<EventItem> _getEventsForSelectedDate(List<EventItem> events) {
    return events.where((event) {
      final eventDate = _parseEventDate(event.date);
      if (eventDate == null) return false;
      
      return eventDate.year == _selectedDate.year &&
             eventDate.month == _selectedDate.month &&
             eventDate.day == _selectedDate.day;
    }).toList();
  }

  DateTime _parseDate(String date) {
    return _parseEventDate(date) ?? DateTime.now();
  }

  String _getMonthName(int month) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }
}
