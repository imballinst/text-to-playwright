import { ThemeProvider } from '@/components/theme-provider';
import { render } from 'preact';
import { PropsWithChildren } from 'preact/compat';
import { App } from './app.tsx';
import './index.css';

function Main({ children }: PropsWithChildren) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {children}
    </ThemeProvider>
  );
}

export default App;

render(
  <Main>
    <App />
  </Main>,
  document.getElementById('app')!
);
