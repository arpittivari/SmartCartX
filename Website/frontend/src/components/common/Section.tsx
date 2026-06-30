import React from 'react';
import { Box, BoxProps, useTheme } from '@mui/material';

export interface SectionProps extends BoxProps {
  variant?: 'default' | 'glass' | 'gradient';
}

export const Section: React.FC<SectionProps> = ({
  children,
  variant = 'default',
  sx,
  ...props
}) => {
  const theme = useTheme();

  let variantStyles = {};
  if (variant === 'glass') {
    variantStyles = theme.custom.glass;
  } else if (variant === 'gradient') {
    variantStyles = theme.custom.gradient;
  }

  return (
    <Box
      sx={{
        py: 4,
        px: 2,
        borderRadius: theme.shape.borderRadius,
        ...variantStyles,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
