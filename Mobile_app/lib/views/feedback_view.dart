import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/theme.dart';

class FeedbackView extends StatefulWidget {
  const FeedbackView({Key? key}) : super(key: key);

  @override
  State<FeedbackView> createState() => _FeedbackViewState();
}

class _FeedbackViewState extends State<FeedbackView> {
  int _selectedRating = 3; // 0: Awful, 1: Bad, 2: Okay, 3: Good, 4: Great
  final TextEditingController _feedbackController = TextEditingController();

  final List<Map<String, dynamic>> _ratings = [
    {'icon': Icons.sentiment_very_dissatisfied, 'label': 'AWFUL'},
    {'icon': Icons.sentiment_dissatisfied, 'label': 'BAD'},
    {'icon': Icons.sentiment_neutral, 'label': 'OKAY'},
    {'icon': Icons.sentiment_satisfied, 'label': 'GOOD'},
    {'icon': Icons.sentiment_very_satisfied, 'label': 'GREAT'},
  ];

  @override
  void dispose() {
    _feedbackController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = Theme.of(context).textTheme.bodyLarge?.color ?? Colors.black;
    final textMutedColor = Theme.of(context).textTheme.bodyMedium?.color ?? Colors.grey;
    final primaryColor = isDark ? AppTheme.primaryLight : AppTheme.primaryBlue;
    final surfaceColor = Theme.of(context).colorScheme.surface;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: textColor),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Your voice matters.',
                style: GoogleFonts.inter(
                  fontSize: 32,
                  fontWeight: FontWeight.w800,
                  color: primaryColor,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Help us shape the future of health in our community. Share your thoughts, issues, or high-fives with us.',
                style: GoogleFonts.inter(
                  fontSize: 15,
                  color: textMutedColor,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 32),
              
              // Experience Rating Box
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: surfaceColor,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'How was your experience today?',
                      style: GoogleFonts.inter(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: textColor,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Tap to select your rating',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: textMutedColor,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: List.generate(_ratings.length, (index) {
                        final isSelected = index == _selectedRating;
                        return GestureDetector(
                          onTap: () {
                            setState(() {
                              _selectedRating = index;
                            });
                          },
                          child: Column(
                            children: [
                              AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: isSelected 
                                      ? const Color(0xFFF59E0B) // Amber
                                      : Theme.of(context).scaffoldBackgroundColor,
                                  shape: BoxShape.circle,
                                  boxShadow: isSelected ? [
                                    BoxShadow(
                                      color: const Color(0xFFF59E0B).withOpacity(0.3),
                                      blurRadius: 8,
                                      offset: const Offset(0, 4),
                                    )
                                  ] : null,
                                ),
                                child: Icon(
                                  _ratings[index]['icon'],
                                  color: isSelected ? Colors.white : (isDark ? Colors.grey[400] : const Color(0xFF8B5A2B)), // Brownish tint for inactive emojis
                                  size: 32,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                _ratings[index]['label'],
                                style: GoogleFonts.inter(
                                  fontSize: 10,
                                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                  color: isSelected ? textColor : textMutedColor,
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              
              // Tell Us More Box
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: surfaceColor,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Tell us more',
                      style: GoogleFonts.inter(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: textColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Whether it\'s a bug, or a suggestion for a new feature, we\'re all ears.',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: textMutedColor,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 20),
                    Container(
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: TextField(
                        controller: _feedbackController,
                        maxLines: 5,
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          color: textColor,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Write your thoughts here...',
                          hintStyle: GoogleFonts.inter(
                            color: textMutedColor.withOpacity(0.6),
                          ),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.all(16),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          // Submit feedback logic
                          Navigator.pop(context);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryColor,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                          elevation: 0,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Submit Feedback',
                              style: GoogleFonts.inter(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Icon(Icons.send, size: 18),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Center(
                      child: RichText(
                        text: TextSpan(
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: textMutedColor,
                          ),
                          children: [
                            const TextSpan(text: 'By submitting, you agree to our '),
                            TextSpan(
                              text: 'Feedback Policy.',
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                color: primaryColor,
                                decoration: TextDecoration.underline,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              
              // Need help instead
              _buildInfoCard(
                context,
                icon: Icons.help_center,
                title: 'Need help instead?',
                subtitle: 'Check our FAQs or chat with a support representative.',
                bgColor: isDark ? primaryColor.withOpacity(0.1) : AppTheme.primarySoft,
                iconColor: primaryColor,
              ),
              const SizedBox(height: 16),
              
              // Impact Tracker
              _buildInfoCard(
                context,
                icon: Icons.emoji_events,
                title: 'Impact Tracker',
                subtitle: 'We\'ve implemented 12 community suggestions this month!',
                bgColor: isDark ? const Color(0xFFD97706).withOpacity(0.1) : const Color(0xFFFEF3C7),
                iconColor: const Color(0xFFD97706), // Amber
              ),
              const SizedBox(height: 48),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoCard(BuildContext context, {
    required IconData icon, 
    required String title, 
    required String subtitle, 
    required Color bgColor,
    required Color iconColor,
  }) {
    final textColor = Theme.of(context).textTheme.bodyLarge?.color ?? Colors.black;
    final textMutedColor = Theme.of(context).textTheme.bodyMedium?.color ?? Colors.grey;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Theme.of(context).scaffoldBackgroundColor,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: textColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: textMutedColor,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
