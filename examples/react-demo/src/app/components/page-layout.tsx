"use client"

import React, { type FC, type PropsWithChildren } from "react"
import { Grid, List, ListItem, ListItemButton, ListItemText } from "@mui/material"

const NavLink = ({ href, label, target }: { href: string; label: string; target?: string }) => (
  <ListItem disablePadding>
    <ListItemButton href={href} target={target}>
      <ListItemText>{label}</ListItemText>
    </ListItemButton>
  </ListItem>
)

export const PageLayout: FC<PropsWithChildren> = ({ children }) => (
  <Grid container spacing={2} sx={{ width: "100vw", height: "100vh" }}>
    <Grid size={{ xs: 4, sm: 3, md: 2 }} sx={{ backgroundColor: "grey.50" }}>
      <List>
        <NavLink href="https://github.com/use-bridge/sdk" label="GitHub" target="_blank" />
        <NavLink href="/soft-eligibility" label="Soft Eligibility" />
        <NavLink href="/hard-eligibility" label="Hard Eligibility" />
      </List>
    </Grid>
    <Grid size={{ xs: 8, sm: 9, md: 10 }} sx={{ p: 4 }}>
      {children}
    </Grid>
  </Grid>
)
