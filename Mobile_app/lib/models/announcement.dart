class Announcement {
  final String id;
  final String title;
  final String content;
  final String category;
  final String priority;
  final String? author;
  final DateTime createdAt;

  Announcement({
    required this.id,
    required this.title,
    required this.content,
    required this.category,
    required this.priority,
    required this.createdAt,
    this.author,
  });

  factory Announcement.fromJson(Map<String, dynamic> json) {
    return Announcement(
      id: json['_id'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      category: json['category'] as String,
      priority: json['priority'] as String? ?? 'Medium',
      author: json['author'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    final normalizedCategory = category.toLowerCase().trim();
    final normalizedPriority = priority.toLowerCase().trim();
    final isAlert = normalizedCategory.contains('health alert') ||
        normalizedCategory.contains('urgent') ||
      normalizedCategory.contains('emergency') ||
      normalizedPriority == 'high';

    return {
      'tag': category.toUpperCase(),
      'title': title,
      'description': content,
      'time': createdAt.toIso8601String(),
      'isPinned': normalizedPriority == 'high',
      'color': isAlert
          ? 0xFFEF4444
          : category == 'Event'
              ? 0xFFF59E0B
              : 0xFF10B981,
      'content': content,
      'author': author ?? 'Barangay Health Center',
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
