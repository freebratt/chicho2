import './globals.css'
import type { Metadata } from 'next'
import { Inter, Orbitron, Russo_One } from 'next/font/google'
import { AuthProvider } from '@/components/AuthProvider'
import { Toaster } from '@/components/ui/toaster'
import { ConvexClientProvider } from '@/components/convex-client-provider'
import AutoImageOptimizer from '@/components/AutoImageOptimizer'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-orbitron',
})

const russoOne = Russo_One({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-russo',
})

export const metadata: Metadata = {
  title: "CHICHO - Výrobný a Školiaci Portál",
  description: "Interný portál pre výrobné návody a školenia CHICHO s.r.o.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sk" className={`${inter.variable} ${orbitron.variable} ${russoOne.variable}`}>
      <body className={inter.className}>
        <ConvexClientProvider>
          <AuthProvider>
            {children}
            <Toaster />
            <AutoImageOptimizer 
              enableGlobalOptimization={true}
              showReport={false}
            />
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  )
}