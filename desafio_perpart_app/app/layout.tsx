import type { Metadata } from 'next';
import { UiProvider } from '@uigovpe/components';
import { Inter } from 'next/font/google';
import '@uigovpe/styles';
import './globals.css';

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
         * LayoutProvider com template='backoffice' fica no (app)/layout.tsx
         * para que as páginas de login/register NÃO herdem o layout do backoffice.
         */}
        <UiProvider>{children}</UiProvider>
      </body>
    </html>
  );
}
