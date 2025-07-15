"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
type UIStyle = 'ordinary' | 'glass'

interface ThemeContextType {
  theme: Theme
  uiStyle: UIStyle
  setTheme: (theme: Theme) => void
  setUIStyle: (style: UIStyle) => void
  toggleTheme: () => void
  toggleUIStyle: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [uiStyle, setUIStyle] = useState<UIStyle>('glass')

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme
    const savedUIStyle = localStorage.getItem('uiStyle') as UIStyle
    
    if (savedTheme) setTheme(savedTheme)
    if (savedUIStyle) setUIStyle(savedUIStyle)
  }, [])

  useEffect(() => {
    // Save to localStorage and apply to document
    localStorage.setItem('theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    // Save UI style to localStorage and apply to document
    localStorage.setItem('uiStyle', uiStyle)
    document.documentElement.classList.toggle('glass-ui', uiStyle === 'glass')
  }, [uiStyle])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

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

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 