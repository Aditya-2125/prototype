import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const base = process.env.PROTOTYPE_URL || "http://127.0.0.1:8099/";
const list = await (await fetch("http://127.0.0.1:9333/json/list")).json();
const target =
  list.find((t) => t.type === "page" && t.url.startsWith(base)) ||
  list.find((t) => t.type === "page" && t.url.includes("localhost:5173"));
assert.ok(target, "A local prototype browser tab is required");
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", reject, { once: true });
});
let serial = 0;
const pending = new Map(),
  errors = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.method === "Runtime.exceptionThrown")
    errors.push(m.params.exceptionDetails);
  if (pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
});
const call = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++serial;
    pending.set(id, (m) =>
      m.error ? reject(Error(JSON.stringify(m.error))) : resolve(m.result)
    );
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const result = await call("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const click = (selector) =>
  evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
const navigate = async (route) => {
  await evaluate(`location.hash=${JSON.stringify(route)}`);
  await pause(70);
};
const fill = (selector, value) =>
  evaluate(
    `(()=>{const e=document.querySelector(${JSON.stringify(
      selector
    )});e.value=${JSON.stringify(
      value
    )};e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()`
  );
const submit = (selector) =>
  evaluate(
    `document.querySelector(${JSON.stringify(selector)}).requestSubmit()`
  );
const text = () => evaluate('document.querySelector("#app-content").innerText');
const storage = () =>
  evaluate('JSON.parse(localStorage.getItem("chinstrap-mobile-v1"))');
const uploadPhoto = async (name) => {
  const { root } = await call("DOM.getDocument");
  const { nodeId } = await call("DOM.querySelector", { nodeId: root.nodeId, selector: "#post-photo" });
  await call("DOM.setFileInputFiles", { nodeId, files: [fileURLToPath(new URL(`../assets/${name}`, import.meta.url))] });
  for (let i = 0; i < 100; i++) {
    if (await evaluate('!document.querySelector("[data-form=post] .primary").disabled')) break;
    await pause(50);
  }
  assert.equal(await evaluate('document.querySelector("#post-photo-status").textContent'), "");
  await evaluate('document.querySelector("#post-image-preview img").decode()');
};
const screenshot = async (name) => {
  await evaluate("document.fonts.ready");
  await pause(200);
  const shot = await call("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  await writeFile(
    `/tmp/chinstrap-mobile-${name}.png`,
    Buffer.from(shot.data, "base64")
  );
};
let saved;
const timeout = setTimeout(() => {
  console.error("Mobile browser test timed out");
  process.exit(1);
}, 180000);
try {
  await call("Runtime.enable");
  await call("Page.enable");
  await call("Page.navigate", { url: `${base}mobile.html` });
  for (let i = 0; i < 80; i++) {
    if (
      await evaluate(
        '!!document.querySelector("#app-content").firstElementChild'
      )
    )
      break;
    await pause(100);
  }
  saved = await evaluate('localStorage.getItem("chinstrap-mobile-v1")');
  await evaluate('localStorage.removeItem("chinstrap-mobile-v1")');
  await call("Page.reload");
  await pause(700);
  await navigate("welcome");
  await click('[data-auth-action="guest"]');
  await navigate("settings");
  assert.match(await text(), /browsing as a guest/);
  assert.equal(
    await evaluate('!!document.querySelector("[data-auth-action=signout]")'),
    false
  );
  for (const protectedRoute of [
    "insight",
    "insight-matches",
    "college/northstar-college",
    "saved",
    "compare",
    "community/messages",
    "chat/maya",
    "compose",
    "write-review/maya",
    "edit-profile",
    "verification",
    "billing",
    "achievements",
  ]) {
    await navigate(protectedRoute);
    assert.equal(
      await evaluate('!!document.querySelector(".account-required")'),
      true,
      protectedRoute + " requires an account"
    );
    assert.ok(
      await evaluate(
        '!!document.querySelector(".account-required [data-go=login]")'
      )
    );
    assert.ok(
      await evaluate(
        '!!document.querySelector(".account-required [data-go=signup]")'
      )
    );
  }
  await navigate("community");
  await click('[data-like="jordan-training"]');
  assert.equal(
    await evaluate('!!document.querySelector(".account-required")'),
    true
  );
  assert.equal((await storage()).likes.length, 0);
  await navigate("insight-matches");
  await click('[data-go="login"]');
  assert.equal(
    await evaluate('document.querySelector("#auth-email").value'),
    "demo@chinstrap.com"
  );
  assert.equal(
    await evaluate('document.querySelector("#auth-password").value'),
    "chinstrap"
  );
  await submit('[data-auth-form="login"]');
  assert.equal(await evaluate("location.hash"), "#insight-matches");
  const routes = [
    "home",
    "discover",
    "program/northstar",
    "filters",
    "community",
    "community/messages",
    "compose",
    "comments/jordan-training",
    "saved",
    "compare",
    "insight",
    "network",
    "person/maya",
    "tournaments",
    "event/showcase",
    "inbox",
    "chat/maya",
    "profile",
    "edit-profile",
    "reviews",
    "reviews/northstar",
    "write-review/northstar",
    "reviews/maya",
    "review-verification",
    "verification",
    "settings",
    "account-security",
    "privacy-settings",
    "notification-settings",
    "help",
    "billing",
    "notifications",
    "about",
    "welcome",
    "login",
    "signup",
    "verify-email",
    "forgot-password",
    "reset-code",
    "reset-password",
    "reset-complete",
    "provider/google-signup",
    "provider/apple-login",
    "onboarding",
    "onboarding-ready",
    "legal/terms",
    "legal/privacy",
    "insight-matches",
    "insight-metrics",
    "insight-run",
    "insight-history",
    "college/northstar-college",
    "profile/posts",
    "profile/network",
    "connections",
    "achievements",
    "my-reviews",
  ];
  for (const width of [1440, 390, 320]) {
    await call("Emulation.setDeviceMetricsOverride", {
      width,
      height: width === 1440 ? 1000 : 844,
      deviceScaleFactor: 1,
      mobile: false,
    });
    for (const route of routes) {
      await navigate(route);
      const layout = await evaluate(
        `({overflow:document.documentElement.scrollWidth>innerWidth,mainOverflow:document.querySelector('#app-content').scrollWidth>document.querySelector('#app-content').clientWidth+1,images:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src),text:document.querySelector('#app-content').innerText.length,nav:document.querySelector('#tab-bar').getBoundingClientRect().bottom<=innerHeight})`
      );
      assert.equal(
        layout.overflow,
        false,
        `${route} page overflow at ${width}`
      );
      assert.equal(
        layout.mainOverflow,
        false,
        `${route} content overflow at ${width}`
      );
      assert.deepEqual(layout.images, [], `${route} broken images`);
      assert.ok(layout.text > 15, `${route} empty`);
      assert.doesNotMatch(
        (await text()).replace(/\S+@\S+/g, ""),
        /\b(?:demo|prototype|sample|simulated)\b/i,
        `${route} has internal copy`
      );
      assert.ok(layout.nav, `${route} tab bar offscreen`);
      if (width === 1440 && route === "home") await screenshot("desktop");
      if (
        width === 390 &&
        [
          "home",
          "discover",
          "profile",
          "program/northstar",
          "community",
        ].includes(route)
      )
        await screenshot(route.replace("/", "-"));
    }
    console.log(
      `PASS ${routes.length} routes @ ${width}px: content, images, overflow, navigation`
    );
  }
  for (const profileRoute of ["profile", "profile/posts", "profile/network"]) {
    await navigate("community");
    await navigate(profileRoute);
    await click('[data-action="back"]');
    assert.equal(await evaluate("location.hash"), "#home");
  }
  await navigate("privacy-settings");
  const wasDiscoverable = (await storage()).preferences.discoverable;
  await click('[data-preference="discoverable"]');
  assert.equal((await storage()).preferences.discoverable, !wasDiscoverable);
  await navigate("notification-settings");
  await click('[data-preference="messages"]');
  assert.equal((await storage()).preferences.messages, false);
  await navigate("discover");
  await fill("#discover-search", "zzzz");
  assert.match(await text(), /No matches yet/);
  await click('[data-action="reset-filters"]');
  await click('[data-category="Coaches"]');
  assert.equal(
    await evaluate('document.querySelectorAll(".program-card").length'),
    1
  );
  await click('[data-category="All"]');
  await click('[data-save="metro"]');
  assert.ok((await storage()).saved.includes("metro"));
  await navigate("saved");
  assert.match(await text(), /Metro Athletic Program/);
  await navigate("compare");
  await fill('[data-compare="0"]', "metro");
  assert.match(await text(), /\$1,800/);
  console.log("PASS search, empty state, category filters, saving, comparison");
  await navigate("community");
  assert.equal(
    await evaluate(
      'document.querySelector("#app-header [aria-label=Messages]").dataset.go'
    ),
    "community/messages"
  );
  assert.equal(
    await evaluate('document.querySelector("#create-post-fab").hidden'),
    false
  );
  await click("#create-post-fab");
  assert.equal(await evaluate("location.hash"), "#compose");
  await navigate("community/messages");
  assert.equal(
    await evaluate('document.querySelector("#create-post-fab").hidden'),
    true
  );
  await navigate("community");
  assert.equal(
    await evaluate('document.querySelectorAll(".community-segments").length'),
    0
  );
  assert.equal(
    await evaluate('document.querySelector(".post-actions").children.length'),
    4
  );
  assert.equal(
    await evaluate(
      'document.querySelector("[data-postshare]").textContent.trim()'
    ),
    ""
  );
  assert.equal(
    await evaluate(
      'document.querySelector("[data-postsave]").textContent.trim()'
    ),
    ""
  );
  await click('[data-postshare="jordan-training"]');
  assert.equal(
    await evaluate('document.querySelector("#post-share-sheet").open'),
    true
  );
  assert.match(
    await evaluate('document.querySelector("#post-share-sheet input").value'),
    /#comments\/jordan-training/
  );
  await click('[data-action="close-share"]');
  await click('[data-like="jordan-training"]');
  assert.ok((await storage()).likes.includes("jordan-training"));
  await click('[data-postsave="jordan-training"]');
  await click('[data-feed="Saved"]');
  assert.equal(await evaluate('document.querySelectorAll(".post").length'), 1);
  await navigate("compose");
  await fill('[name="text"]', "A great day of training.");
  await submit('[data-form="post"]');
  assert.match(await text(), /A great day of training/);
  assert.equal((await storage()).posts[0].image, "");
  await navigate("compose");
  assert.equal(await evaluate('document.querySelector("[data-form=post] select")'), null);
  const beforeUploads = (await storage()).posts.length;
  await submit('[data-form="post"]');
  assert.equal((await storage()).posts.length, beforeUploads, "Empty posts must be rejected");
  await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
  await screenshot("photo-picker");
  await uploadPhoto("social-athlete.png");
  const firstPhoto = await evaluate('document.querySelector("#post-image-preview img").src');
  assert.match(firstPhoto, /^data:image\/(?:webp|png);base64,/);
  await uploadPhoto("social-track.png");
  assert.notEqual(await evaluate('document.querySelector("#post-image-preview img").src'), firstPhoto, "Replacement must show the new photo");
  await click('[data-post-photo="remove"]');
  assert.equal(await evaluate('document.querySelector("#post-image-preview").hidden'), true);
  for (const [body, type, message] of [
    ["'not a photo'", "text/plain", /Choose a JPG/],
    ["new Uint8Array(10 * 1024 * 1024 + 1)", "image/png", /smaller than 10 MB/],
    ["'broken image'", "image/png", /could not be opened/],
  ]) {
    await evaluate(`(()=>{const transfer=new DataTransfer();transfer.items.add(new File([${body}], 'invalid.png', {type:${JSON.stringify(type)}}));const input=document.querySelector('#post-photo');input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    for (let i = 0; i < 100; i++) {
      if (await evaluate('!document.querySelector("[data-form=post] .primary").disabled')) break;
      await pause(50);
    }
    assert.match(await evaluate('document.querySelector("#post-photo-status").textContent'), message);
    assert.equal(await evaluate('document.querySelector("#post-image-preview").hidden'), true);
  }
  await uploadPhoto("social-athlete.png");
  await fill('[name="text"]', "My uploaded training photo.");
  await screenshot("photo-preview");
  // A persistence failure must keep the form/photo and avoid publishing a lost post.
  await evaluate('window.originalStorageSetItem = Storage.prototype.setItem; Storage.prototype.setItem = function(){throw new DOMException("Full", "QuotaExceededError");}');
  try {
    await submit('[data-form="post"]');
    assert.equal(await evaluate("location.hash"), "#compose");
    assert.match(await evaluate('document.querySelector("#mobile-toast").textContent'), /could not be saved/);
  } finally {
    await evaluate('Storage.prototype.setItem = window.originalStorageSetItem; delete window.originalStorageSetItem');
  }
  await submit('[data-form="post"]');
  assert.equal((await storage()).posts.length, beforeUploads + 1);
  const uploaded = (await storage()).posts[0];
  assert.match(uploaded.image, /^data:image\/(?:webp|png);base64,/);
  assert.equal(await evaluate('document.querySelector(".post > img").src'), uploaded.image);
  await call("Page.reload");
  await pause(600);
  await evaluate('document.querySelector(".post > img").decode()');
  assert.equal(await evaluate('document.querySelector(".post > img").src'), uploaded.image, "Uploaded photo must survive reload");
  await navigate("profile/posts");
  assert.equal(await evaluate('document.querySelector(".post > img").src'), uploaded.image);
  await navigate(`comments/${uploaded.id}`);
  assert.equal(await evaluate('document.querySelector(".post > img").src'), uploaded.image);
  await navigate("compose");
  await uploadPhoto("social-track.png");
  await submit('[data-form="post"]');
  assert.equal((await storage()).posts[0].text, "", "A photo can be posted without a caption");
  assert.ok((await storage()).posts[0].image);
  console.log("PASS photo upload, replacement, removal, file validation, feed/profile rendering, reload persistence, storage failure, text-only/photo-only posting");
  await navigate("comments/jordan-training");
  await fill('[name="text"]', "Thoughtful feedback!");
  await submit('[data-form="comment"]');
  assert.match(await text(), /Thoughtful feedback!/);
  await navigate("chat/maya");
  await fill('[name="text"]', "Can we discuss the next season?");
  await submit('[data-form="message"]');
  assert.match(await text(), /Can we discuss the next season/);
  await navigate("edit-profile");
  await fill('[name="name"]', "Test Athlete");
  await submit('[data-form="profile"]');
  assert.match(await text(), /Test Athlete/);
  await navigate("reviews");
  assert.deepEqual(
    await evaluate(
      '[...document.querySelectorAll(".review-type-chips button")].map(b=>b.textContent)'
    ),
    [
      "All",
      "Schools & universities",
      "Clubs & travel teams",
      "Coaches, agents & trainers",
      "Tournaments & leagues",
    ]
  );
  assert.equal(
    await evaluate('document.querySelectorAll(".review-entity-card").length'),
    6
  );
  await click('[data-review-category="professional"]');
  assert.equal(
    await evaluate('document.querySelectorAll(".review-entity-card").length'),
    2
  );
  assert.match(await text(), /Coach Maya Chen/);
  assert.match(await text(), /Apex Sports Agency/);
  await fill("#review-search", "zzzz");
  assert.match(await text(), /No matching entity/);
  await click('[data-review-action="clear"]');
  await navigate("write-review/maya");
  await fill('[name="title"]', "Coach draft");
  await fill(
    '[name="text"]',
    "Actionable advice throughout the entire season."
  );
  await click('[data-review-action="save-draft"]');
  await click('[data-go="write-review/maya"]');
  assert.equal(
    await evaluate('document.querySelector("[name=title]").value'),
    "Coach draft"
  );
  await navigate("write-review");
  await fill("[data-review-entity]", "apex");
  assert.match(await text(), /Organization partner/);
  await navigate("write-review/northstar");
  await click('[data-review-rating="4"]');
  await fill('[name="title"]', "Specific coaching feedback");
  await fill(
    '[name="text"]',
    "The coaches provided helpful and specific feedback after every training session."
  );
  await submit('[data-review-form="write"]');
  assert.match(await text(), /Verify your relationship/);
  await submit('[data-review-form="verify"]');
  assert.match(await text(), /Specific coaching feedback/);
  assert.match(await text(), /Pending verification/);
  await navigate("event/showcase");
  await click('[data-register="showcase"]');
  assert.match(await text(), /Your reservation is saved/);
  await click('[data-register="showcase"]');
  assert.match(await text(), /Reserve a spot/);
  await navigate("insight-run");
  await submit('[data-insight-form="run"]');
  await pause(1000);
  assert.equal((await storage()).credits, 11);
  assert.match(await text(), /Your strongest match/);
  assert.equal((await storage()).insightHistory.length, 1);
  await navigate("insight-history");
  assert.match(await text(), /College fit & recruiting/);
  await navigate("college/northstar-college");
  await click('[data-college-save="northstar-college"]');
  await navigate("saved");
  assert.match(await text(), /Northstar College/);
  await call("Page.reload");
  await pause(600);
  await navigate("profile");
  assert.match(await text(), /Test Athlete/);
  console.log(
    "PASS posts, likes, saved feed, comments, messages, profile, reviews, reservations, analysis, reload persistence"
  );
  // Sign-up, verification, recovery, validation, and provider-return simulations.
  await navigate("home");
  assert.deepEqual(
    await evaluate(
      '[...document.querySelectorAll("#tab-bar button")].map(b=>b.textContent.trim())'
    ),
    ["Home", "Explore", "Insight AI", "Reviews", "Community"]
  );
  assert.equal(
    await evaluate(
      'document.querySelectorAll("#tab-bar button")[2].dataset.go'
    ),
    "insight"
  );
  assert.equal(
    await evaluate(
      'document.querySelector("#app-header .home-profile-entry").dataset.go'
    ),
    "profile"
  );
  assert.equal(
    await evaluate(
      'document.querySelector("#app-header [aria-label=Settings]").dataset.go'
    ),
    "settings"
  );
  assert.equal(
    await evaluate('document.querySelectorAll(".quick-grid button").length'),
    4
  );
  await navigate("login");
  await click('[data-auth-action="show-password"]');
  assert.equal(
    await evaluate('document.querySelector("#auth-password").type'),
    "text"
  );
  await click('[data-auth-action="show-password"]');
  assert.equal(
    await evaluate('document.querySelector("#auth-password").type'),
    "password"
  );
  await fill("#auth-email", "");
  await fill("#auth-password", "");
  await submit('[data-auth-form="login"]');
  assert.match(await text(), /Enter your email address/);
  assert.match(await text(), /Enter your password/);
  await fill("#auth-email", "anything");
  await fill("#auth-password", "any-prototype-password");
  await submit('[data-auth-form="login"]');
  assert.equal(await evaluate("location.hash"), "#home");
  assert.equal((await storage()).profile.email, "anything");
  assert.equal(
    JSON.stringify(await storage()).includes("any-prototype-password"),
    false
  );
  for (const provider of ["google", "apple"]) {
    await navigate("settings");
    await click('[data-auth-action="signout"]');
    await navigate("insight");
    await click('[data-go="login"]');
    await click(`[data-auth-provider="${provider}"]`);
    assert.equal(await evaluate("location.hash"), "#insight");
    assert.equal((await storage()).session.provider, provider);
  }
  await navigate("settings");
  await click('[data-auth-action="signout"]');
  await click('[data-go="signup"]');
  assert.equal(await evaluate("location.hash"), "#onboarding");
  assert.equal(
    await evaluate('!!document.querySelector("[data-auth-form=signup]")'),
    false
  );
  await submit("#onboarding-form");
  assert.equal(
    await evaluate('document.querySelector("[name=field-0]").value'),
    "Jamie Smith"
  );
  await fill('[name="field-0"]', "Draft Athlete");
  await call("Page.reload");
  await pause(500);
  assert.match(await text(), /STEP 2 OF 6/);
  assert.equal(
    await evaluate('document.querySelector("[name=field-0]").value'),
    "Draft Athlete"
  );
  // Even unfilled optional setup fields must not block the web-style walkthrough.
  await fill('[name="field-2"]', "anything");
  for (let step = 2; step <= 6; step++) await submit("#onboarding-form");
  assert.equal(await evaluate("location.hash"), "#home");
  assert.equal((await storage()).session.mode, "signed-in");
  assert.equal((await storage()).profile.name, "Draft Athlete");
  await navigate("forgot-password");
  await fill("#auth-email", "new@example.com");
  await submit('[data-auth-form="forgot"]');
  assert.equal(await evaluate("location.hash"), "#reset-code");
  await fill("#auth-code", "123456");
  await submit('[data-auth-form="reset-code"]');
  assert.equal(await evaluate("location.hash"), "#reset-password");
  await fill("#auth-password", "NewDemoPass!42");
  await fill("#auth-confirm", "DoesNotMatch");
  await submit('[data-auth-form="reset"]');
  assert.match(await text(), /passwords don’t match/);
  await fill("#auth-confirm", "NewDemoPass!42");
  await submit('[data-auth-form="reset"]');
  assert.equal(await evaluate("location.hash"), "#reset-complete");
  assert.equal(
    JSON.stringify(await storage()).includes("NewDemoPass!42"),
    false
  );
  await navigate("login");
  await fill("#auth-email", "new@example.com");
  await fill("#auth-password", "demo");
  await submit('[data-auth-form="login"]');
  assert.equal(await evaluate("location.hash"), "#home");
  await navigate("settings");
  await click('[data-auth-action="signout"]');
  assert.equal(await evaluate("location.hash"), "#welcome");
  assert.equal((await storage()).session, null);
  await navigate("provider/google-login");
  await click('[data-auth-provider="google"]');
  assert.equal(await evaluate("location.hash"), "#home");
  await navigate("inbox");
  await fill("#inbox-search", "NoSuchPerson");
  assert.match(await text(), /No conversations found/);
  await fill("#inbox-search", "Maya");
  assert.equal(
    await evaluate(
      '[...document.querySelectorAll("[data-conversation]")].filter(e=>!e.hidden).length'
    ),
    1
  );
  console.log(
    "PASS visible Home shortcuts, central Insight, message/settings placement, auth validation, password visibility, prefilled and permissive login, direct signup, recovery, draft resume, sign-out, one-tap providers, inbox search"
  );
  for (const role of ["athlete", "parent", "coach", "agent", "organization"]) {
    await navigate("settings");
    await click('[data-go="onboarding"]');
    await click(`[data-role="${role}"]`);
    await submit("#onboarding-form");
    assert.match(await text(), /STEP 2 OF 6/);
    await evaluate(
      `document.querySelectorAll('#onboarding-form input').forEach(e=>{if(e.type==='text')e.value='Test ${role}';if(e.type==='email')e.value='demo@example.com';if(e.type==='url')e.value='https://example.com';if(e.type==='date')e.value='2008-01-01';});`
    );
    await submit("#onboarding-form");
    assert.match(await text(), /STEP 3 OF 6/);
    await click('[data-action="back"]');
    assert.equal(
      await evaluate('document.querySelector("[name=field-0]").value'),
      `Test ${role}`
    );
    await submit("#onboarding-form");
    await submit("#onboarding-form");
    assert.match(await text(), /STEP 4 OF 6/);
    await click('[data-action="skip-onboarding"]');
    assert.match(await text(), /STEP 5 OF 6/);
    await click('[data-onboarding-method][value="2"]');
    assert.equal(
      await evaluate('document.querySelector("#onboarding-proof input").type'),
      "file"
    );
    await click('[data-action="skip-onboarding"]');
    assert.match(await text(), /STEP 6 OF 6/);
    await submit("#onboarding-form");
    assert.equal(await evaluate("location.hash"), "#home");
    assert.equal((await storage()).profile.role, role);
    assert.equal((await storage()).profile.email, "demo@example.com");
    console.log(
      `PASS ${role}: six-step onboarding, back, drafts, role-specific evidence, skip, completion`
    );
  }
  await navigate("home");
  await click('[data-go="discover"]');
  await click('[data-go="program/northstar"]');
  await click('[data-action="back"]');
  await pause(100);
  assert.equal(await evaluate("location.hash"), "#discover");
  await call("Page.navigate", {
    url: `base`.replace("base", base) + "index.html",
  });
  await pause(800);
  assert.equal(
    await evaluate(
      'document.querySelector(".prototype-switch a[aria-current]").textContent'
    ),
    "Web"
  );
  await click('.prototype-switch a[href="mobile.html"]');
  await pause(800);
  assert.equal(
    await evaluate(
      'document.querySelector(".prototype-switch a[aria-current]").textContent'
    ),
    "Mobile"
  );
  assert.equal(errors.length, 0, JSON.stringify(errors));
  console.log("PASS history, Web / Mobile links, no runtime exceptions");
} finally {
  if (saved !== undefined) {
    await evaluate(
      `localStorage.${
        saved === null ? "removeItem" : "setItem"
      }('chinstrap-mobile-v1'${
        saved === null ? "" : `,${JSON.stringify(saved)}`
      })`
    );
  }
  await call("Emulation.clearDeviceMetricsOverride");
  await call("Page.navigate", { url: `${base}mobile.html#home` });
  await call("Page.reload");
  clearTimeout(timeout);
  ws.close();
}
