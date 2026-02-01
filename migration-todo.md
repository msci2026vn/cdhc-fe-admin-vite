# Migration TODO List

## 🔥 Uu tien cao (ESLint Errors)

1. **Fix setState in effect** - `src/app/(dashboard)/dashboard/database/table/page.tsx:91`
   - Error: Calling setState synchronously within an effect can trigger cascading renders
   - Action: Move state update outside useEffect or use proper pattern

2. **Fix memoization** - `src/app/(dashboard)/dashboard/database/table/page.tsx:98`
   - Error: Existing memoization could not be preserved
   - Action: Review useMemo/useCallback usage

## ⚠️ Uu tien trung binh (ESLint Warnings)

3. **Fix useEffect deps** - `src/app/(dashboard)/layout.tsx:49`
   - Warning: Missing dependencies in useEffect
   - Action: Add missing deps or restructure effect

4. **Review memoization** - `src/app/(dashboard)/dashboard/database/table/page.tsx`
   - Warning: Could not preserve existing manual memoization
   - Action: Simplify memoization pattern

5. **React Hook Form compat** - `src/components/staff/StaffForm.tsx:160`
   - Warning: `watch()` cannot be memoized safely
   - Action: Consider `useWatch()` hook instead

6. **Verify staff/[id] route** - Dynamic route `/staff/[id]` from Next.js
   - Check if Vite router has corresponding `/staff/:id` route
   - May need to add if staff detail page exists

## 📝 Uu tien thap (Polish)

7. **Fix react-refresh warnings** - `badge.tsx`, `button.tsx`
   - Warning: Files export both components and non-components (variants)
   - Action: Move `badgeVariants`/`buttonVariants` to separate files (optional)

8. **Optimize large chunks**
   - `page-BloUtDuq.js` is 691.93 kB (gzip: 238 kB)
   - Action: Consider code-splitting or manual chunks in vite.config.ts

9. **Remove legacy assets**
   - `public/next.svg` - No longer needed
   - `public/vercel.svg` - No longer needed (unless used elsewhere)

10. **Review `typeof window` checks**
    - `src/stores/authStore.ts:140` - `typeof window !== 'undefined'`
    - In Vite SPA this is always true, check is unnecessary but harmless
