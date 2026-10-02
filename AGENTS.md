# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Durable prototype direction

- Treat the landing page as the primary presentation moment: cinematic, realistic, high-energy, and visually dimensional rather than a conventional SaaS split hero.
- Use an original full-bleed sports-community photograph, deep overlays, floating evidence layers, and strong editorial typography.
- The hero should have a centered white notch/tab that holds the official Chinstrap logo, echoing the approved reference composition without cloning it.
- Bring the mobile product's social layer into the web prototype: a personalized highlights feed, posts and media, reactions, comments, creator profiles, notifications, network discovery, and post creation.
- Preserve the evidence-first discovery, comparisons, verified reviews, messages, profile, and role-aware onboarding already established in the web prototype.
- Keep authenticated navigation in a left sidebar. Keep the public landing header separate.
- Use the original project's light cream app-download banner and sports imagery as the reference for that section.
- Keep the athlete-story image a transparent athlete cutout over the CSS halo; do not bake a rectangular green background into the image, because its edge cuts across the face visually.
- Keep the hero, athlete story, community preview, discovery playground, signal wall, and Insight AI sections compact enough to scan on a laptop: moderate headline sizes, smaller imagery, and restrained vertical spacing. Retain readable copy and usable controls on mobile.
- User authorized Firebase Hosting deployment to `prototype-7b5bd` and publishing only this project to `https://github.com/Aditya-2125/prototype.git`, the current GitHub destination. Original Chinstrap projects are read-only references.
- All five onboarding roles need distinct profile, context, connection, verification, and access steps. School details must not be required for parents, coaches, agents, or organizations. Invitations and verification are optional and explicitly simulated in the prototype.

- Keep a separate mobile app prototype at `mobile.html`, with implementation in `src/mobile/`. It must use dedicated mobile screens, bottom tabs, profile navigation, and app-style flows, rather than reuse the responsive web layout. Both entry points must expose a Web / Mobile switch and be included in production builds.

- Make Insight AI the prominent labeled center tab in the mobile prototype. The accepted bottom navigation is Home, Explore, Insight AI, Reviews, Community. Community opens directly to its feed, with Messages opened from the top-right chat icon. Do not show a Feed / Messages segmented bar. Profile is accessed from the top-left avatar/name on Home. Home has Notifications and Settings in the top-right corner. Keep global navigation visible within profile and community flows.
- Include welcome, prefilled sign-in, direct account setup, password recovery, and all five role-based onboarding journeys. Email-code verification remains available for recovery; account creation must not require an OTP. Keep authentication explicitly simulated, and never persist passwords. Show athlete results and recommendations before billing controls.
- Preserve the earlier visual Home: sports-photo hero, quick actions, Insight banner, program cards, and a community preview. The user explicitly rejected the later statistics/task dashboard and asked to restore this version.

- The web prototype is the source of truth for all mobile features, review entities, eligibility, content, and flows. Do not copy the original native app’s restrictions or information architecture. In particular, support reviews of coaches and agents, schools and universities, clubs, and events exactly as the web prototype does. The native reference only informs the prominent center Insight entry.

- Community’s top-right action is a chat/messages icon opening its Messages screen. Put post creation in a floating plus button at the bottom-right of the Feed, above the bottom tabs; keep the button fixed while the feed scrolls and hide it in Messages.
- Reviews uses the same five category chips as the web prototype, with horizontal scrolling on phones; do not replace these chips with a dropdown.
- Community post actions use an evenly aligned Like / Comment / Share / Save toolbar with consistent icon sizes, visible counts, and at least 44 px tap targets.

- Present the mobile UI as a finished app: no visible demo/prototype/sample/preview disclaimers in app screens. Settings uses Account, Preferences, Support, and Log out; guests see Sign in / Create account. Use standard switches for privacy and notifications. Continue as guest is available from welcome/auth. Keep the implementation local and simulated; explain backend limitations in the handoff instead of product copy.
- Profile’s header Back button always returns directly to Home from every profile tab (Overview, Posts, Network), independent of navigation history. Share and Save in community post footers are icon-only; retain accessible labels and Like/Comment counts.
- Sign-in and account creation inherit the web app’s green gradient, white form card, lock/user icon, typography, field layout, and social buttons. Onboarding follows its six role-specific steps, visible role/evidence cards, and persistent Back/Continue controls.
- Guests may browse public Home, programs, events, reviews, and feed. Gate personalized Insight results, saved lists, messages, posts, review writing, profile changes, follows, likes, reservations, and account/billing features behind a clear Sign in / Create account screen. Return to the requested feature after sign-in.
- Keep the authenticated web Home hero compact: roughly 350–430 px tall on desktop, smaller headline/spacing, and an absolutely positioned visual so the image's intrinsic height cannot expand the grid. Preserve the existing image and two-column composition; show the journey strip below it sooner.

- Mobile authentication follows the web prototype’s easy access: prefill `demo@chinstrap.com` / `chinstrap`, accept any non-empty email text and password, and let Google/Apple sign in immediately. Create account opens the six-step role setup directly, with no separate registration form or OTP gate. Setup can be completed without filling optional fields, and its final “Create my workspace” action opens Home (or the originally requested member feature). Never store passwords.

- Match the mobile welcome hero to the web landing page: center the official logo in the white cutout at the top of the photo, using the existing header-notch asset. Keep the combined branding/photo height restrained so welcome actions stay close by.

- Mobile Create post uses a real photo/file picker with image preview, change, and remove controls instead of preset photo choices. Posted photos appear in the feed and remain available after reload; keep this within the local prototype’s existing storage model.
