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
