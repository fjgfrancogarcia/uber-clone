import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    role: "USER" | "DRIVER" | "ADMIN"
  }

  interface Session {
    user: {
      id: string
      role: "USER" | "DRIVER" | "ADMIN"
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
} 