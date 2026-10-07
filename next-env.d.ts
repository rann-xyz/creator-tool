/// <reference types="vite/client" />

// Type declarations for Next.js
declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string
    AUTH_SECRET: string
    NEXTAUTH_URL: string
  }
}

declare module '*.css' {
  const content: string
  export default content
}

declare module '*.svg' {
  import React from 'react'
  const content: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  export default content
}