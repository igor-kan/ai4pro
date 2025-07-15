/**
 * Theme Context Provider
 * 
 * Manages the application's dual theme system with two independent axes:
 * 1. Color Theme: Light vs Dark mode
 * 2. UI Style: Glass (glassmorphism) vs Ordinary (solid) styling
 * 
 * This creates 4 possible combinations:
 * - Light + Glass: Ethereal glassmorphism with light colors
 * - Light + Ordinary: Clean minimal design with light colors
 * - Dark + Glass: Dark glassmorphism with animated backgrounds
 * - Dark + Ordinary: Professional dark theme with solid backgrounds
 * 
 * Features:
 * - Persistent storage in localStorage
 * - Automatic CSS class application to document
 * - Toggle functions for easy switching
 * - Type-safe context with custom hook
 */

"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

// Type definitions for theme system
type Theme = 'light' | 'dark'
type UIStyle = 'ordinary' | 'glass'

/**
 * Theme Context Interface
 * Provides complete theme management functionality
 */
interface ThemeContextType {
  theme: Theme                    // Current color theme (light/dark)
  uiStyle: UIStyle               // Current UI style (ordinary/glass)
  setTheme: (theme: Theme) => void       // Direct theme setter
  setUIStyle: (style: UIStyle) => void   // Direct UI style setter
  toggleTheme: () => void                // Toggle between light/dark
  toggleUIStyle: () => void              // Toggle between ordinary/glass
}

// Create the theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * Theme Provider Component
 * 
 * Wraps the application to provide theme management functionality.
 * Handles:
 * - Initial theme loading from localStorage
 * - Persistence of theme changes
 * - CSS class application for styling
 * - State management for both theme axes
 * 
 * @param children - React nodes to wrap with theme context
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // State for color theme (light/dark)
  const [theme, setTheme] = useState<Theme>('light')
  // State for UI style (ordinary/glass)
  const [uiStyle, setUIStyle] = useState<UIStyle>('glass')

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    const savedUIStyle = localStorage.getItem('uiStyle') as UIStyle
    
    if (savedTheme) setTheme(savedTheme)
    if (savedUIStyle) setUIStyle(savedUIStyle)
  }, [])

  // Handle theme changes - save to localStorage and apply CSS classes
  useEffect(() => {
    localStorage.setItem('theme', theme)
    // Apply 'dark' class to document root for CSS targeting
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Handle UI style changes - save to localStorage and apply CSS classes
  useEffect(() => {
    localStorage.setItem('uiStyle', uiStyle)
    // Apply 'glass-ui' class to document root for glassmorphism styling
    document.documentElement.classList.toggle('glass-ui', uiStyle === 'glass')
  }, [uiStyle])

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  /**
   * Toggle between ordinary and glass UI styles
   */
  const toggleUIStyle = () => {
    setUIStyle(uiStyle === 'ordinary' ? 'glass' : 'ordinary')
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      uiStyle,
      setTheme,
      setUIStyle,
      toggleTheme,
      toggleUIStyle
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Custom hook for accessing theme context
 * 
 * Provides type-safe access to theme state and functions.
 * Must be used within a ThemeProvider component.
 * 
 * @throws Error if used outside of ThemeProvider
 * @returns ThemeContextType with all theme management functions
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 