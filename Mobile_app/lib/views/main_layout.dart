import 'package:flutter/material.dart';
import '../utils/theme.dart';
import 'home_view.dart';
import 'health_view.dart';
import 'event_view.dart';
import 'profile_view.dart';
import 'news_view.dart';

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _currentIndex = 0;

  // The screens that correspond to the tabs
  List<Widget> _screens() {
    return [
      HomeView(
        onNavigateToProfileTab: () => _onTabTapped(4),
        onNavigateToEventTab: () => _onTabTapped(2),
      ),
      const HealthView(),
      const EventView(),
      const NewsView(),
      const ProfileView(),
    ];
  }

  void _onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: _currentIndex == 4 ? null : _buildSharedAppBar(context),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens(),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -5),
            )
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: _onTabTapped,
          backgroundColor: Theme.of(context).colorScheme.surface,
          selectedItemColor: AppTheme.primaryBlue,
          unselectedItemColor: Theme.of(context).textTheme.bodyMedium?.color,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 11),
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_filled),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.favorite),
              label: 'Health',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.calendar_month),
              label: 'Event',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.campaign),
              label: 'News',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }

  PreferredSizeWidget? _buildSharedAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      elevation: 0,
      scrolledUnderElevation: 2, 
      shadowColor: Colors.black.withOpacity(0.1),
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppTheme.primaryBlue.withOpacity(0.5), width: 1.0),
            ),
            child: const Icon(Icons.health_and_safety, color: AppTheme.primaryBlue, size: 16),
          ),
          const SizedBox(width: 8),
          const Text(
            'CHEMS',
            style: TextStyle(
              color: AppTheme.primaryBlue,
              fontWeight: FontWeight.w800,
              fontSize: 20,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.notifications, color: AppTheme.primaryBlue),
          onPressed: () {},
        ),
        const SizedBox(width: 8),
      ],
    );
  }
}
