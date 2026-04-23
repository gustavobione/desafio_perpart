import type { Metadata } from 'next';
import { GovBar, UiProvider } from '@uigovpe/components';
import { Inter } from 'next/font/google';
import '@uigovpe/styles';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ludoboard — Aluguel de Jogos de Tabuleiro',
  description: 'Plataforma de aluguel de jogos de tabuleiro do Governo de Pernambuco.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-br">
      <body className={`${inter.className} antialiased`}>
        {/*
         * UiProvider: provedor global de temas e contexto do UI-GovPE.
         * ThemeProvider: observa a classe `dark` que o GovBar gerencia.
         * LayoutProvider com template='backoffice' fica no (app)/layout.tsx.
         */}
        <UiProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </UiProvider>
      </body>
    </html>
  );
}
