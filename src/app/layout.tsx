import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// import db from '../lib/supabase/db';
import { ThemeProvider } from '@/lib/providers/next-theme-provider';
// db
import {DM_Sans} from 'next/font/google'
import { twMerge } from 'tailwind-merge';
import AppStateProvider from '@/lib/providers/state-provider';
import { SupabaseUserProvider } from '@/lib/providers/supabase-user-provider';
import { SocketProvider } from '@/lib/providers/socket-provider';

// const inter = Inter({ subsets: ['latin'] })
const inter = DM_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'i am gonna make it',
  description: '1 million till i turn 25',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={twMerge("bg-background",inter.className)}>
        <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
          <AppStateProvider>
            <SupabaseUserProvider>
              <SocketProvider>
                 {children}
              </SocketProvider>
            </SupabaseUserProvider>
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
