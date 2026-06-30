import React from 'react';
import { Container as MuiContainer, ContainerProps as MuiContainerProps } from '@mui/material';

export interface ContainerProps extends MuiContainerProps {
  // Add any custom props here if needed
}

export const Container: React.FC<ContainerProps> = ({ children, ...props }) => {
  return (
    <MuiContainer maxWidth="lg" {...props}>
      {children}
    </MuiContainer>
  );
};
