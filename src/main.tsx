import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createTheme, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import App from './App';
import './index.css';

const theme = createTheme({ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', primaryColor: 'indigo', defaultRadius: 'md' });
createRoot(document.getElementById('root')!).render(<StrictMode><MantineProvider theme={theme}><App /></MantineProvider></StrictMode>);
