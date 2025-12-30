# State Management Guidelines

## Current State Management Architecture ✅

The application uses a **clean, minimal state management approach** with no global state stores.

---

## State Patterns in Use

### 1. URL State (Nuqs) — Primary Pattern
**Usage**: User-facing state that should persist and be shareable

**Examples**:
- `studentId` - Active student selection
- `step` - Onboarding wizard progress

**Implementation**:
```typescript
import { useQueryState } from "nuqs";

const [activeStudentId, setActiveStudentId] = useQueryState("studentId");
```

**When to use**:
- ✅ Navigation state (tabs, filters, selections)
- ✅ Shareable state (URL should reflect app state)
- ✅ State that persists across refreshes
- ✅ State that affects server-side rendering

---

### 2. Component State (useState) — Local State
**Usage**: Transient UI state specific to a component

**Examples**:
- Modal open/close state
- Form input values (controlled components)
- Loading/error states
- Hover/focus states

**When to use**:
- ✅ Temporary UI interaction state
- ✅ Form inputs before submission
- ✅ Component-specific state
- ❌ State needed by multiple components (consider URL state)

---

### 3. Server State (RSC Props) — Preferred for Data
**Usage**: Data from the database or server

**Examples**:
- User data
- Student profiles
- Course information
- Dashboard data

**Implementation**:
```typescript
// Server Component
export default async function Page() {
  const data = await getServerData();
  return <ClientComponent data={data} />;
}
```

**When to use**:
- ✅ Database-derived data
- ✅ Authentication state
- ✅ Any server-computed values
- ✅ SEO-critical content

---

### 4. React Context — Minimal Use Only
**Current Usage**: 
- `StudentProfileProvider` - Wraps Nuqs for cleaner API
- UI component contexts (Tabs, etc.)

**When to use**:
- ⚠️ Only when absolutely necessary
- ⚠️ Theme/i18n requirements
- ⚠️ Deep prop drilling (rare with Server Components)
- ❌ Avoid for data fetching
- ❌ Avoid for most app state

---

## Architecture Decisions

### ✅ No Zustand
The application does NOT use Zustand or any global state management library. This is intentional:
- Server Components handle most data needs
- Nuqs handles URL state
- Component state handles UI interactions
- React Context is minimal

**Rationale**: Global state is rarely needed with Server Components and URL state.

### ✅ Nuqs for URL State
URL parameters are managed via Nuqs, providing:
- Type-safe URL state
- Automatic synchronization
- Shareable URLs
- SSR-friendly

**Convention**: Use `useQueryState` for any state that should be in the URL.

### ✅ Server Components First
Data fetching happens on the server whenever possible:
- Reduces client bundle size
- Better performance
- SEO-friendly
- Simpler data flow

---

## Common Patterns

### Pattern 1: Student Selection
```typescript
// Provider wraps Nuqs
export function StudentProfileProvider({ children }) {
    const [activeStudentId, setActiveStudentId] = useQueryState("studentId");
    
    return (
        <StudentProfileContext.Provider value={{
            activeStudentId,
            setActiveStudentId,
            isStudentContext: !!activeStudentId // Derived state
        }}>
            {children}
        </StudentProfileContext.Provider>
    );
}

// Usage in components
const { activeStudentId, setActiveStudentId } = useStudentProfile();
```

### Pattern 2: Modal State
```typescript
// Local component state for UI
function MyComponent() {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <>
            <Button onClick={() => setIsOpen(true)}>Open</Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                {/* Modal content */}
            </Dialog>
        </>
    );
}
```

### Pattern 3: Server Data + Client Interaction
```typescript
// Server Component fetches data
async function ServerPage() {
    const data = await getData();
    return <ClientComponent data={data} />;
}

// Client Component handles interaction
"use client";
function ClientComponent({ data }) {
    const [selected, setSelected] = useState(null);
    return <div>{/* Render data with interaction */}</div>;
}
```

---

## Anti-Patterns to Avoid

### ❌ Don't: Create Zustand Stores
```typescript
// ❌ AVOID
import { create } from 'zustand';
const useStore = create((set) => ({ ... }));
```
Use URL state (Nuqs) or Server Components instead.

### ❌ Don't: Fetch Data in useEffect
```typescript
// ❌ AVOID
useEffect(() => {
    fetchData().then(setData);
}, []);
```
Fetch in Server Components instead.

### ❌ Don't: Lift State Unnecessarily
```typescript
// ❌ AVOID - state too high in tree
function App() {
    const [modalOpen, setModalOpen] = useState(false);
    return <DeepChild setModalOpen={setModalOpen} />;
}
```
Keep state close to where it's used.

### ❌ Don't: Store Derived Values
```typescript
// ❌ AVOID
const [data, setData] = useState([]);
const [count, setCount] = useState(0); // Derived!

// ✅ INSTEAD
const [data, setData] = useState([]);
const count = data.length; // Computed
```

---

## Migration Guide

If you need to add new state:

1. **Ask**: Can this be Server Component data?
   - Yes → Fetch in Server Component
   - No → Continue

2. **Ask**: Should this be in the URL?
   - Yes → Use Nuqs `useQueryState`
   - No → Continue

3. **Ask**: Is this component-local UI state?
   - Yes → Use `useState`
   - No → Continue

4. **Ask**: Do multiple distant components need this?
   - Rare → Consider restructuring
   - If unavoidable → React Context (document why)

---

## Summary

**Current Architecture**: ✅ Clean and minimal
- No Zustand
- Nuqs for URL state
- Minimal React Context
- Server Components for data

**Guideline**: When in doubt, prefer Server Components > URL State > Component State > Context.
