import 'package:flutter/material.dart';
import '../utils/theme.dart';

class NewsDetailsView extends StatelessWidget {
  final Map<String, dynamic> item;

  const NewsDetailsView({Key? key, required this.item}) : super(key: key);

  Color _resolveTagColor() {
    final rawTag = (item['tag'] ?? item['category'] ?? '').toString().toLowerCase().trim();
    final rawTitle = (item['title'] ?? '').toString().toLowerCase();
    final rawContent = (item['content'] ?? item['description'] ?? '').toString().toLowerCase();
    final rawPriority = (item['priority'] ?? '').toString().toLowerCase().trim();

    final isAlert = rawTag.contains('health alert') ||
        rawTag.contains('urgent') ||
        rawTag.contains('emergency') ||
        rawTitle.contains('urgent') ||
        rawTitle.contains('emergency') ||
        rawContent.contains('urgent') ||
        rawContent.contains('emergency') ||
        rawPriority == 'high';

    if (isAlert) return const Color(0xFFEF4444);
    if (rawTag.contains('event')) return const Color(0xFFF59E0B);
    return const Color(0xFFEF4444);
  }

  @override
  Widget build(BuildContext context) {
    final tagColor = item['color'] is Color ? item['color'] as Color : _resolveTagColor();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final createdAt = item['createdAt'] != null ? DateTime.tryParse(item['createdAt'] as String) : null;
    final postedText = createdAt != null ? '${createdAt.month}/${createdAt.day}/${createdAt.year}' : 'N/A';

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
          'Announcement',
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
                      item['tag'] ?? 'HEALTH ALERT',
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
                    item['title'] ?? 'Announcement',
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
                        'Posted: $postedText',
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
                        'Status: ${item['tag'] ?? 'N/A'}',
                        style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Divider(color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.1)),
                  const SizedBox(height: 20),
                  Text(
                    item['content'] ?? item['description'] ?? 'No additional details available.',
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
                      color: isDark ? const Color(0xFF0F3224) : const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: IntrinsicHeight(
                      child: Row(
                        children: [
                          Container(
                            width: 6,
                            decoration: const BoxDecoration(
                              color: Color(0xFF059669),
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
                                'Huwag balewalain ang anumang sintomas. Kung makaranas ng mataas na lagnat sa loob ng higit sa dalawang araw, agad na pumunta sa ating Health Center o pinakamalapit na pagamutan para sa wastong pagsusuri at gamutan. Ang maagang pagtukoy sa sakit ay susi sa mabilis na paggaling.',
                                style: TextStyle(
                                  color: isDark ? const Color(0xFF6EE7B7) : const Color(0xFF064E3B),
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
                            'POSTED BY:',
                            style: TextStyle(
                              color: Theme.of(context).textTheme.bodyMedium?.color,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                            ),
                          ),
                          Text(
                            item['author'] ?? 'Barangay Health Center',
                            style: const TextStyle(
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
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.primaryBlue,
                        side: const BorderSide(color: AppTheme.primaryBlue, width: 1.5),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {},
                      icon: const Icon(Icons.share),
                      label: const Text(
                        'Share this Announcement',
                        style: TextStyle(fontWeight: FontWeight.w700),
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
