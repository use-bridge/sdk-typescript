import React from "react"
import MuiProviders from "./mui-providers"
import { BridgeProvider } from "./bridge-provider"

export const metadata = {
  title: "Bridge SDK Demo",
  description: "Minimal demo app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BridgeProvider>
          <MuiProviders>{children}</MuiProviders>
        </BridgeProvider>
      </body>
    </html>
  )
}
