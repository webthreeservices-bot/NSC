import 'next/server'

declare module 'next/server' {
  interface NextRequest {
    /** optional IP helper added by server middleware */
    ip?: string
  }
}
