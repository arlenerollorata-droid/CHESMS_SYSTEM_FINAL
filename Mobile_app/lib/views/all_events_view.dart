import 'package:flutter/material.dart';
import '../models/event.dart';
import '../services/api_service.dart';
import '../utils/theme.dart';
import 'event_details_view.dart';
import 'event_registration_view.dart';

class AllEventsView extends StatefulWidget {
  const AllEventsView({Key? key}) : super(key: key);

  @override
  State<AllEventsView> createState() => _AllEventsViewState();
}

class _AllEventsViewState extends State<AllEventsView> {
  Future<List<EventItem>> _eventsFuture = Future.value([]);
  String _selectedFilter = 'All';
  final TextEditingController _searchController = TextEditingController();
  List<EventItem> _allEvents = [];
  String _searchQuery = '';

  final List<String> _filters = ['All', 'Health', 'Youth', 'Senior', 'Community'];

  @override
  void initState() {
    super.initState();
    _loadEvents();
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text.toLowerCase();
      });
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadEvents() async {
    final future = ApiService().fetchEvents();
    setState(() {
      _eventsFuture = future;
    });
    
    try {
      final events = await future;
      if (mounted) {
        setState(() {
          _allEvents = events;
        });
      }
    } catch (e) {
      // Handle error
    }
  }

  List<EventItem> _getFilteredEvents() {
    return _allEvents.where((event) {
      // 1. Apply category filter
      final categoryMatch = 
          _selectedFilter == 'All' || 
          event.category.toLowerCase().contains(_selectedFilter.toLowerCase()) ||
          event.title.toLowerCase().contains(_selectedFilter.toLowerCase());

      // 2. Apply search filter
      final searchMatch = 
          _searchQuery.isEmpty ||
          event.title.toLowerCase().contains(_searchQuery) ||
          (event.location?.toLowerCase().contains(_searchQuery) ?? false) ||
          event.category.toLowerCase().contains(_searchQuery);

      return categoryMatch && searchMatch;
    }).toList();
  }

  DateTime? _parseDate(String date) {
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

  Color _getBadgeColor(String category) {
    final cat = category.toLowerCase();
    if (cat.contains('health') || cat.contains('medical')) {
      return const Color(0xFFF59E0B); // Orange similar to image
    } else if (cat.contains('routine') || cat.contains('service')) {
      return const Color(0xFF14B8A6); // Teal
    } else if (cat.contains('community')) {
      return const Color(0xFFF59E0B);
    } else {
      return AppTheme.primaryBlue.withOpacity(0.8);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: AppTheme.primaryBlue),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Barangay Events',
          style: TextStyle(
            color: AppTheme.primaryBlue,
            fontSize: 20,
            fontWeight: FontWeight.w800,
          ),
        ),
        centerTitle: false,
      ),
      body: Column(
        children: [
          _buildSearchBar(isDark),
          _buildFilterChips(isDark),
          Expanded(
            child: FutureBuilder<List<EventItem>>(
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
                      style: TextStyle(
                        fontSize: 14,
                        color: Theme.of(context).textTheme.bodyMedium?.color,
                      ),
                    ),
                  );
                }

                final filteredEvents = _getFilteredEvents();

                if (filteredEvents.isEmpty) {
                  return Center(
                    child: Text(
                      'No events found.',
                      style: TextStyle(
                        color: Theme.of(context).textTheme.bodyMedium?.color,
                      ),
                    ),
                  );
                }

                // Sort events by date
                filteredEvents.sort((a, b) {
                  final aDate = _parseDate(a.date) ?? DateTime(2100);
                  final bDate = _parseDate(b.date) ?? DateTime(2100);
                  return aDate.compareTo(bDate);
                });

                return RefreshIndicator(
                  onRefresh: _loadEvents,
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    itemCount: filteredEvents.length,
                    itemBuilder: (context, index) {
                      return _buildEventCard(filteredEvents[index], isDark);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar(bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9), // Light gray like image
          borderRadius: BorderRadius.circular(12),
        ),
        child: TextField(
          controller: _searchController,
          decoration: InputDecoration(
            hintText: 'Search events, health drives...',
            hintStyle: TextStyle(
              color: isDark ? Colors.white54 : Colors.black54,
              fontSize: 14,
            ),
            prefixIcon: Icon(
              Icons.search,
              color: isDark ? Colors.white54 : Colors.black54,
              size: 20,
            ),
            border: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(vertical: 14),
          ),
          style: TextStyle(
            color: Theme.of(context).textTheme.bodyLarge?.color,
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChips(bool isDark) {
    return SizedBox(
      height: 50,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _filters.length,
        itemBuilder: (context, index) {
          final filter = _filters[index];
          final isSelected = _selectedFilter == filter;

          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: FilterChip(
              label: Text(
                filter,
                style: TextStyle(
                  color: isSelected ? Colors.white : (isDark ? Colors.white70 : Colors.black87),
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  fontSize: 13,
                ),
              ),
              selected: isSelected,
              onSelected: (bool selected) {
                setState(() {
                  _selectedFilter = filter;
                });
              },
              backgroundColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
              selectedColor: AppTheme.primaryBlue,
              checkmarkColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: const BorderSide(color: Colors.transparent),
              ),
              showCheckmark: false,
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            ),
          );
        },
      ),
    );
  }

  Widget _buildEventCard(EventItem event, bool isDark) {
    final parsedDate = _parseDate(event.date);
    final day = parsedDate != null ? parsedDate.day.toString().padLeft(2, '0') : '--';
    const months = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    final month = parsedDate != null ? months[parsedDate.month - 1] : 'TBA';
    final timeLabel = '${event.startTime ?? 'TBA'} - ${event.endTime ?? 'TBA'}';
    final location = event.location ?? 'Location not available';
    final badgeColor = _getBadgeColor(event.category);
    
    // Determine button style based on event status or mock property
    bool isRoutine = event.category.toLowerCase().contains('routine');

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
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isDark ? 0.2 : 0.05),
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Date part
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    month,
                    style: TextStyle(
                      color: isDark ? Colors.white70 : Colors.black54,
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.0,
                    ),
                  ),
                  Text(
                    day,
                    style: const TextStyle(
                      color: AppTheme.primaryBlue,
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      height: 1.1,
                    ),
                  ),
                ],
              ),
              // Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: badgeColor.withOpacity(isRoutine ? 0.2 : 1.0),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  event.category.toUpperCase(),
                  style: TextStyle(
                    color: isRoutine ? badgeColor : Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Title
          Text(
            event.title,
            style: TextStyle(
              color: Theme.of(context).textTheme.bodyLarge?.color,
              fontSize: 16,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 8),
          // Location
          Row(
            children: [
              const Icon(Icons.location_on_outlined, size: 16, color: AppTheme.primaryBlue),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  location,
                  style: TextStyle(
                    color: Theme.of(context).textTheme.bodyMedium?.color,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          // Time
          Row(
            children: [
              const Icon(Icons.access_time, size: 16, color: AppTheme.primaryBlue),
              const SizedBox(width: 6),
              Text(
                timeLabel,
                style: TextStyle(
                  color: Theme.of(context).textTheme.bodyMedium?.color,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Action Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: isRoutine ? AppTheme.primaryBlue.withOpacity(0.1) : AppTheme.primaryBlue,
                foregroundColor: isRoutine ? AppTheme.primaryBlue : Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              onPressed: () {
                if (isRoutine) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => EventDetailsView(event: event)),
                  );
                } else {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => EventRegistrationView(event: event)),
                  );
                }
              },
              child: Text(
                isRoutine ? 'View Details' : 'Register Now',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
        ],
      ),
    ));
  }
}
