import NextAuth from "next-auth"
import { authOptions } from "../../../../auth"

// En NextAuth 4.x, el resultado de NextAuth(authOptions) es un objeto con
// métodos para manejar HTTP GET y POST. No podemos llamarlo directamente.
const handler = NextAuth(authOptions)

// Exportamos los handles como handlers de App Router
export { handler as GET, handler as POST } 