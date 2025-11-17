# Ticket Page Implementation Plan

## Overview
Implement the ticket selection page based on Figma design (node-id: 151-82) with full internationalization support.

## Design Analysis

### Visual Elements
- **Background**: Dark, intricate Vietnamese cultural motifs
- **Three Ticket Tiers**: Displayed horizontally as cards
- **Card Structure**:
  - Decorative scroll elements (top/bottom)
  - Banner image at top
  - Tier name (Tier 1, Tier 2, Tier 3)
  - Price in VNĐ
  - "Vé này bao gồm:" section (This ticket includes:)
  - Benefits list with checkmark icons
  - Decorative drum pattern background
  - Tier 3 has "MUA VÉ !!" button

### Design Specifications
- **Colors**:
  - Card background: `#e2eee2` (light green)
  - Border: `#548780` (teal, 4px solid)
  - Text: `#154c5b` (dark teal)
  - Tier name: `#7cbc97` (green) with text shadow
  - Button: `#e2eee2` background, `#48715b` text
- **Fonts**:
  - Tier names: DFVN Tango (96px)
  - Body text: Josefin Sans (Regular/SemiBold, 24px-36px)
- **Decorative Elements**:
  - Scroll decorations (top/bottom)
  - Decorative lines with dots
  - Check icons
  - Drum pattern overlay

## Implementation Steps

### Phase 1: Assets & Types
1. Download image assets from Figma:
   - Banner images for each tier
   - Scroll decoration images
   - Check icon
   - Decorative line patterns
   - Drum pattern overlay
2. Create/update TypeScript types:
   - `TicketTier` model (matching backend)
   - API response types
   - Component prop types

### Phase 2: Translations
Add ticket-related translations to all language files:
- `en.json`, `vi.json`, `th.json`, `zh.json`
- Keys needed:
  - `ticket.tier1`, `ticket.tier2`, `ticket.tier3`
  - `ticket.price`
  - `ticket.includes`
  - `ticket.buyTicket`
  - `ticket.benefits.*` (for each benefit)

### Phase 3: Components
1. **TicketTierCard Component** (`src/components/ticket/TicketTierCard.tsx`):
   - Card container with scroll decorations
   - Banner image
   - Tier name
   - Price display
   - Benefits list with checkmarks
   - Purchase button (for Tier 3 or all tiers)
   - Drum pattern background overlay

2. **TicketTierList Component** (`src/components/ticket/TicketTierList.tsx`):
   - Container for displaying multiple tier cards
   - Responsive grid/flex layout

3. **TicketPage** (`src/app/ticket/page.tsx`):
   - Main page component
   - Background styling
   - Integrates TicketTierList
   - Uses translations

### Phase 4: API Integration (Future)
1. Create API hooks (`src/hooks/api/useTickets.ts`):
   - `useTickets()` - Fetch all ticket tiers
   - `useTicketById(id)` - Fetch single tier
   - `usePurchaseTicket()` - Purchase mutation

2. Update types to match backend API

### Phase 5: Styling
1. Add custom CSS classes for:
   - Scroll decorations
   - Drum pattern overlay
   - Tier name styling (DFVN Tango font)
   - Card borders and shadows

2. Ensure responsive design

## File Structure

```
src/
├── app/
│   └── ticket/
│       └── page.tsx (update)
├── components/
│   └── ticket/
│       ├── TicketTierCard.tsx (new)
│       └── TicketTierList.tsx (new)
├── types/
│   ├── models/
│   │   └── ticket/
│   │       └── ticketTier.d.ts (new/update)
│   └── api/
│       └── ticket/
│           └── ticketTier.d.ts (new/update)
├── hooks/
│   └── api/
│       └── useTickets.ts (new, for future API)
└── language/
    ├── en.json (update)
    ├── vi.json (update)
    ├── th.json (update)
    └── zh.json (update)
```

## Translation Keys Structure

```json
{
  "ticket": {
    "title": "Tickets",
    "tier1": "Tier 1",
    "tier2": "Tier 2",
    "tier3": "Tier 3",
    "price": "Price",
    "includes": "This ticket includes:",
    "buyTicket": "BUY TICKET !!",
    "benefits": {
      "benefit1": "Benefit 1",
      "benefit2": "Benefit 2",
      // ... more benefits
    }
  }
}
```

## Notes
- Start with static data (hardcoded tiers) for UI implementation
- API integration can be added later when backend is ready
- Ensure all text is internationalized
- Match Figma design as closely as possible
- Use existing design tokens where possible
- Add scroll decorations and drum patterns as background images/overlays

