import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';

export interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  disabled,
  ...props
}) => {
  return (
    <MuiButton
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : children}
    </MuiButton>
  );
};
