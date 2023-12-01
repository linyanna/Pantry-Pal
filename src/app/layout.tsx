import { ThemeProvider } from "@/src/components/theme-provider"
import { GeistSans } from 'geist/font'
import './globals.css'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Pantry Pal',
  description: 'An IoT based inventory management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background text-foreground">
      <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
        <main className="min-h-screen flex flex-col items-center">
          {children}
        </main>
      </ThemeProvider>
      </body>
    </html>
  )
}
