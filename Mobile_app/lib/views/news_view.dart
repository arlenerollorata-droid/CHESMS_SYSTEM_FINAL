import 'package:flutter/material.dart';
import '../models/announcement.dart';
import '../services/api_service.dart';
import '../utils/theme.dart';
import 'news_details_view.dart';

class NewsView extends StatefulWidget {
  const NewsView({Key? key}) : super(key: key);

  @override
  State<NewsView> createState() => _NewsViewState();
}

class _NewsViewState extends State<NewsView> {
  String _selectedCategory = 'All';
  final List<String> _categories = ['All', 'Health Alert', 'Event', 'General'];
  late Future<List<Announcement>> _announcementsFuture;

  bool _isAlertAnnouncement(Announcement announcement) {
    final category = announcement.category.toLowerCase().trim();
    final priority = announcement.priority.toLowerCase().trim();
    final title = announcement.title.toLowerCase();
    final content = announcement.content.toLowerCase();

    return category.contains('health alert') ||
        category.contains('urgent') ||
        category.contains('emergency') ||
        priority == 'high' ||
        title.contains('urgent') ||
        title.contains('emergency') ||
        title.contains('alert') ||
        title.contains('outbreak') ||
        content.contains('urgent') ||
        content.contains('emergency') ||
        content.contains('alert') ||
        content.contains('outbreak');
  }

  bool _matchesSelectedCategory(Announcement announcement) {
    if (_selectedCategory == 'All') return true;
    if (_selectedCategory == 'Health Alert') return _isAlertAnnouncement(announcement);
    return announcement.category == _selectedCategory;
  }

  String _displayTag(Announcement announcement) {
    if (_isAlertAnnouncement(announcement)) return 'PUBLIC HEALTH ALERT';
    return announcement.category.toUpperCase();
  }

  Color _resolveCardColor(Announcement announcement) {
    if (_isAlertAnnouncement(announcement)) return const Color(0xFFEF4444);
    if (announcement.category.toLowerCase().trim().contains('event')) return const Color(0xFFF59E0B);
    return AppTheme.primaryBlue;
  }

  @override
  void initState() {
    super.initState();
    _announcementsFuture = ApiService().fetchAnnouncements();
  }

  Future<void> _refreshAnnouncements() async {
    setState(() {
      _announcementsFuture = ApiService().fetchAnnouncements();
    });
    await _announcementsFuture;
  }

  String _categorizeNewsByDate(DateTime createdAt, {DateTime? now}) {
    // Normalize both dates to local calendar-day boundaries to avoid
    // off-by-one errors due to time-of-day and timezone differences.
    final localNow = (now ?? DateTime.now()).toLocal();
    final localCreatedAt = createdAt.toLocal();

    final today = DateTime(localNow.year, localNow.month, localNow.day);
    final createdDay = DateTime(
      localCreatedAt.year,
      localCreatedAt.month,
      localCreatedAt.day,
    );

    final diffDays = today.difference(createdDay).inDays;

    if (diffDays <= 0) return 'Today';
    if (diffDays == 1) return 'Yesterday';
    if (diffDays >= 2 && diffDays <= 7) return 'This Week';
    return 'Older';
  }

  List<MapEntry<String, List<Announcement>>> _groupByRecency(List<Announcement> announcements) {
    final sorted = [...announcements]
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

    final grouped = <String, List<Announcement>>{};
    const order = ['Today', 'Yesterday', 'This Week', 'Older'];

    for (final bucket in order) {
      grouped[bucket] = <Announcement>[];
    }

    for (final item in sorted) {
      grouped[_categorizeNewsByDate(item.createdAt)]!.add(item);
    }

    return order
        .where((bucket) => grouped[bucket]!.isNotEmpty)
        .map((bucket) => MapEntry(bucket, grouped[bucket]!))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 16),
            _buildCategories(),
            const SizedBox(height: 16),
            Expanded(
              child: RefreshIndicator(
                onRefresh: _refreshAnnouncements,
                child: FutureBuilder<List<Announcement>>(
                  future: _announcementsFuture,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(child: CircularProgressIndicator());
                    }
                    if (snapshot.hasError) {
                      return ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                        children: [
                          Center(
                            child: Text(
                              'Unable to load announcements.\n${snapshot.error}',
                              textAlign: TextAlign.center,
                              style: const TextStyle(fontSize: 14),
                            ),
                          ),
                        ],
                      );
                    }

                    final announcements = snapshot.data ?? [];
                    final filteredAnnouncements = announcements
                      .where(_matchesSelectedCategory)
                      .toList();
                    final groupedAnnouncements = _groupByRecency(filteredAnnouncements);

                    if (filteredAnnouncements.isEmpty) {
                      return ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                        children: [
                          Center(
                            child: Text(
                              'No announcements found for "$_selectedCategory".',
                              style: const TextStyle(fontSize: 14),
                            ),
                          ),
                        ],
                      );
                    }

                    return ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                      itemCount: groupedAnnouncements.length,
                      itemBuilder: (context, index) {
                        final group = groupedAnnouncements[index];
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (index > 0) const SizedBox(height: 8),
                            _buildDateSectionHeader(group.key),
                            const SizedBox(height: 10),
                            ...group.value.asMap().entries.map((entry) {
                              final item = entry.value;
                              final isLast = entry.key == group.value.length - 1;
                              return Padding(
                                padding: EdgeInsets.only(bottom: isLast ? 0 : 16),
                                child: _buildNewsCard(item),
                              );
                            }),
                            const SizedBox(height: 20),
                          ],
                        );
                      },
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategories() {
    return SizedBox(
      height: 40,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        scrollDirection: Axis.horizontal,
        itemCount: _categories.length,
        separatorBuilder: (context, index) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final category = _categories[index];
          final isSelected = _selectedCategory == category;
          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedCategory = category;
              });
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppTheme.primaryBlue : Theme.of(context).colorScheme.surface,
                borderRadius: BorderRadius.circular(20),
                border: isSelected ? null : Border.all(color: Theme.of(context).textTheme.bodyMedium!.color!.withOpacity(0.2)),
              ),
              alignment: Alignment.center,
              child: Text(
                category,
                style: TextStyle(
                  color: isSelected ? Colors.white : Theme.of(context).textTheme.bodyMedium?.color,
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildNewsCard(Announcement announcement) {
    final Color tagColor = _resolveCardColor(announcement);
    final bool isPinned = announcement.priority == 'High';
    final String tagLabel = _displayTag(announcement);

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => NewsDetailsView(item: {
              'tag': tagLabel,
              'category': announcement.category,
              'priority': announcement.priority,
              'title': announcement.title,
              'description': announcement.content,
              'time': _formatTime(announcement.createdAt),
              'isPinned': isPinned,
              'color': tagColor,
              'content': announcement.content,
              'createdAt': announcement.createdAt.toIso8601String(),
              'author': announcement.author,
            }),
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
                width: 5,
                decoration: BoxDecoration(
                  color: tagColor,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(20),
                    bottomLeft: Radius.circular(20),
                  ),
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 20, 16, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: tagColor.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              tagLabel,
                              style: TextStyle(
                                color: Theme.of(context).brightness == Brightness.dark
                                    ? tagColor.withOpacity(0.9)
                                    : tagColor,
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          Icon(
                            isPinned ? Icons.push_pin : Icons.share_outlined,
                            color: isPinned ? const Color(0xFF926B25) : Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.5),
                            size: 20,
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        announcement.title,
                        style: TextStyle(
                          color: Theme.of(context).textTheme.bodyLarge?.color,
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          height: 1.2,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        announcement.content,
                        style: TextStyle(
                          color: Theme.of(context).textTheme.bodyMedium?.color,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          height: 1.4,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Icon(
                            Icons.access_time_filled,
                            size: 14,
                            color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.5),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            _formatTime(announcement.createdAt),
                            style: TextStyle(
                              color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.7),
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDateSectionHeader(String label) {
    return Row(
      children: [
        Text(
          label,
          style: TextStyle(
            color: Theme.of(context).textTheme.bodyLarge?.color,
            fontSize: 14,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.3,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Container(
            height: 1,
            color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.2),
          ),
        ),
      ],
    );
  }

  String _formatTime(DateTime time) {
    final localNow = DateTime.now().toLocal();
    final localTime = time.toLocal();
    final today = DateTime(localNow.year, localNow.month, localNow.day);
    final createdDay = DateTime(localTime.year, localTime.month, localTime.day);
    final diffDays = today.difference(createdDay).inDays;

    // Keep labels consistent with calendar-day group buckets.
    if (diffDays <= 0) {
      final difference = localNow.difference(localTime);
      if (difference.inHours >= 1) {
        return '${difference.inHours} hour${difference.inHours == 1 ? '' : 's'} ago';
      }
      final mins = difference.inMinutes < 1 ? 1 : difference.inMinutes;
      return '$mins min ago';
    }
    if (diffDays == 1) return 'Yesterday';
    if (diffDays <= 7) {
      return '$diffDays days ago';
    }
    return 'Older';
  }

  Color _categoryColor(String category) {
    final normalized = category.toLowerCase().trim();
    if (normalized.contains('health alert') || normalized.contains('urgent') || normalized.contains('emergency')) {
      return const Color(0xFFEF4444);
    }
    if (normalized.contains('event')) {
      return const Color(0xFFF59E0B);
    }
    if (normalized.contains('health') || normalized.contains('medical')) {
      return const Color(0xFFF59E0B);
    }
    return const Color(0xFF10B981);
  }
}
