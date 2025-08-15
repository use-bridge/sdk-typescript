"use client"

import * as React from "react"
import { CacheProvider } from "@emotion/react"
import createCache from "@emotion/cache"
import { useServerInsertedHTML } from "next/navigation"
import { CssBaseline, ThemeProvider } from "@mui/material"
import { theme } from "../theme"

export default function MuiProviders({ children }: { children: React.ReactNode }) {
  const [{ cache, flush }] = React.useState(() => {
    const cache = createCache({ key: "mui", prepend: true })
    cache.compat = true

    type InsertFn = typeof cache.insert
    const prevInsert: InsertFn = cache.insert.bind(cache)

    let inserted: string[] = []

    cache.insert = ((...args: Parameters<InsertFn>) => {
      const serialized = args[1] as { name: string }
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name)
      }
      return prevInsert(...args)
    }) as InsertFn

    const flush = () => {
      const prev = inserted
      inserted = []
      return prev
    }

    return { cache, flush }
  })

  useServerInsertedHTML(() => {
    const names = flush()
    if (names.length === 0) return null
    const css = names.map((n) => cache.inserted[n]).join("")
    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: css }}
      />
    )
  })

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  )
}
