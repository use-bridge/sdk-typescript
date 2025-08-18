import React from "react"
import MuiProviders from "./components/mui-providers"
import { BridgeProvider } from "./components/bridge-provider"
import { PageLayout } from "./components/page-layout"

export const metadata = {
  title: "Bridge SDK Demo",
  description: "Minimal demo app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BridgeProvider>
          <MuiProviders>
            <PageLayout>{children}</PageLayout>
            <pre>Hello</pre>
          </MuiProviders>
        </BridgeProvider>
      </body>
    </html>
  )
}
