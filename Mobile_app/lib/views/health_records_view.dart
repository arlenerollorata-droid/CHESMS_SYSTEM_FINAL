import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../utils/theme.dart';
import '../services/api_service.dart';
import '../viewmodels/auth_viewmodel.dart';
import '../widgets/clinical_profile_widgets.dart';
import '../models/clinical_profile.dart';

class HealthRecordsView extends StatefulWidget {
  const HealthRecordsView({Key? key}) : super(key: key);

  @override
  State<HealthRecordsView> createState() => _HealthRecordsViewState();
}

class _HealthRecordsViewState extends State<HealthRecordsView> with TickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  Map<String, dynamic>? _patientProfile;
  CategoryMedicalHistory? _categoryMedicalHistory;
  bool _isLoading = true;
  bool _isCategoryLoading = false;
  String _searchQuery = '';
  late TabController _tabController;
  int _selectedTab = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(_onTabChanged);
    _loadHealthData();
  }

  void _onTabChanged() {
    setState(() {
      _selectedTab = _tabController.index;
    });
    
    // Load category data when switching to Clinical Profile tab
    if (_selectedTab == 1 && _categoryMedicalHistory == null) {
      _loadCategoryMedicalHistory();
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadHealthData() async {
    try {
      final authViewModel = Provider.of<AuthViewModel>(context, listen: false);
      final profile = await _apiService.fetchPatientProfileForUser(authViewModel.userData);
      if (mounted) {
        setState(() {
          _patientProfile = profile;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _loadCategoryMedicalHistory() async {
    if (_patientProfile == null) return;
    
    setState(() => _isCategoryLoading = true);
    try {
      final patientId = _patientProfile?['patientId'] ?? _patientProfile?['_id'];
      if (patientId == null) return;
      
      final data = await _apiService.fetchCategoryMedicalHistory(patientId.toString());
      if (data != null && mounted) {
        setState(() {
          _categoryMedicalHistory = CategoryMedicalHistory.fromJson(data);
          _isCategoryLoading = false;
        });
      } else if (mounted) {
        setState(() => _isCategoryLoading = false);
      }
    } catch (e) {
      print('Error loading category medical history: $e');
      if (mounted) {
        setState(() => _isCategoryLoading = false);
      }
    }
  }

  Future<void> _refreshData() async {
    setState(() => _isLoading = true);
    await _loadHealthData();
    if (_selectedTab == 1) {
      _categoryMedicalHistory = null;
      await _loadCategoryMedicalHistory();
    }
  }

  List<Map<String, dynamic>> _buildHealthRecords() {
    if (_patientProfile == null) return [];
    
    final records = <Map<String, dynamic>>[];
    final lastVisit = _patientProfile?['lastVisit'];
    final category = (_patientProfile?['category'] ?? '').toString().toLowerCase();
    
    // Add last visit record if available
    if (lastVisit != null) {
      try {
        final visitDate = DateTime.parse(lastVisit.toString());
        final now = DateTime.now();
        final daysDiff = now.difference(visitDate).inDays;
        String timeLabel = '';
        
        if (daysDiff == 0) {
          timeLabel = 'TODAY';
        } else if (daysDiff == 1) {
          timeLabel = 'YESTERDAY';
        } else if (daysDiff < 7) {
          timeLabel = 'LAST WEEK';
        } else if (daysDiff < 30) {
          timeLabel = 'LAST MONTH';
        } else {
          timeLabel = 'EARLIER';
        }
        
        records.add({
          'section': timeLabel,
          'icon': Icons.medical_services_outlined,
          'title': 'Last Visit to Barangay Health Center',
          'subtitle': '${visitDate.month}/${visitDate.day}/${visitDate.year}',
          'badge': 'Completed',
          'type': 'success',
        });
      } catch (_) {}
    }
    
    // Add health vitals
    final bp = _patientProfile?['bp']?.toString().trim();
    final bloodSugar = _patientProfile?['bloodSugar']?.toString().trim();
    final weight = _patientProfile?['weight']?.toString().trim();
    final height = _patientProfile?['height']?.toString().trim();
    
    if (bp != null && bp.isNotEmpty && bp != 'null' && bp != '') {
      records.add({
        'section': 'VITALS',
        'icon': Icons.favorite_outlined,
        'title': 'Blood Pressure (BP)',
        'subtitle': '$bp mmHg',
        'badge': 'Recorded',
        'type': 'neutral',
      });
    }
    
    if (bloodSugar != null && bloodSugar.isNotEmpty && bloodSugar != 'null' && bloodSugar != '') {
      records.add({
        'section': 'VITALS',
        'icon': Icons.science_outlined,
        'title': 'Blood Sugar Level',
        'subtitle': '$bloodSugar mg/dL',
        'badge': 'Recorded',
        'type': 'neutral',
      });
    }
    
    if (weight != null && weight.isNotEmpty && weight != 'null' && weight != '') {
      records.add({
        'section': 'VITALS',
        'icon': Icons.scale_outlined,
        'title': 'Weight',
        'subtitle': '$weight kg',
        'badge': 'Recorded',
        'type': 'neutral',
      });
    }
    
    if (height != null && height.isNotEmpty && height != 'null' && height != '') {
      records.add({
        'section': 'VITALS',
        'icon': Icons.straighten_outlined,
        'title': 'Height',
        'subtitle': '$height cm',
        'badge': 'Recorded',
        'type': 'neutral',
      });
    }
    
    // Add category-specific data
    if (category.contains('prenatal')) {
      final prenatal = _patientProfile?['prenatalData'] ?? {};
      final dueDate = prenatal['dueDate'];
      final gestationalWeek = prenatal['gestationalWeek'];
      
      if (dueDate != null) {
        records.add({
          'section': 'PRENATAL CARE',
          'icon': Icons.pregnant_woman_outlined,
          'title': 'Expected Due Date',
          'subtitle': dueDate.toString().split('T')[0],
          'badge': 'Week ${gestationalWeek ?? 'TBA'}',
          'type': 'success',
        });
      }
      
      final visitHistory = prenatal['visitHistory'] ?? [];
      if (visitHistory is List && visitHistory.isNotEmpty) {
        final lastPrenatalVisit = visitHistory.last;
        records.add({
          'section': 'PRENATAL CARE',
          'icon': Icons.calendar_today_outlined,
          'title': 'Last Prenatal Visit',
          'subtitle': lastPrenatalVisit['date']?.toString().split('T')[0] ?? 'No date',
          'badge': lastPrenatalVisit['week'] ?? 'Follow-up',
          'type': 'neutral',
        });
      }
    } else if (category.contains('tb')) {
      final tbData = _patientProfile?['tbDotsData'] ?? {};
      final treatmentPhase = tbData['treatmentPhase'];
      final adherencePercent = tbData['adherencePercent'];
      
      if (treatmentPhase != null) {
        records.add({
          'section': 'TB DOTS',
          'icon': Icons.health_and_safety_outlined,
          'title': 'Treatment Phase',
          'subtitle': treatmentPhase.toString(),
          'badge': '${adherencePercent ?? 0}% adherence',
          'type': 'warning',
        });
      }
    }
    
    // Add medical history if available
    final medicalHistory = _patientProfile?['medicalHistory'] ?? [];
    if (medicalHistory is List && medicalHistory.isNotEmpty) {
      for (var condition in medicalHistory.take(2)) {
        records.add({
          'section': 'MEDICAL HISTORY',
          'icon': Icons.assignment_outlined,
          'title': condition['condition'] ?? 'Medical Condition',
          'subtitle': condition['status'] ?? 'Active',
          'badge': condition['status'] ?? 'Active',
          'type': 'neutral',
        });
      }
    }
    
    // If no records, show placeholder
    if (records.isEmpty) {
      records.add({
        'section': 'NO DATA',
        'icon': Icons.info_outline,
        'title': 'No Health Records Yet',
        'subtitle': 'Visit the health center to get your first health check-up',
        'badge': 'Pending',
        'type': 'neutral',
      });
    }
    
    return records;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = Theme.of(context).textTheme.bodyLarge?.color ?? Colors.black;
    final textMutedColor = Theme.of(context).textTheme.bodyMedium?.color ?? Colors.grey;
    final primaryColor = isDark ? AppTheme.primaryLight : AppTheme.primaryBlue;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('My Health Records'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: textColor),
          onPressed: () => Navigator.pop(context),
        ),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Visit Records'),
            Tab(text: 'Clinical Profile'),
          ],
          labelColor: primaryColor,
          unselectedLabelColor: textMutedColor,
          indicatorColor: primaryColor,
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _refreshData,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _patientProfile == null
                ? const Center(child: Text('Unable to load health records'))
                : TabBarView(
                    controller: _tabController,
                    children: [
                      // Tab 1: Current Records/Vitals
                      _buildRecordsTab(primaryColor, textColor, textMutedColor, isDark),
                      // Tab 2: Clinical Profile
                      _buildClinicalProfileTab(),
                    ],
                  ),
      ),
    );
  }

  Widget _buildRecordsTab(Color primaryColor, Color textColor, Color textMutedColor, bool isDark) {
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
            child: Container(
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
                border: Border.all(
                  color: isDark ? const Color(0xFF334155) : const Color(0xFFF1F5F9),
                  width: 1.5,
                ),
              ),
              child: TextField(
                onChanged: (value) => setState(() => _searchQuery = value.toLowerCase()),
                decoration: InputDecoration(
                  hintText: 'Search your health records...',
                  hintStyle: GoogleFonts.inter(
                    color: textMutedColor,
                    fontSize: 15,
                  ),
                  prefixIcon: Icon(Icons.search, color: textMutedColor),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: _buildRecordsList(primaryColor, textColor, textMutedColor, isDark),
          ),
        ],
      ),
    );
  }

  Widget _buildClinicalProfileTab() {
    if (_isCategoryLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (_categoryMedicalHistory == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.medical_services_outlined,
              size: 64,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 16),
            Text(
              'No clinical profile data available',
              style: GoogleFonts.poppins(
                fontSize: 16,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: _loadCategoryMedicalHistory,
              child: const Text('Reload'),
            ),
          ],
        ),
      );
    }

    return CategoryClinicalProfileWidget(
      template: _categoryMedicalHistory!.template,
      categoryData: _categoryMedicalHistory!.patientData.categoryData,
      category: _categoryMedicalHistory!.patientData.category ?? 'Unknown',
    );
  }

  Widget _buildRecordsList(Color primaryColor, Color textColor, Color textMutedColor, bool isDark) {
    final records = _buildHealthRecords();
    final allSections = <String>{};
    
    for (var record in records) {
      allSections.add(record['section'] as String);
    }
    
    final sortedSections = allSections.toList();
    final sectionOrder = ['TODAY', 'YESTERDAY', 'LAST WEEK', 'LAST MONTH', 'EARLIER', 'VITALS', 'PRENATAL CARE', 'TB DOTS', 'MEDICAL HISTORY', 'NO DATA'];
    sortedSections.sort((a, b) {
      final indexA = sectionOrder.indexOf(a);
      final indexB = sectionOrder.indexOf(b);
      return (indexA >= 0 ? indexA : 999).compareTo(indexB >= 0 ? indexB : 999);
    });

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 12),
        ...sortedSections.expand((section) {
          var sectionRecords = records.where((r) => r['section'] == section).toList();
          
          if (_searchQuery.isNotEmpty) {
            sectionRecords = sectionRecords.where((r) => 
              r['title'].toString().toLowerCase().contains(_searchQuery) ||
              r['subtitle'].toString().toLowerCase().contains(_searchQuery)
            ).toList();
            
            if (sectionRecords.isEmpty) return [];
          }
          
          return [
            _buildSectionHeader(section, primaryColor),
            const SizedBox(height: 12),
            ...sectionRecords.map((record) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _buildRecordCard(
                context,
                icon: record['icon'],
                title: record['title'],
                subtitle: record['subtitle'],
                badgeText: record['badge'],
                badgeType: _getBadgeTypeFromString(record['type']),
                primaryColor: primaryColor,
              ),
            )),
            const SizedBox(height: 24),
          ];
        }).toList(),
        const SizedBox(height: 24),
      ],
    );
  }

  _BadgeType _getBadgeTypeFromString(String type) {
    switch (type) {
      case 'success':
        return _BadgeType.success;
      case 'warning':
        return _BadgeType.warning;
      default:
        return _BadgeType.neutral;
    }
  }

  Widget _buildSectionHeader(String text, Color primaryColor) {
    return Padding(
      padding: const EdgeInsets.only(left: 4.0, top: 8.0),
      child: Text(
        text,
        style: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: primaryColor,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildRecordCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required String badgeText,
    required _BadgeType badgeType,
    required Color primaryColor,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = Theme.of(context).textTheme.bodyLarge?.color ?? Colors.black;
    final textMutedColor = Theme.of(context).textTheme.bodyMedium?.color ?? Colors.grey;
    final surfaceColor = Theme.of(context).colorScheme.surface;

    // Define colors based on badge type
    Color badgeTextColor;
    Color badgeBgColor;

    switch (badgeType) {
      case _BadgeType.success:
        badgeTextColor = const Color(0xFF059669);
        badgeBgColor = isDark ? const Color(0xFF059669).withOpacity(0.15) : const Color(0xFFD1FAE5);
        break;
      case _BadgeType.warning:
        badgeTextColor = const Color(0xFFD97706);
        badgeBgColor = isDark ? const Color(0xFFD97706).withOpacity(0.15) : const Color(0xFFFEF3C7);
        break;
      case _BadgeType.neutral:
      default:
        badgeTextColor = textMutedColor;
        badgeBgColor = isDark ? const Color(0xFF334155) : const Color(0xFFF1F5F9);
        break;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? primaryColor.withOpacity(0.15) : AppTheme.primarySoft,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: primaryColor, size: 24),
          ),
          const SizedBox(width: 16),
          
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.inter(
                    color: textColor,
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: GoogleFonts.inter(
                    color: textMutedColor,
                    fontSize: 12,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: badgeBgColor,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              badgeText,
              style: GoogleFonts.inter(
                color: badgeTextColor,
                fontSize: 11,
                fontWeight: FontWeight.w700,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

enum _BadgeType { success, warning, neutral }
