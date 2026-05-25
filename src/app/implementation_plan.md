# Implementation Plan - Home Page Redesign

Redesign the existing home page to match the premium "City Directory" style requested, using modular components to keep the code clean and maintainable.

## Proposed Changes

### [Component Layer]

#### [NEW] [AppSection.tsx](file:///c:/website%20app/website/src/components/home/AppSection.tsx)
- Create a dedicated section for the mobile app promotion.
- Use the generated `app-mockup.png`.
- Features a split layout: text/benefit list on one side, floating phone mockup on the other.

#### [NEW] [StatsSection.tsx](file:///c:/website%20app/website/src/components/home/StatsSection.tsx)
- Extract the "Why Choose Us" / counter logic into a standalone component.
- Implement sleek, animated counter cards.

#### [NEW] [CTASection.tsx](file:///c:/website%20app/website/src/components/home/CTASection.tsx)
- A high-conversion final call-to-action section.
- Uses a subtle radial glow background.

#### [NEW] [HomeFooter.tsx](file:///c:/website%20app/website/src/components/home/HomeFooter.tsx)
- A clean, modern footer with organized links and social icons.

### [ListyGo Full Reconstruction]

#### [NEW] [AboutSection.tsx](file:///c:/website%20app/website/src/components/home/AboutSection.tsx)
- 3-image collage on the left.
- "Let's Discover The Best" title on the right.
- Red checkmark list for features.

#### [NEW] [LocationSection.tsx](file:///c:/website%20app/website/src/components/home/LocationSection.tsx)
- Large featured location card on the left.
- 2x3 grid of smaller location items on the right.

#### [NEW] [QuestionSection.tsx](file:///c:/website%20app/website/src/components/home/QuestionSection.tsx)
- Black banner with "Do You Have Any Questions?".
- Centered CTA button.

#### [NEW] [TestimonialsSection.tsx](file:///c:/website%20app/website/src/components/home/TestimonialsSection.tsx)
- Large customer image on the left.
- Big quote and rating on the right.
- Navigation arrows.

#### [NEW] [PartnersSection.tsx](file:///c:/website%20app/website/src/components/home/PartnersSection.tsx)
- Gray background bar with grayscale partner logos.

#### [MODIFY] [AppSection.tsx](file:///c:/website%20app/website/src/components/home/AppSection.tsx)
- Red background with wavy design.
- Phone mockup on the right.
- App store badges.

#### [MODIFY] [CommunityUpdatesSection.tsx](file:///c:/website%20app/website/src/components/home/CommunityUpdatesSection.tsx)
- Change to 3 vertical cards with "Read More" links.

## Verification Plan
... (same as before)

### Automated Tests
- Run `npm run dev` to ensure no build errors.
- Check browser console for hydration errors.

### Manual Verification
- Visual inspection of all sections.
- Test responsive layout on mobile/tablet viewports.
- Verify animations (scroll reveals, float effects) are smooth.
