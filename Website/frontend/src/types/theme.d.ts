import React from 'react';
import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      glass: React.CSSProperties;
      gradient: React.CSSProperties;
    };
  }
  interface ThemeOptions {
    custom?: {
      glass?: React.CSSProperties;
      gradient?: React.CSSProperties;
    };
  }
}
