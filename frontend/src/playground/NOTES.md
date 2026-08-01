# FE-05: Accessible Component Fundamentals Audit & Notes

## Overview
This document compares custom hand-crafted accessible components (Modal, Tabs, Disclosure) against production primitives from `shadcn/ui` (Radix UI engine).

---

## Key Gaps Identified in Hand-Crafted Implementations vs. shadcn/ui

### Gap 1: Portal Rendering & z-index Isolation (Modal Dialog)
* **Hand-Crafted Issue:** The hand-crafted `Modal` renders directly inline within its parent DOM tree hierarchy. If a parent container has CSS styles like `overflow: hidden`, `transform`, or low `z-index`, the modal backdrop clips or gets hidden behind other elements.
* **shadcn/ui Solution:** Uses Radix UI `@radix-ui/react-dialog` with `DialogPortal`. It renders the modal backdrop and overlay dynamically into `document.body` outside the main React DOM tree, preventing CSS context breaking.

### Gap 2: Body Scroll Locking & Inert Background (Modal Dialog)
* **Hand-Crafted Issue:** When our custom modal opens, users can still scroll the background document behind the dark overlay. Additionally, screen readers can technically navigate out of the modal if `aria-hidden` isn't applied to external content nodes.
* **shadcn/ui Solution:** `shadcn/ui` automatically applies `pointer-events: none` and `overflow: hidden` to the `<body>` element when active, preventing scroll bleed and applying `data-aria-hidden="true"` to root app containers for screen readers.

### Gap 3: Automatic Focus Memory & Async Element Handling
* **Hand-Crafted Issue:** Our manual `previousFocusRef` relies on a `setTimeout` hack to trap focus. If the trigger element unmounts or gets re-rendered dynamically during open state, focus drops back to `document.body` upon modal close.
* **shadcn/ui Solution:** Manages focus state via robust internal focus guards (`FocusScope`) that gracefully resolve trigger element unmounts and ensure robust keyboard focus recovery regardless of dynamic state changes.

---

## Verification Criteria Sign-off
* [x] **Full Keyboard Operation:** Tested via Tab, Shift+Tab, Escape, Home, End, and Arrow Keys.
* [x] **Focus Management:** Modal traps focus on open and returns focus to trigger on close.
* [x] **TypeScript Compliance:** Strict TypeScript interfaces without using `any` prop types.