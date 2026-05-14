import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color primaryBlue = Color(0xFF4169E1);
  static const Color primaryLight = Color(0xFF638EF1);
  static const Color primaryDark = Color(0xFF3154B3);
  static const Color primarySoft = Color(0xFFE8EFFF);
  
  static const Color surfaceColor = Color(0xFFF8FAFC);
  static const Color scaffoldBackgroundColor = Color(0xFFF4F8FF);

  static const Color textColor = Color(0xFF0F172A);
  static const Color textLightColor = Color(0xFF4B5563);
  static const Color textMutedColor = Color(0xFF9CA3AF);

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF2D93E8), Color(0xFF1F79C4)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static ThemeData get themeData {
    return ThemeData(
      primaryColor: primaryBlue,
      scaffoldBackgroundColor: scaffoldBackgroundColor,
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.w800, color: textColor),
        displayMedium: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.w700, color: textColor),
        bodyLarge: GoogleFonts.inter(fontSize: 16, color: textColor),
        bodyMedium: GoogleFonts.inter(fontSize: 14, color: textLightColor),
      ),
      colorScheme: const ColorScheme.light(
        primary: primaryBlue,
        secondary: primaryLight,
        surface: surfaceColor,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 8,
          shadowColor: const Color(0x421F79C4), // rgba(31, 121, 196, 0.26)
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFD9DEE7)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFD9DEE7)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFF2284D6), width: 1.5),
        ),
        labelStyle: GoogleFonts.inter(color: const Color(0xFF334155), fontWeight: FontWeight.w600),
        hintStyle: GoogleFonts.inter(color: const Color(0xFF9CA3AF)),
      ),
    );
  }
  static const Color darkBackgroundColor = Color(0xFF0F172A);
  static const Color darkSurfaceColor = Color(0xFF1E293B);

  static ThemeData get darkThemeData {
    return ThemeData(
      brightness: Brightness.dark,
      primaryColor: primaryBlue,
      scaffoldBackgroundColor: darkBackgroundColor,
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.w800, color: Colors.white),
        displayMedium: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.w700, color: Colors.white),
        bodyLarge: GoogleFonts.inter(fontSize: 16, color: Colors.white),
        bodyMedium: GoogleFonts.inter(fontSize: 14, color: const Color(0xFFcbd5e1)),
      ),
      colorScheme: const ColorScheme.dark(
        primary: primaryBlue,
        secondary: primaryLight,
        surface: darkSurfaceColor,
        background: darkBackgroundColor,
        onSurface: Colors.white,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 8,
          shadowColor: const Color(0x421F79C4), 
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: darkSurfaceColor,
        contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFF334155)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFF334155)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFF2284D6), width: 1.5),
        ),
        labelStyle: GoogleFonts.inter(color: const Color(0xFF94a3b8), fontWeight: FontWeight.w600),
        hintStyle: GoogleFonts.inter(color: const Color(0xFF64748b)),
      ),
    );
  }
}

