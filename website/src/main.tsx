import { ThemeProvider } from '@/components/theme-provider';
import { PropsWithChildren } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app.tsx';
import { MeterApp } from './examples/meter/app.tsx';
import './index.css';

function Main({ children }: PropsWithChildren) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {children}
    </ThemeProvider>
  );
}

const root = createRoot(document.getElementById('app')!);
root.render(<Main>{import.meta.env.VITE_APP === 'meter' ? <MeterApp /> : <App />}</Main>);
