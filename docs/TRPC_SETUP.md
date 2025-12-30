# tRPC Setup & React 19 Compatibility

## Current Status

Due to a React 19 compatibility issue with `createTRPCReact` during Next.js build time, the `TRPCProvider` has been removed from the root layout to allow the build to succeed.

**The Issue:**
- `createTRPCReact` uses React's `createContext` at module load time
- During Next.js build, this causes `TypeError: (0 , d.createContext) is not a function`
- This affects pages that don't even use tRPC (like login/signup)

**The Workaround:**
- TRPCProvider is not in the root layout
- Add TRPCProvider only to pages/components that actually use tRPC

## How to Use tRPC in Your Pages

### Option 1: Add TRPCProvider to Specific Layouts

Create a layout for pages that need tRPC:

```typescript
// src/app/dashboard/layout.tsx
"use client";

import { TRPCProvider } from "@/lib/trpc/react-client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TRPCProvider>{children}</TRPCProvider>;
}
```

### Option 2: Add TRPCProvider to Specific Pages

Wrap components that use tRPC:

```typescript
// src/app/some-page/page.tsx
import { TRPCProvider } from "@/lib/trpc/react-client";
import { MyComponent } from "./my-component";

export default function SomePage() {
  return (
    <TRPCProvider>
      <MyComponent />
    </TRPCProvider>
  );
}
```

### Option 3: Create a Client Component Wrapper

```typescript
// src/components/providers/with-trpc.tsx
"use client";

import { TRPCProvider } from "@/lib/trpc/react-client";

export function WithTRPC({ children }: { children: React.ReactNode }) {
  return <TRPCProvider>{children}</TRPCProvider>;
}
```

Then use it in pages that need tRPC.

## Using tRPC Hooks

Once wrapped with TRPCProvider, you can use tRPC hooks:

```typescript
"use client";

import { api } from "@/lib/trpc/react-client";

export function MyComponent() {
  const { data } = api.curriculum.getAvailableTools.useQuery({
    strandId: "BIB.1"
  });
  
  return <div>{/* Use data */}</div>;
}
```

## Future Fix

This is a known issue with React 19 + tRPC v11 + Next.js 16. Potential solutions:

1. Wait for tRPC/Next.js updates with better React 19 support
2. Use a different tRPC setup pattern
3. Consider downgrading to React 18 if tRPC is critical for all pages

## Files

- `src/lib/trpc/react-client.tsx` - tRPC client setup (use this, not the old react.tsx)
- `src/components/providers/` - Provider components (currently unused but available)

