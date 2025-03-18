'use client';

import React from 'react';
import ChatInterface from '@/components/ChatInterface';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// 创建主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#10a37f', // ChatGPT的绿色主题
    },
    background: {
      default: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Söhne", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '4px',
        },
      },
    },
  },
});

export default function ChatPage() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChatInterface />
    </ThemeProvider>
  );
} 