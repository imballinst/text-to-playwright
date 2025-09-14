import { ThemeProvider } from '@/components/theme-provider';
import { PropsWithChildren } from 'react';
import { createRoot } from 'react-dom/client';
import '../../index.css';
import './app.css';
import { TableApp } from './app.tsx';

function Main({ children }: PropsWithChildren) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {children}
    </ThemeProvider>
  );
}

const root = createRoot(document.getElementById('app')!);
root.render(
  <Main>
    <TableApp />
  </Main>
);
