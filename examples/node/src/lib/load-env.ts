import dotenv from "dotenv"

// Missing files are ignored. `.env.local` wins over `.env` for duplicate keys.
dotenv.config({ path: ".env.local" })
dotenv.config({ path: ".env" })
