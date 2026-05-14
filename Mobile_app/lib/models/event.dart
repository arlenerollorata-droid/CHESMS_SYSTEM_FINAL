class EventItem {
  final String id;
  final String title;
  final String? description;
  final String date;
  final String? startTime;
  final String? endTime;
  final String? location;
  final String category;
  final String status;
  final int capacityTotal;
  final int capacityTaken;

  EventItem({
    required this.id,
    required this.title,
    required this.date,
    required this.category,
    required this.status,
    required this.capacityTotal,
    required this.capacityTaken,
    this.description,
    this.startTime,
    this.endTime,
    this.location,
  });

  factory EventItem.fromJson(Map<String, dynamic> json) {
    return EventItem(
      id: json['_id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      date: json['date'] as String,
      startTime: json['startTime'] as String?,
      endTime: json['endTime'] as String?,
      location: json['location'] as String?,
      category: json['category'] as String? ?? 'General',
      status: json['status'] as String? ?? 'Upcoming',
      capacityTotal: json['capacityTotal'] is int ? json['capacityTotal'] as int : int.tryParse(json['capacityTotal']?.toString() ?? '') ?? 0,
      capacityTaken: json['capacityTaken'] is int ? json['capacityTaken'] as int : int.tryParse(json['capacityTaken']?.toString() ?? '') ?? 0,
    );
  }
}
