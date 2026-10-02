import { journeys } from "../onboarding.js";
import { createAuth } from "./auth.js";
import { createInsight } from "./insight.js";
import { createReviews } from "./reviews.js";
import { photoPicker, postPhoto, photoIsLoading, selectPostPhoto, handlePhotoAction } from "./post-photo.js";

const assets = import.meta.glob("../../assets/*", {
  eager: true,
  query: "?url",
  import: "default",
});
const asset = (name) => assets[`../../assets/${name}`];
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
const icon = (name, kind = "solid") =>
  `<i class="fa-${kind} fa-${name}" aria-hidden="true"></i>`;
const img = (name, alt = "", cls = "") =>
  `<img src="${esc(/^data:image\/(?:jpeg|png|webp);base64,/.test(name) ? name : asset(name))}" alt="${esc(alt)}" class="${cls}" />`;
const avatar = (name = "member-avatar.png", cls = "") =>
  img(name, "", `avatar ${cls}`);
const button = (text, route, cls = "text-button") =>
  `<button class="${cls}" data-go="${route}">${text}</button>`;
const iconButton = (name, label, attrs = "") =>
  `<button class="icon-button" aria-label="${esc(label)}" ${attrs}>${icon(
    name
  )}</button>`;
const badge = (text, name = "circle-check") =>
  `<span class="badge">${icon(name)} ${text}</span>`;
const heading = (title, link = "", route = "") =>
  `<div class="section-heading"><h2>${title}</h2>${
    link ? button(link, route) : ""
  }</div>`;
const row = (name, title, copy, route, tail = "chevron-right") =>
  `<button class="list-row" data-go="${route}">${icon(
    name
  )}<span><strong>${title}</strong><small>${copy}</small></span>${icon(
    tail
  )}</button>`;
const programs = [
  {
    id: "northstar",
    name: "Northstar Academy",
    type: "Schools",
    sport: "Soccer",
    location: "Chicago, IL",
    distance: "5.4 mi",
    image: "northstar-school.png",
    fit: 91,
    rating: "4.8",
    reviews: 142,
    cost: "$3,200 / year",
    development: 92,
    academics: 94,
    communication: 88,
    description:
      "A balanced path for ambitious student-athletes. Individual development, strong academics, and a team that knows your name.",
  },
  {
    id: "lakeside",
    name: "Lakeside United",
    type: "Clubs",
    sport: "Soccer",
    location: "Evanston, IL",
    distance: "3.2 mi",
    image: "soccer-stadium.jpg",
    fit: 86,
    rating: "4.7",
    reviews: 96,
    cost: "$2,400 / year",
    development: 89,
    academics: 79,
    communication: 91,
    description:
      "Competitive soccer with a community feel. Small training groups, purposeful coaching, and opportunities to compete across the region.",
  },
  {
    id: "metro",
    name: "Metro Athletic Program",
    type: "Clubs",
    sport: "Track & field",
    location: "Oak Park, IL",
    distance: "6.4 mi",
    image: "track-program.png",
    fit: 82,
    rating: "4.6",
    reviews: 74,
    cost: "$1,800 / year",
    development: 86,
    academics: 83,
    communication: 90,
    description:
      "Build strength, confidence, and consistency with event-specific training and a welcoming multi-sport community.",
  },
  {
    id: "maya",
    name: "Coach Maya Chen",
    type: "Coaches",
    sport: "Soccer",
    location: "Chicago, IL",
    distance: "2.1 mi",
    image: "social-coach.png",
    fit: 89,
    rating: "4.9",
    reviews: 58,
    cost: "$75 / session",
    development: 95,
    academics: 81,
    communication: 96,
    description:
      "USSF-licensed development coach helping young players build technical confidence through specific, actionable feedback.",
  },
];
const people = [
  {
    id: "maya",
    name: "Maya Chen",
    role: "Coach · Player development",
    image: "social-avatar-2.png",
    bio: "Helping players find confidence in their game. USSF-licensed coach. Chicago soccer community.",
  },
  {
    id: "jordan",
    name: "Jordan Ellis",
    role: "Athlete · Soccer · Class of 2027",
    image: "social-avatar-1.png",
    bio: "Center midfielder. Always learning, always moving. Sharing the work between the highlights.",
  },
  {
    id: "taylor",
    name: "Taylor Kim",
    role: "Parent · Chicago sports community",
    image: "social-avatar-3.png",
    bio: "Navigating youth sports together. Here for thoughtful coaching, happy athletes, and honest conversations.",
  },
];
const basePosts = [
  {
    id: "jordan-training",
    person: "jordan",
    time: "18 min ago",
    text: "The little things add up. A week of first-touch work, honest feedback, and showing up for each other. Ready for the weekend. ⚽",
    image: "social-athlete.png",
    likes: 284,
    comments: [
      "Love the consistency. Keep going!",
      "That first touch is looking sharp.",
    ],
  },
  {
    id: "maya-advice",
    person: "maya",
    time: "1 hour ago",
    text: "Before you choose a program, ask: how will my athlete get feedback? A clear development plan matters as much as the result on Saturday.",
    image: "social-coach.png",
    likes: 126,
    comments: ["This is exactly what we needed to ask."],
  },
  {
    id: "taylor-team",
    person: "taylor",
    time: "3 hours ago",
    text: "A team is more than a jersey. Grateful for a community that celebrates every player’s progress.",
    image: "community-team.png",
    likes: 89,
    comments: [],
  },
];
const defaults = {
  saved: ["northstar", "lakeside"],
  likes: [],
  savedPosts: [],
  following: ["jordan"],
  posts: [],
  comments: {},
  messages: {},
  reviews: [],
  registered: [],
  notificationsRead: false,
  profile: {
    name: "Jamie Smith",
    role: "athlete",
    city: "Chicago, IL",
    sport: "Soccer",
    position: "Center midfielder",
    bio: "Putting in the work. Finding my next chapter.",
    email: "jamie.smith@example.com",
  },
  preferences: {
    discoverable: true,
    updates: true,
    messages: true,
    connections: true,
    insights: true,
    recommendations: true,
    reviewUpdates: true,
  },
  credits: 12,
  verification: "Not submitted",
  plan: "Community",
};
let state;
try {
  const stored = JSON.parse(
    localStorage.getItem("chinstrap-mobile-v1") || "null"
  );
  state =
    stored && typeof stored === "object"
      ? {
          ...defaults,
          ...stored,
          profile: { ...defaults.profile, ...stored.profile },
          preferences: { ...defaults.preferences, ...stored.preferences },
        }
      : structuredClone(defaults);
} catch {
  state = structuredClone(defaults);
}
if (/demo|prototype/i.test(state.verification))
  state.verification = "Pending review";
const save = () => {
  try {
    localStorage.setItem("chinstrap-mobile-v1", JSON.stringify(state));
    return true;
  } catch {
    toast(
      "This browser could not save your changes. They remain available for this session."
    );
    return false;
  }
};
let route = "",
  query = "",
  category = "All",
  feedFilter = "For you",
  networkQuery = "",
  selectedComparison = [...state.saved].slice(0, 2),
  depth = 0,
  toastTimer;
let onboarding = state.onboarding || {
  role: state.profile.role,
  step: 1,
  drafts: {},
};
const main = document.getElementById("app-content");
const header = document.getElementById("app-header");
const tabs = [
  ["home", "house", "Home"],
  ["discover", "compass", "Explore"],
  ["insight", "wand-magic-sparkles", "Insight AI"],
  ["reviews", "star", "Reviews"],
  ["community", "user-group", "Community"],
];
const getProgram = (id) => programs.find((p) => p.id === id) || programs[0];
const getPerson = (id) => people.find((p) => p.id === id) || people[0];
const getPost = (id) => [...state.posts, ...basePosts].find((p) => p.id === id);
const firstName = () => esc(state.profile.name.split(" ")[0]);
const api = {
  state,
  esc,
  icon,
  img,
  avatar,
  button,
  badge,
  heading,
  row,
  go,
  save,
  toast,
  refresh,
  startOnboarding,
};
const auth = createAuth(api);
const insightApp = createInsight(api);
const reviewApp = createReviews(api);
const authRoutes = [
  "welcome",
  "login",
  "signup",
  "verify-email",
  "forgot-password",
  "reset-code",
  "reset-password",
  "reset-complete",
  "provider",
  "onboarding",
  "onboarding-ready",
  "legal",
];
function toast(text) {
  const el = document.getElementById("mobile-toast");
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3300);
}
function go(next, replace = false) {
  if (next === route && !replace) {
    if (main.querySelector(".account-required")) render();
    return;
  }
  history[replace ? "replaceState" : "pushState"](
    { mobile: true },
    "",
    `#${next}`
  );
  if (!replace) depth++;
  render();
  main.focus({ preventScroll: true });
}
function back() {
  if (route.split("/")[0] === "profile") {
    go("home", true);
    return;
  }
  if (depth > 0) {
    depth--;
    history.back();
  } else go("home", true);
}
function toggle(collection, id) {
  state[collection] = state[collection].includes(id)
    ? state[collection].filter((x) => x !== id)
    : [...state[collection], id];
  save();
}
function refresh() {
  const top = main.scrollTop;
  render(false);
  main.scrollTop = top;
}
function programCard(p) {
  const saved = state.saved.includes(p.id);
  return `<article class="program-card"><button class="photo-button" data-go="program/${
    p.id
  }" aria-label="View ${p.name}">${img(
    p.image,
    p.name
  )}</button><span class="fit-tag">${
    p.fit
  }% FIT</span><button class="save-button" data-save="${
    p.id
  }" aria-pressed="${saved}" aria-label="${saved ? "Unsave" : "Save"} ${
    p.name
  }">${icon(
    "bookmark",
    saved ? "solid" : "regular"
  )}</button><div class="program-copy"><button data-go="program/${
    p.id
  }" style="padding:0;text-align:left"><h3>${
    p.name
  } <span class="verified">${icon("circle-check")}</span></h3></button><p>${
    p.sport
  } · ${p.location} · ${p.distance}</p><footer><span class="rating">${icon(
    "star"
  )} ${p.rating} <span style="font-weight:400;color:var(--muted)">(${
    p.reviews
  } reviews)</span></span><span class="verified">Verified</span></footer></div></article>`;
}
function postCard(post) {
  const person =
    post.person === "me"
      ? {
          name: state.profile.name,
          image: "member-avatar.png",
          role: journeys[state.profile.role].label,
        }
      : getPerson(post.person);
  const likes = post.likes + Number(state.likes.includes(post.id));
  const comments = [...post.comments, ...(state.comments[post.id] || [])];
  return `<article class="post"><header>${avatar(
    person.image
  )}<button class="person-copy" data-go="${
    post.person === "me" ? "profile" : `person/${post.person}`
  }"><strong>${esc(person.name)} <span class="verified">${
    post.person !== "me" ? icon("circle-check") : ""
  }</span></strong><small>${esc(person.role)} · ${
    post.time
  }</small></button></header>${post.text ? `<p>${esc(post.text)}</p>` : ""}${
    post.image ? img(post.image, `Photo shared by ${person.name}`) : ""
  }<footer class="post-actions" aria-label="Post actions"><button data-like="${
    post.id
  }" class="${
    state.likes.includes(post.id) ? "active" : ""
  }" aria-pressed="${state.likes.includes(
    post.id
  )}" aria-label="Like post by ${esc(person.name)}">${icon(
    "heart",
    state.likes.includes(post.id) ? "solid" : "regular"
  )}<span>${likes}</span></button><button data-go="comments/${
    post.id
  }" aria-label="Comments on post by ${esc(person.name)}">${icon(
    "comment",
    "regular"
  )}<span>${comments.length}</span></button><button data-postshare="${
    post.id
  }" aria-label="Share post by ${esc(person.name)}">${icon(
    "arrow-up-from-bracket"
  )}</button><button data-postsave="${
    post.id
  }" aria-pressed="${state.savedPosts.includes(
    post.id
  )}" aria-label="Save post">${icon(
    "bookmark",
    state.savedPosts.includes(post.id) ? "solid" : "regular"
  )}</button></footer></article>`;
}
function home() {
  return `<div class="page restored-home"><section class="hero-card">${img(
    "hero-cinematic-v2.png",
    "Athletes coming together before a game"
  )}<span class="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2>Big dreams.<br />Better next moves.</h2><p>Find your people. Discover your fit.<br />Build a journey that’s yours.</p>${button(
    `Explore programs ${icon("arrow-right")}`,
    "discover",
    "lime-button"
  )}</section><div class="quick-grid">${[
    ["wand-magic-sparkles", "Insight AI", "insight"],
    ["bookmark", "Saved", "saved"],
    ["trophy", "Tournaments", "tournaments"],
    ["user-group", "My network", "network"],
  ]
    .map(([i, t, r]) => button(`${icon(i)}<span>${t}</span>`, r, ""))
    .join("")}</div><button class="match-banner" data-go="insight">${icon(
    "wand-magic-sparkles"
  )}<span><strong>Your next move, made clearer.</strong><small>Explore matches built around your goals.</small></span>${icon(
    "arrow-right"
  )}</button>${heading(
    "Find your next team",
    "Explore all",
    "discover"
  )}<div class="horizontal-cards">${programs
    .slice(0, 3)
    .map(programCard)
    .join("")}</div>${heading(
    "From your circle",
    "View feed",
    "community"
  )}${postCard(basePosts[0])}${heading("Make your voice count")}${row(
    "star",
    "Share your experience",
    "Help another athlete make a better decision.",
    "reviews"
  )}</div>`;
}
function discover() {
  return `<div class="page"><h2>Find where you belong.</h2><p class="subcopy">Good decisions start with the full picture.</p><label class="search-field">${icon(
    "magnifying-glass"
  )}<input id="discover-search" aria-label="Search programs and coaches" placeholder="Programs, coaches, or sports" value="${esc(
    query
  )}" /></label><div class="chips">${["All", "Schools", "Clubs", "Coaches"]
    .map(
      (c) =>
        `<button class="chip ${
          category === c ? "active" : ""
        }" data-category="${c}" aria-pressed="${category === c}">${c}</button>`
    )
    .join(
      ""
    )}</div><div class="results-heading"><span id="result-count"></span>${button(
    `${icon("sliders")} Filters`,
    "filters"
  )}</div><div class="program-list" id="discover-results"></div></div>`;
}
let filters = { sport: "All sports", distance: "Any distance", verified: true };
function filterResults() {
  const found = programs.filter(
    (p) =>
      (category === "All" || p.type === category) &&
      `${p.name} ${p.sport} ${p.location}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filters.sport === "All sports" || p.sport === filters.sport) &&
      (filters.distance === "Any distance" || parseFloat(p.distance) <= 5)
  );
  document.getElementById("result-count").textContent = `${found.length} ${
    found.length === 1 ? "match" : "matches"
  } near Chicago`;
  document.getElementById("discover-results").innerHTML = found.length
    ? found.map(programCard).join("")
    : `<div class="empty">${icon(
        "magnifying-glass"
      )}<h3>No matches yet</h3><p>Try another sport, name, or a wider distance.</p><button class="secondary" data-action="reset-filters">Reset search & filters</button></div>`;
}
function filterPage() {
  return `<div class="page"><h2>Your kind of program.</h2><p class="subcopy">Fine-tune your discovery preferences.</p><form class="form" data-form="filters"><label>Sport<select name="sport">${[
    "All sports",
    "Soccer",
    "Track & field",
    "Basketball",
  ]
    .map(
      (v) => `<option ${filters.sport === v ? "selected" : ""}>${v}</option>`
    )
    .join(
      ""
    )}</select></label><label>Distance from Chicago<select name="distance">${[
    "Any distance",
    "Within 5 miles",
  ]
    .map(
      (v) => `<option ${filters.distance === v ? "selected" : ""}>${v}</option>`
    )
    .join(
      ""
    )}</select></label><p class="note">Verification confirms identity and affiliation. Read firsthand experiences to understand each program.</p><button class="primary full">Show matches</button></form></div>`;
}
function programDetail(id) {
  const p = getProgram(id);

  return `${img(
    p.image,
    p.name,
    "detail-image"
  )}<div class="page detail-page"><span class="eyebrow">${p.type} · ${
    p.sport
  }</span><h2>${p.name}</h2><p class="subcopy">${icon("location-dot")} ${
    p.location
  } · ${p.distance} away</p><div class="pills">${badge(
    "Verified listing"
  )}${badge(
    `${p.fit}% profile fit`,
    "wand-magic-sparkles"
  )}</div><div class="two-actions">${button(
    "Contact program",
    `chat/program-${p.id}`,
    "primary"
  )}<button class="secondary" data-save="${
    p.id
  }" aria-pressed="${state.saved.includes(p.id)}">${icon(
    "bookmark",
    state.saved.includes(p.id) ? "solid" : "regular"
  )} ${
    state.saved.includes(p.id) ? "Saved" : "Save"
  }</button></div><div class="stat-grid"><div><strong>${
    p.rating
  }</strong><small>${p.reviews} reviews</small></div><div><strong>${
    p.fit
  }%</strong><small>Profile fit</small></div><div><strong>${
    p.distance
  }</strong><small>From Chicago</small></div></div>${heading(
    "The bigger picture"
  )}<p class="subcopy">${
    p.description
  }</p><div class="card"><h3>At a glance</h3><p>Program cost <strong style="float:right;color:var(--ink)">${
    p.cost
  }</strong></p><p>Schedule <strong style="float:right;color:var(--ink)">3 sessions / week</strong></p><p>Next intake <strong style="float:right;color:var(--ink)">Fall 2026</strong></p></div>${heading(
    "What the evidence says"
  )}${evidence(p)}${heading(
    "Real experiences",
    `${p.reviews} reviews`,
    `reviews/${p.id}`
  )}${reviewCard(
    "Support that goes beyond the game",
    "The coaches gave specific feedback and helped us understand the development plan. Communication was consistent throughout the season.",
    "Taylor Kim"
  )}<div class="two-actions">${button(
    "Write a review",
    `write-review/${p.id}`,
    "primary"
  )}${button(
    "Compare programs",
    "compare",
    "secondary"
  )}</div><p class="note">Fit scores bring together your goals, preferences, and the evidence behind each program.</p></div>`;
}
function evidence(p) {
  return `<div class="card"><h3>High confidence <span class="verified">${icon(
    "shield-halved"
  )}</span></h3><p>Based on ${p.reviews} community experiences.</p>${[
    ["Player development", p.development],
    ["Academic support", p.academics],
    ["Communication", p.communication],
  ]
    .map(
      ([t, n]) =>
        `<div class="evidence-row"><span>${t}</span><div><em style="width:${n}%"></em></div><b>${n}%</b></div>`
    )
    .join("")}</div>`;
}
function community() {
  const section = route.split("/")[1] || "feed";
  if (section === "messages")
    return `<div class="community-view">${inbox()}</div>`;
  const posts = [...state.posts, ...basePosts].filter(
    (p) =>
      feedFilter === "For you" ||
      (feedFilter === "Following" &&
        (p.person === "me" || state.following.includes(p.person))) ||
      (feedFilter === "Saved" && state.savedPosts.includes(p.id))
  );
  return `<div class="community-view"><div class="page"><button class="community-compose" data-go="compose">${avatar(
    "member-avatar.png",
    "small"
  )}<span>${
    signedIn() ? `Share a moment, ${firstName()}…` : "Join the conversation…"
  }</span>${icon("image", "regular")}</button><div class="chips">${[
    "For you",
    "Following",
    "Saved",
  ]
    .map(
      (c) =>
        `<button class="chip ${
          feedFilter === c ? "active" : ""
        }" data-feed="${c}" aria-pressed="${feedFilter === c}">${c}</button>`
    )
    .join("")}</div>${
    posts.length
      ? posts.map(postCard).join("")
      : `<div class="empty">${icon("bookmark", "regular")}<h3>${
          feedFilter === "Saved"
            ? "Your favorite moments, together."
            : "Find your circle."
        }</h3><p>${
          feedFilter === "Saved"
            ? "Save a post using the bookmark icon to find it here."
            : "Follow people to bring their stories into your feed."
        }</p>${button("Explore people", "network", "secondary")}</div>`
  }</div></div>`;
}
function compose() {
  return `<div class="page"><div class="card" style="display:flex;align-items:center;gap:10px">${avatar()}<div class="person-copy"><strong>${esc(
    state.profile.name
  )}</strong><small>Sharing with the Chinstrap community</small></div></div><form class="form" data-form="post"><label>Your moment<textarea name="text" maxlength="1500" placeholder="A milestone, a lesson, a moment worth sharing…"></textarea></label>${photoPicker(icon)}<p class="note">Share a moment, a milestone, or something your community can learn from.</p><button class="primary full">Share post ${icon(
    "arrow-right"
  )}</button></form></div>`;
}
function comments(id) {
  const p = getPost(id);
  if (!p)
    return emptyPage(
      "Post unavailable",
      "This post may have been removed.",
      "community"
    );
  return `<div class="page">${postCard(p)}${heading("The conversation")}<div>${
    [...p.comments, ...(state.comments[id] || [])]
      .map(
        (c, i) =>
          `<div class="card"><strong style="font-size:11px">${
            i < p.comments.length ? "Community member" : esc(state.profile.name)
          }</strong><p>${esc(c)}</p></div>`
      )
      .join("") ||
    '<p class="subcopy">Start the conversation with a thoughtful comment.</p>'
  }</div><form class="form" data-form="comment" data-id="${id}"><label>Your comment<textarea name="text" maxlength="500" required placeholder="Add to the conversation…"></textarea></label><button class="primary">Post comment</button></form></div>`;
}
function saved() {
  return `<div class="page"><h2>Your next-move shortlist.</h2>${
    (state.savedColleges || []).length
      ? `${heading("College shortlist")} ${insightApp.colleges
          .filter((c) => state.savedColleges.includes(c.id))
          .map((c) => insightApp.collegeCard(c))
          .join("")}${heading("Program shortlist")}`
      : ""
  }<p class="subcopy">A little less searching. A little more clarity.</p>${
    state.saved.length
      ? `<button class="match-banner" data-go="compare">${icon(
          "scale-balanced"
        )}<span><strong>Compare your programs</strong><small>See the differences that matter to you.</small></span>${icon(
          "arrow-right"
        )}</button><div class="section-heading"><h2>${
          state.saved.length
        } saved programs</h2></div><div class="program-list">${programs
          .filter((p) => state.saved.includes(p.id))
          .map(programCard)
          .join("")}</div>`
      : emptyPage(
          "Start your shortlist",
          "Tap the bookmark on any program to save it here.",
          "discover"
        )
  }</div>`;
}
function compare() {
  return `<div class="page"><h2>See the difference.</h2><p class="subcopy">Two programs. The same evidence. Your decision.</p><div class="compare-grid">${[
    0, 1,
  ]
    .map((_, i) => {
      const p = programs.find((p) => p.id === selectedComparison[i]);
      return `<div><label class="field">Program ${
        i + 1
      }<select data-compare="${i}"><option value="">Choose program</option>${programs
        .map(
          (x) =>
            `<option value="${x.id}" ${p?.id === x.id ? "selected" : ""} ${
              selectedComparison[1 - i] === x.id ? "disabled" : ""
            }>${x.name}</option>`
        )
        .join("")}</select></label>${
        p
          ? `<div class="card" style="margin-top:14px">${img(
              p.image,
              p.name
            )}<h3>${p.name}</h3>${[
              ["Profile fit", `${p.fit}%`],
              ["Community rating", `${p.rating} / 5`],
              ["Verified reviews", p.reviews],
              ["Cost", p.cost],
              ["Distance", p.distance],
              ["Development", `${p.development}% positive`],
              ["Communication", `${p.communication}% positive`],
            ]
              .map(
                ([t, v]) =>
                  `<div class="compare-metric"><small>${t}</small><strong>${v}</strong></div>`
              )
              .join("")}${button(
              "View program",
              `program/${p.id}`,
              "text-button"
            )}</div>`
          : '<p class="note" style="margin-top:15px">Choose a program above to compare it.</p>'
      }</div>`;
    })
    .join(
      ""
    )}</div><p class="note">Compare the evidence behind each rating before choosing.</p></div>`;
}
function network() {
  const found = people.filter((p) =>
    `${p.name} ${p.role}`.toLowerCase().includes(networkQuery.toLowerCase())
  );
  return `<div class="page"><h2>Good people. More possibility.</h2><p class="subcopy">Connect with the people who move you forward.</p><label class="search-field">${icon(
    "magnifying-glass"
  )}<input id="network-search" aria-label="Search people" placeholder="Find athletes, coaches, and parents" value="${esc(
    networkQuery
  )}" /></label><div id="network-results">${networkRows(found)}</div>${heading(
    "Your circle"
  )}<div class="card"><h3>${
    state.following.length
  } people you follow</h3><p>See their latest moments in your Following feed.</p>${button(
    "Open Following feed",
    "community",
    "text-button"
  )}</div></div>`;
}
function networkRows(found) {
  return found.length
    ? found
        .map(
          (p) =>
            `<div class="list-row">${avatar(
              p.image
            )}<button class="person-copy" data-go="person/${p.id}"><strong>${
              p.name
            }</strong><small>${
              p.role
            }</small></button><button class="secondary" style="min-height:35px;padding:8px 10px;font-size:10px" data-follow="${
              p.id
            }" aria-pressed="${state.following.includes(p.id)}">${
              state.following.includes(p.id) ? "Following" : "Follow"
            }</button></div>`
        )
        .join("")
    : '<p class="subcopy">No people found. Try a name, role, or sport.</p>';
}
function person(id) {
  const p = getPerson(id);
  return `${img(
    "soccer-stadium.jpg",
    "Soccer stadium",
    "profile-cover"
  )}<div class="profile-body"><div class="profile-top">${avatar(
    p.image,
    "large"
  )}<button class="secondary" data-follow="${
    p.id
  }" aria-pressed="${state.following.includes(p.id)}">${
    state.following.includes(p.id) ? "Following" : "Follow"
  }</button></div><h2>${p.name} <span class="verified">${icon(
    "circle-check"
  )}</span></h2><p class="subcopy">${p.role}</p><p class="subcopy">${
    p.bio
  }</p><div class="pills">${badge("Identity verified")}${badge(
    "Sports community",
    "user-group"
  )}</div>${button("Send a message", `chat/${p.id}`, "primary full")}${heading(
    "Community highlights"
  )}${basePosts
    .filter((post) => post.person === p.id)
    .map(postCard)
    .join("")}</div>`;
}
const events = [
  {
    id: "showcase",
    name: "Chicago Fall ID Showcase",
    date: "OCT 18–20",
    place: "Lakeshore Athletic Complex",
    sport: "Soccer · U16–U19",
    image: "soccer-stadium.jpg",
    price: "$85 / athlete",
  },
  {
    id: "track",
    name: "Midwest College Combine",
    date: "NOV 02",
    place: "Oak Park Athletics Center",
    sport: "Track & field · U14–U18",
    image: "social-track.png",
    price: "$35 / athlete",
  },
];
function tournaments() {
  return `<div class="page"><h2>Show up for what’s next.</h2><p class="subcopy">Competition, connection, and a chance to grow.</p>${events
    .map(
      (e) =>
        `<article class="post event-card">${img(
          e.image,
          e.name
        )}<div class="event-body"><span class="eyebrow">${
          e.date
        } · 2026</span><h3>${e.name}</h3><p>${e.sport}<br />${icon(
          "location-dot"
        )} ${e.place}</p>${button(
          "View event",
          `event/${e.id}`,
          "secondary full"
        )}</div></article>`
    )
    .join("")}</div>`;
}
function eventPage(id) {
  const e = events.find((e) => e.id === id) || events[0];
  return `${img(
    e.image,
    e.name,
    "detail-image"
  )}<div class="page detail-page"><span class="eyebrow">${
    e.date
  } · 2026</span><h2>${e.name}</h2><p class="subcopy">${e.sport}<br />${icon(
    "location-dot"
  )} ${
    e.place
  }</p><div class="card"><h3>Your day at a glance</h3><p>8:30 AM — Athlete check-in<br />9:00 AM — Warm-up & skills sessions<br />11:00 AM — Competitive sessions<br />3:00 PM — Coach feedback & wrap-up</p></div><div class="card"><h3>What’s included</h3><p>Organized competition, qualified staff, water stations, and individual feedback. Bring your own equipment and arrive 30 minutes before your session.</p></div><div class="two-actions"><strong style="align-self:center;font-size:15px">${
    e.price
  }</strong><button class="primary" data-register="${e.id}">${
    state.registered.includes(e.id) ? "Cancel reservation" : "Reserve a spot"
  }</button></div>${
    state.registered.includes(e.id)
      ? '<p class="note">Your reservation is saved. You can cancel it here.</p>'
      : '<p class="note">Reserve your place and keep track of upcoming events.</p>'
  }</div>`;
}
function inbox() {
  return `<div class="page"><label class="search-field">${icon(
    "magnifying-glass"
  )}<input id="inbox-search" aria-label="Search conversations" placeholder="Search messages" /></label><div class="results-heading"><strong>Recent conversations</strong>${button(
    `${icon("pen-to-square")} New`,
    "network"
  )}</div><div id="conversation-list">${people
    .map((p, i) => {
      const latest = (state.messages[p.id] || []).at(-1);
      return `<button class="list-row conversation-row" data-go="chat/${
        p.id
      }" data-conversation="${p.name.toLowerCase()}">${avatar(
        p.image
      )}<span><strong>${p.name}</strong><small>${esc(
        latest?.text ||
          [
            "Happy to talk through your goals for next season.",
            "See you at training this weekend?",
            "Thanks for the program recommendation!",
          ][i]
      )}</small></span><span class="conversation-meta"><small>${
        latest ? "Now" : i === 0 ? "10:24" : "Yesterday"
      }</small>${
        !state.inboxRead && i === 0 ? '<b class="unread">1</b>' : ""
      }</span></button>`;
    })
    .join("")}${Object.keys(state.messages)
    .filter((id) => id.startsWith("program-"))
    .map((id) =>
      row(
        "building",
        getProgram(id.replace("program-", "")).name,
        esc(state.messages[id].at(-1)?.text || ""),
        `chat/${id}`
      )
    )
    .join(
      ""
    )}</div><p class="subcopy" id="conversation-empty" hidden>No conversations found. Try another name.</p></div>`;
}
function chat(id) {
  const p = id.startsWith("program-")
    ? { name: getProgram(id.replace("program-", "")).name }
    : getPerson(id);
  return `<div class="chat"><p class="chat-date">TODAY</p><div class="bubble">Hi ${firstName()}! Thanks for connecting. What are you looking for in your next season?<small>${esc(
    p.name
  )} · 10:24 AM</small></div>${(state.messages[id] || [])
    .map(
      (m) =>
        `<div class="bubble ${m.mine ? "mine" : ""}">${esc(m.text)}<small>${
          m.mine ? "You" : p.name
        } · Just now</small></div>`
    )
    .join(
      ""
    )}<form class="chat-compose" data-form="message" data-id="${id}"><input name="text" aria-label="Message" placeholder="Write a message…" maxlength="1000" required /><button class="icon-button" aria-label="Send message">${icon(
    "arrow-up"
  )}</button></form></div>`;
}
function profile() {
  if (!signedIn())
    return `<div class="page">${guestAccount()}${row(
      "circle-question",
      "Help center",
      "Find your way around Chinstrap",
      "help"
    )}${row("gear", "Settings", "Privacy and preferences", "settings")}</div>`;
  const part = route.split("/")[1] || "overview";
  const profileTabs = `<nav class="profile-segments" aria-label="Profile sections">${[
    ["overview", "Overview"],
    ["posts", "Posts"],
    ["network", "Network"],
  ]
    .map(
      ([key, label]) =>
        `<button data-go="profile/${key}" ${
          part === key ? 'aria-current="page"' : ""
        }>${label}</button>`
    )
    .join("")}</nav>`;
  let content = "";
  if (part === "posts")
    content = state.posts.length
      ? state.posts.map(postCard).join("")
      : `<div class="empty">${icon(
          "image",
          "regular"
        )}<h3>Your story belongs here.</h3><p>Share a highlight, a lesson, or a moment with your community.</p>${button(
          "Create your first post",
          "compose",
          "primary"
        )}</div>`;
  else if (part === "network")
    content = `${heading("Your connections")}${networkRows(
      people.filter((p) => state.following.includes(p.id))
    )}${button("Find more people", "network", "secondary full")}${button(
      "Manage linked connections",
      "connections",
      "text-button full"
    )}`;
  else
    content = `<div class="profile-about"><h3>About</h3><p>${esc(
      state.profile.bio
    )}</p></div><div class="profile-shortcuts">${[
      ["bookmark", "Saved", "saved"],
      ["user-group", "Connections", "connections"],
      ["medal", "Achievements", "achievements"],
    ]
      .map(([i, t, r]) => button(`${icon(i)}<span>${t}</span>`, r, ""))
      .join(
        ""
      )}</div><button class="match-banner" data-go="verification">${icon(
      "shield-halved"
    )}<span><strong>Build trust in your profile</strong><small>${esc(
      state.verification
    )}</small></span>${icon("chevron-right")}</button>${heading(
      "Your next move"
    )}${row(
      "wand-magic-sparkles",
      "Insight AI",
      "Your matches, metrics, and next steps",
      "insight"
    )}${row(
      "star",
      "Your reviews",
      `${state.reviews.length} experiences shared`,
      "my-reviews"
    )}${row(
      "trophy",
      "Events & reservations",
      `${state.registered.length} reservations`,
      "tournaments"
    )}${row(
      "gear",
      "Settings & account",
      "Privacy, access, and preferences",
      "settings"
    )}`;
  return `${img(
    "soccer-stadium.jpg",
    "Soccer stadium",
    "profile-cover"
  )}<div class="profile-body"><div class="profile-top">${avatar(
    "member-avatar.png",
    "large"
  )}${button("Edit profile", "edit-profile", "secondary")}</div><h2>${esc(
    state.profile.name
  )}</h2><p class="subcopy">${journeys[state.profile.role].label} · ${esc(
    state.profile.sport
  )}<br />${icon("location-dot")} ${esc(
    state.profile.city
  )}</p><div class="pills">${badge("Member profile", "user")}${badge(
    esc(
      state.profile.role === "athlete"
        ? state.profile.position
        : journeys[state.profile.role].label
    ),
    "futbol"
  )}</div><div class="stat-grid"><div><strong>${
    state.following.length
  }</strong><small>Following</small></div><div><strong>${
    state.posts.length
  }</strong><small>Posts</small></div><div><strong>${
    state.saved.length + (state.savedColleges || []).length
  }</strong><small>Saved</small></div></div>${profileTabs}<div class="profile-section-content">${content}</div></div>`;
}
function editProfile() {
  return `<div class="page"><p class="subcopy">Make your profile feel like you.</p><form class="form" data-form="profile">${[
    ["Full name", "name", "text"],
    ["City / region", "city", "text"],
    ["Primary sport", "sport", "text"],
    ["Position / specialty", "position", "text"],
  ]
    .map(
      ([label, name, type]) =>
        `<label>${label}<input name="${name}" type="${type}" value="${esc(
          state.profile[name]
        )}" ${name === "name" ? "required" : ""} maxlength="80" /></label>`
    )
    .join("")}<label>About you<textarea name="bio" maxlength="300">${esc(
    state.profile.bio
  )}</textarea></label><button class="primary">Save profile</button></form></div>`;
}
function reviewCard(title, text, name = "Jamie Smith", stars = 5) {
  return `<article class="card review-card"><header>${avatar(
    "social-avatar-3.png",
    "small"
  )}<div class="person-copy"><strong>${esc(
    name
  )}</strong><small style="color:#ba9343">${Array.from({ length: stars }, () =>
    icon("star")
  ).join("")}</small></div></header><h3>${esc(title)}</h3><p>${esc(
    text
  )}</p>${badge(
    name === state.profile.name
      ? "Pending verification"
      : "Verified relationship"
  )}</article>`;
}
function verification() {
  const j = journeys[state.profile.role];
  return `<div class="page"><h2>Trust has a clear meaning.</h2><p class="subcopy">Choose one way to support your ${j.label.toLowerCase()} profile.</p><div class="card"><span class="eyebrow">VERIFICATION STATUS</span><h3 style="margin-top:10px">${esc(
    state.verification
  )}</h3><p>Submitting evidence does not automatically grant a verified badge.</p></div><form class="form" data-form="verification"><label>Verification method<select name="method" id="verification-method">${j.methods
    .map(([name], i) => `<option value="${i}">${name}</option>`)
    .join("")}</select></label><div id="verification-input">${verificationInput(
    j.methods[0]
  )}</div><p class="note">Your profile stays unverified until your evidence has been reviewed.</p><button class="primary">Request verification</button></form>${heading(
    "What the badges mean"
  )}${row(
    "user-check",
    "Identity verified",
    "A real person owns this account.",
    "verification"
  )}${row(
    "futbol",
    "Affiliation verified",
    "A sports relationship has been reviewed.",
    "verification"
  )}${row(
    "star",
    "Review eligible",
    "Evidence supports a firsthand experience.",
    "reviews"
  )}</div>`;
}
function verificationInput(method) {
  return `<label class="field">${method[3]}<input name="proof" type="${
    method[2]
  }" required ${
    method[2] === "file" ? 'accept="image/*,.pdf"' : ""
  } /></label><p class="subcopy" style="margin-top:8px">${method[1]}</p>`;
}
function signedIn() {
  return ["signed-in", "onboarding"].includes(state.session?.mode);
}
const publicScreens = new Set([
  "home",
  "discover",
  "filters",
  "program",
  "reviews",
  "community",
  "comments",
  "person",
  "network",
  "tournaments",
  "event",
  "profile",
  "settings",
  "privacy-settings",
  "notification-settings",
  "about",
  "help",
  ...authRoutes,
]);
function requiresAccount(screen, id) {
  return (
    !signedIn() &&
    (!publicScreens.has(screen) ||
      (screen === "community" && id === "messages"))
  );
}
function accountGate(feature, destination = route) {
  if (destination && !authRoutes.includes(destination.split("/")[0])) {
    state.returnTo = destination;
    save();
  }
  const names = {
    insight: "Insight AI",
    "insight-matches": "your college matches",
    "insight-metrics": "your athlete metrics",
    "insight-run": "your analysis",
    "insight-history": "your analysis history",
    "insight-report": "your report",
    college: "your college matches",
    saved: "your saved programs",
    compare: "program comparisons",
    community: "your messages",
    inbox: "your messages",
    chat: "your conversations",
    compose: "your community",
    "write-review": "your review",
    "my-reviews": "your reviews",
    connections: "your connections",
    achievements: "your achievements",
    verification: "your verification",
    billing: "your plans and credits",
  };
  const label = names[feature] || feature || "your account";
  return `<div class="page account-required"><span class="account-required-icon">${icon(
    feature.startsWith("insight") || feature === "college"
      ? "wand-magic-sparkles"
      : "lock"
  )}</span><span class="eyebrow">YOUR NEXT MOVE STARTS HERE</span><h2>Sign in to access<br />${esc(
    label
  )}.</h2><p>Keep your journey connected with a free Chinstrap account.</p><div class="account-benefits"><span>${icon(
    "bookmark",
    "regular"
  )} Save programs and build your shortlist</span><span>${icon(
    "comments",
    "regular"
  )} Connect with your sports community</span><span>${icon(
    "wand-magic-sparkles"
  )} Explore insights built around your goals</span></div>${button(
    "Sign in",
    "login",
    "primary full"
  )}${button("Create a free account", "signup", "secondary full")}${button(
    "Keep exploring",
    "home",
    "text-button full"
  )}</div>`;
}
function requireActionAccount() {
  state.returnTo = route;
  save();
  main.innerHTML = accountGate("your community", route);
  document.getElementById("create-post-fab").hidden = true;
  main.scrollTop = 0;
  main.focus({ preventScroll: true });
}
function settingsGroup(title, content) {
  return `<section class="settings-group"><h2>${title}</h2><div>${content}</div></section>`;
}
function preference(key, title, copy) {
  return `<label class="preference-row"><span><strong>${title}</strong><small>${copy}</small></span><input class="app-switch" role="switch" type="checkbox" data-preference="${key}" ${
    state.preferences[key] ? "checked" : ""
  } /></label>`;
}
function guestAccount() {
  return `<div class="guest-account"><span class="guest-avatar">${icon(
    "user",
    "regular"
  )}</span><h2>Your next chapter starts here.</h2><p>Sign in to save your progress, connect with your community, and build your profile.</p><div>${button(
    "Sign in",
    "login",
    "primary"
  )}${button(
    "Create account",
    "signup",
    "secondary"
  )}</div><small>You’re browsing as a guest</small></div>`;
}
function settings() {
  const account = signedIn();
  return `<div class="page settings-page">${
    account
      ? `<button class="settings-account" data-go="profile">${avatar()}<span><strong>${esc(
          state.profile.name
        )}</strong><small>${esc(state.profile.email)}</small></span>${icon(
          "chevron-right"
        )}</button>`
      : guestAccount()
  }
  ${
    account
      ? settingsGroup(
          "Account",
          row(
            "user",
            "Edit profile",
            "Your name, sport, and story",
            "edit-profile"
          ) +
            row(
              "lock",
              "Account & security",
              "Email address and password",
              "account-security"
            ) +
            row(
              "shield-halved",
              "Verification",
              "Manage your verification status",
              "verification"
            ) +
            row(
              "credit-card",
              "Plans & credits",
              `${esc(state.plan)} · ${state.credits} credits`,
              "billing"
            ) +
            row(
              "id-card",
              "Profile setup",
              "Your role and sports background",
              "onboarding"
            )
        )
      : ""
  }
  ${settingsGroup(
    "Preferences",
    row(
      "eye",
      "Privacy",
      "Choose who can find your profile",
      "privacy-settings"
    ) +
      row(
        "bell",
        "Notifications",
        "Messages, activity, and updates",
        "notification-settings"
      )
  )}
  ${settingsGroup(
    "Support",
    row(
      "circle-question",
      "Help center",
      "Answers to common questions",
      "help"
    ) +
      row("file-lines", "Terms of use", "", "legal/terms") +
      row("shield", "Privacy policy", "", "legal/privacy") +
      row("circle-info", "About Chinstrap", "", "about")
  )}
  ${
    account
      ? `<button class="logout-button" data-auth-action="signout">${icon(
          "arrow-right-from-bracket"
        )} Log out</button>`
      : ""
  }<p class="app-version">Chinstrap · Version 1.0.0</p></div>`;
}
function accountSecurity() {
  return `<div class="page settings-page">${settingsGroup(
    "Sign-in details",
    row("envelope", "Email address", esc(state.profile.email), "edit-profile") +
      row(
        "lock",
        "Change password",
        "Keep your account secure",
        "forgot-password"
      )
  )}<p class="subcopy">Keep your email address up to date so you can recover access to your account.</p></div>`;
}
function privacySettings() {
  return `<div class="page settings-page"><p class="subcopy">Choose how you appear to the community.</p>${settingsGroup(
    "Profile & discovery",
    preference(
      "discoverable",
      "Profile discoverability",
      "Let verified members find your profile."
    ) +
      preference(
        "recommendations",
        "Personalized recommendations",
        "Use your sport, goals, and location to improve suggestions."
      )
  )}${row(
    "shield",
    "Privacy policy",
    "Learn how your information is handled",
    "legal/privacy"
  )}</div>`;
}
function notificationSettings() {
  return `<div class="page settings-page"><p class="subcopy">Stay connected to what matters to you.</p>${settingsGroup(
    "Activity",
    preference("messages", "Messages", "New conversations and replies.") +
      preference(
        "connections",
        "Connections",
        "Invitations and new followers."
      ) +
      preference(
        "updates",
        "Community updates",
        "Posts, programs, and events you follow."
      )
  )}${settingsGroup(
    "Your progress",
    preference(
      "insights",
      "Insight AI",
      "New reports and development reminders."
    ) +
      preference(
        "reviewUpdates",
        "Reviews & verification",
        "Changes to your review and verification status."
      )
  )}</div>`;
}
function help() {
  return `<div class="page settings-page"><h2>How can we help?</h2><p class="subcopy">A little guidance for your next move.</p>${[
    [
      "How do I update my profile?",
      "Open your profile from the avatar on Home, then choose Edit profile.",
    ],
    [
      "Where can I find my messages?",
      "Open Community and tap the chat icon in the top-right corner.",
    ],
    [
      "How does review verification work?",
      "Choose the school, team, professional, or event, write your review, and select a way to support your relationship. Your review stays pending until verified.",
    ],
    [
      "Where are my saved programs?",
      "Tap Saved on Home to see your program and college shortlist.",
    ],
    [
      "How do I manage Insight AI credits?",
      "Open Settings → Plans & credits to see access options. Saved reports are available in Insight AI → History.",
    ],
  ]
    .map(
      ([q, a]) =>
        `<details class="help-answer"><summary>${q}</summary><p>${a}</p></details>`
    )
    .join("")}</div>`;
}
function billing() {
  const j = journeys[state.profile.role];
  return `<div class="page"><h2>Room to grow.</h2><p class="subcopy">Start with community. Add insights when you need them.</p>${j.plans
    .map(
      ([name, price, copy]) =>
        `<div class="card"><span class="eyebrow">${
          state.plan === name ? "CURRENT PLAN" : "OPTIONAL ACCESS"
        }</span><h3 style="font-size:20px;margin-top:10px">${name}</h3><p style="font-size:21px;color:var(--ink)">${price}</p><p>${copy}</p><button class="${
          state.plan === name ? "secondary" : "primary"
        } full" style="margin-top:16px" data-plan="${name}" ${
          state.plan === name ? "disabled" : ""
        }>${state.plan === name ? "Selected" : "Choose plan"}</button></div>`
    )
    .join("")}${heading(
    "One-time credit packs"
  )}<p class="subcopy">Choose what fits the season.</p>${[
    ["Trial Pack", "$4.99", 3],
    ["Explorer Pack", "$12.99", 10],
    ["Recruiting Pack", "$24.99", 25],
  ]
    .map(
      ([name, price, credits]) =>
        `<div class="card credit-pack"><div><h3>${name}</h3><p>${credits} credits · 90 days</p></div><strong>${price}</strong><button class="secondary full" data-credit-pack="${name}">Choose pack</button></div>`
    )
    .join(
      ""
    )}<p class="note">Review your plan and credit allowance before continuing.</p></div>`;
}
function notifications() {
  return `<div class="page"><div class="results-heading"><span>${
    state.notificationsRead ? "You’re all caught up" : "3 new updates"
  }</span><button class="text-button" data-action="read-notifications">Mark all read</button></div>${row(
    "wand-magic-sparkles",
    "Your next match is waiting",
    "Northstar Academy aligns with your development goals.",
    "program/northstar"
  )}${row(
    "comment-dots",
    "Maya Chen sent you a message",
    "“Happy to talk through your goals for next season.”",
    "chat/maya"
  )}${row(
    "trophy",
    "A new opportunity nearby",
    "Chicago Fall ID Showcase · October 18–20",
    "event/showcase"
  )}</div>`;
}
function about() {
  return `<div class="page about-app">${img(
    "chinstrap-notch-logo-v2.png",
    "Chinstrap"
  )}<h2>Your sports world.<br />A clearer next move.</h2><p class="subcopy">Find your people, discover programs that fit, and build a journey that’s yours.</p><div class="card"><h3>Built around your journey</h3><p>Connect with your community, learn from firsthand experiences, and explore your next opportunity with Insight AI.</p></div>${row(
    "file-lines",
    "Terms of use",
    "",
    "legal/terms"
  )}${row(
    "shield",
    "Privacy policy",
    "",
    "legal/privacy"
  )}<p class="app-version">Version 1.0.0</p></div>`;
}
function emptyPage(title, copy, destination = "home") {
  return `<div class="empty">${icon(
    "compass"
  )}<h3>${title}</h3><p>${copy}</p>${button(
    "Explore",
    "" + destination,
    "primary"
  )}</div>`;
}
function connections() {
  return `<div class="page"><h2>Your support team.</h2><p class="subcopy">Connections are consent-based. An invitation never grants access automatically.</p>${
    state.profile.role === "parent"
      ? '<div class="card"><h3>Linked athletes</h3><p>Jamie Smith · Soccer · Class of 2027<br />Alex Smith · Soccer · Class of 2028</p>' +
        button("View family insights", "insight", "text-button") +
        "</div>"
      : ""
  }<form class="form" data-form="connection"><label>Connection type<select name="relationship"><option>Parent / guardian</option><option>Athlete</option><option>Coach / mentor</option><option>Teammate</option></select></label><label>Email address<input name="email" type="email" required placeholder="name@example.com" /></label><button class="primary">Prepare invitation</button></form>${heading(
    "Pending invitations"
  )}${
    (state.invitations || [])
      .map(
        (x) =>
          `<div class="card"><h3>${esc(x.relationship)}</h3><p>${esc(
            x.email
          )}</p>${badge("Prepared · not sent", "clock")}</div>`
      )
      .join("") ||
    '<p class="subcopy">No invitations yet. Add someone you trust when you’re ready.</p>'
  }<p class="note">Invitations require the recipient’s consent before a connection is made.</p></div>`;
}
function achievements() {
  return `<div class="page"><h2>Every milestone matters.</h2><p class="subcopy">Keep a record of the work and moments you’re proud of.</p><form class="form" data-form="achievement"><label>Achievement<input name="title" required maxlength="100" placeholder="e.g. Team captain, 2026 season" /></label><label>What it means to you<textarea name="description" maxlength="400" placeholder="Add a little context…"></textarea></label><button class="primary">Add achievement</button></form>${heading(
    "Your milestones"
  )}${
    (state.achievements || [])
      .map(
        (x) =>
          `<div class="card"><span class="eyebrow">${icon(
            "medal"
          )} MILESTONE</span><h3 style="margin-top:10px">${esc(
            x.title
          )}</h3><p>${esc(x.description)}</p></div>`
      )
      .join("") ||
    '<div class="card"><h3>A story worth keeping</h3><p>Add your first milestone above. Small steps count, too.</p></div>'
  }</div>`;
}
function onboardingField(f, i) {
  const name = `field-${i}`,
    value =
      onboarding.drafts[`${onboarding.role}-${onboarding.step}`]?.[name] || "";
  return `<label>${esc(f.label)}${
    f.type === "select"
      ? `<select name="${name}"><option value="">Select an option</option>${f.options
          .map(
            (o) => `<option ${o === value ? "selected" : ""}>${esc(o)}</option>`
          )
          .join("")}</select>`
      : `<input name="${name}" type="${f.type}" value="${esc(
          value
        )}" placeholder="${esc(f.placeholder)}" ${
          onboarding.step === 2 && (i === 0 || f.type === "email")
            ? "required"
            : ""
        } ${f.type === "number" ? 'min="1900" max="2100"' : ""} />`
  }</label>`;
}
function onboardingPage() {
  const j = journeys[onboarding.role],
    step = onboarding.step;
  let body = "";
  if (step === 1)
    body = `<h2>Let’s find your place<br />in the game.</h2><p class="subcopy">Choose your main role. We’ll tailor your profile and tools around you.</p><div class="web-role-choices">${Object.entries(
      journeys
    )
      .map(
        ([key, v], i) =>
          `<button type="button" class="role-choice ${
            onboarding.role === key ? "active" : ""
          }" data-role="${key}" aria-pressed="${
            onboarding.role === key
          }">${icon(
            [
              "person-running",
              "people-roof",
              "clipboard-user",
              "briefcase",
              "building",
            ][i]
          )}<span><strong>${
            [
              "I’m an athlete",
              "I’m a parent",
              "I’m a coach or director",
              "I’m an agent or advisor",
              "I represent an organization",
            ][i]
          }</strong><small>${
            [
              "Build your profile and find your next opportunity",
              "Support your athlete’s next chapter",
              "Connect your expertise with your community",
              "Grow your professional network",
              "Manage your team or organization",
            ][i]
          }</small></span><i class="fa-solid fa-circle-check role-selected" aria-hidden="true"></i></button>`
      )
      .join("")}</div>`;
  if (step === 2 || step === 3) {
    const part = step === 2 ? j.profile : j.context;
    body = `<h2>${part[0]}</h2><p class="subcopy">${
      part[1]
    }</p><div class="form">${part[2].map(onboardingField).join("")}</div>`;
  }
  if (step === 4)
    body = `<h2>${j.connectionTitle}</h2><p class="subcopy">${
      j.connectionCopy
    }</p><div class="form">${j.connections
      .map(
        ([name, copy], i) =>
          `<div class="card"><h3>${name}</h3><p>${copy}</p><label style="margin-top:12px">Email address<input type="email" name="invite-${i}" placeholder="name@example.com" value="${esc(
            onboarding.drafts[`${onboarding.role}-4`]?.[`invite-${i}`] || ""
          )}" /></label></div>`
      )
      .join(
        ""
      )}</div><p class="note">Optional. You can connect with people later from your profile.</p>`;
  if (step === 5)
    body = `<h2>Choose how you want to verify.</h2><p class="subcopy">Choose a method that fits your role, or finish this later. Your evidence stays private.</p><div class="form"><div class="web-verification-options">${j.methods
      .map(
        ([name, copy, type], i) =>
          `<label><input type="radio" name="method" data-onboarding-method value="${i}" ${
            Number(onboarding.drafts[`${onboarding.role}-5`]?.method || 0) === i
              ? "checked"
              : ""
          } /><i class="fa-solid fa-${
            type === "email"
              ? "envelope"
              : type === "url"
              ? "link"
              : type === "file"
              ? "file-shield"
              : "user-check"
          }" aria-hidden="true"></i><span><strong>${esc(
            name
          )}</strong><small>${esc(copy)}</small></span></label>`
      )
      .join("")}</div><div id="onboarding-proof">${verificationInput(
      j.methods[Number(onboarding.drafts[`${onboarding.role}-5`]?.method || 0)]
    ).replace(
      " required",
      ""
    )}</div></div><p class="note">You can finish verification later in Settings.</p>`;
  if (step === 6)
    body = `<h2>Your profile. Your choices.</h2><p class="subcopy">Start free and choose what you share.</p><div class="form">${j.plans
      .map(
        ([name, price, copy], i) =>
          `<label class="card check-row"><span><strong>${name} · ${price}</strong><p>${copy}</p></span><input type="radio" name="plan" value="${name}" ${
            i === 0 ? "checked" : ""
          } /></label>`
      )
      .join("")}${j.privacy
      .map(
        (p, i) =>
          `<label class="check-row"><span>${p}</span><input type="checkbox" name="privacy-${i}" /></label>`
      )
      .join(
        ""
      )}</div><p class="note" style="margin-top:20px">You can update your preferences and access plan in Settings.</p>`;
  return `<div class="page web-onboarding"><div class="web-setup-progress"><span>STEP ${step} OF 6</span><strong>${
    j.steps[step - 1]
  }</strong><div class="web-step-dots" aria-label="Step ${step} of 6">${j.steps
    .map(
      (label, i) =>
        `<span class="${
          i + 1 === step ? "current" : i + 1 < step ? "complete" : ""
        }" title="${label}" ${i + 1 === step ? 'aria-current="step"' : ""}>${
          i + 1 < step ? icon("check") : i + 1
        }</span>`
    )
    .join(
      ""
    )}</div></div><form id="onboarding-form" data-form="onboarding" novalidate><div class="onboarding-content">${body}</div></form></div>`;
}
const titles = {
  home: "Your next move.",
  discover: "Discover",
  community: "Community",
  inbox: "Inbox",
  profile: "My profile",
  program: "Program details",
  saved: "Saved programs",
  compare: "Compare programs",
  insight: "Insight AI",
  network: "My network",
  person: "Community profile",
  tournaments: "Tournaments",
  event: "Event details",
  chat: "Conversation",
  reviews: "Reviews",
  "write-review": "Write a review",
  verification: "Verification",
  settings: "Settings",
  billing: "Plan & access",
  notifications: "Notifications",
  about: "About Chinstrap",
  welcome: "Chinstrap",
  login: "Welcome back",
  onboarding: "Your journey",
  "edit-profile": "Edit profile",
  compose: "Create a post",
  comments: "Comments",
  filters: "Discovery filters",
};
Object.assign(titles, {
  discover: "Explore",
  inbox: "Messages",
  signup: "Create account",
  "verify-email": "Verify email",
  "forgot-password": "Account recovery",
  "reset-code": "Verify code",
  "reset-password": "Reset password",
  "reset-complete": "All set",
  provider: "Connected sign-in",
  "onboarding-ready": "Welcome to Chinstrap",
  legal: "Policies",
  "account-security": "Account & security",
  "privacy-settings": "Privacy",
  "notification-settings": "Notifications",
  help: "Help center",
  "insight-matches": "College matches",
  "insight-metrics": "Your metrics",
  "insight-run": "New analysis",
  "insight-history": "Analysis history",
  "insight-report": "Saved report",
  college: "College profile",
  connections: "Linked connections",
  achievements: "Achievements",
  "my-reviews": "Your reviews",
});
const parents = {
  program: "discover",
  filters: "discover",
  saved: "home",
  compare: "discover",
  insight: "insight",
  network: "community",
  person: "community",
  tournaments: "home",
  event: "home",
  chat: "community/messages",
  reviews: "reviews",
  "write-review": "reviews",
  "review-verification": "reviews",
  verification: "home",
  settings: "home",
  billing: "insight",
  notifications: "home",
  "edit-profile": "home",
  compose: "community",
  comments: "community",
  about: "home",
  inbox: "community",
  profile: "home",
  connections: "community",
  achievements: "home",
  "my-reviews": "reviews",
  "account-security": "home",
  "privacy-settings": "home",
  "notification-settings": "home",
  help: "home",
};
function render(resetScroll = true) {
  route = decodeURIComponent(
    location.hash.slice(1) || (state.session ? "home" : "welcome")
  );
  const [screen, id] = route.split("/");
  if (screen === "signup") {
    startOnboarding(!state.onboarding, true);
    return;
  }
  const isTab = tabs.some(([r]) => r === screen) && !id;
  const noTabs = authRoutes.includes(screen);
  const activeTab =
    screen.startsWith("insight") || screen === "college"
      ? "insight"
      : screen === "community"
      ? "community"
      : isTab
      ? screen
      : parents[screen];
  let title =
    screen === "review-verification"
      ? "Review verification"
      : titles[screen] || "Chinstrap";
  if (screen === "community" && id === "messages") title = "Messages";
  if (screen === "chat")
    title = id?.startsWith("program-")
      ? getProgram(id.replace("program-", "")).name
      : getPerson(id).name;
  header.hidden = screen === "welcome";
  header.classList.toggle("auth-header", noTabs);
  const notificationButton = `<button class="icon-button" data-go="notifications" aria-label="Notifications">${icon(
    "bell",
    "regular"
  )}${
    state.notificationsRead ? "" : '<span class="notification-dot"></span>'
  }</button>`;
  let headerActions = isTab ? notificationButton : "";
  if (screen === "home")
    headerActions =
      notificationButton + iconButton("gear", "Settings", 'data-go="settings"');
  if (screen === "community")
    headerActions =
      id === "messages"
        ? iconButton("pen-to-square", "New message", 'data-go="network"')
        : iconButton("comments", "Messages", 'data-go="community/messages"');
  if (screen === "inbox")
    headerActions = iconButton(
      "pen-to-square",
      "New message",
      'data-go="network"'
    );
  if (screen === "profile")
    headerActions = iconButton("gear", "Settings", 'data-go="settings"');
  if (noTabs && screen !== "welcome")
    headerActions = `<button class="text-button" data-auth-action="guest">Continue as guest</button>`;
  const headerLeft =
    screen === "home"
      ? `<button class="home-profile-entry" data-go="profile" aria-label="Open my profile">${
          signedIn()
            ? avatar("member-avatar.png")
            : `<span class="avatar initials">${icon("user", "regular")}</span>`
        }<span><small>${
          signedIn() ? "WELCOME BACK" : "WELCOME TO CHINSTRAP"
        }</small><strong>${
          signedIn() ? esc(state.profile.name) : "Guest"
        }</strong></span></button>`
      : `<div class="header-left">${
          !isTab
            ? iconButton("arrow-left", "Go back", 'data-action="back"')
            : ""
        }<div><h1>${title}</h1></div></div>`;
  header.innerHTML = `${headerLeft}<div class="header-actions">${headerActions}</div>`;
  const setupFooter = document.getElementById("onboarding-actions");
  setupFooter.hidden = screen !== "onboarding";
  setupFooter.innerHTML =
    screen === "onboarding"
      ? `<div class="setup-footer-copy">Setting up ${
          journeys[onboarding.role].article
        } profile</div><div><button class="secondary" data-action="back">Back</button><button class="primary" type="submit" form="onboarding-form">${
          onboarding.step === 6 ? "Create my workspace" : "Continue"
        } ${icon("arrow-right")}</button></div>${
          [4, 5].includes(onboarding.step)
            ? '<button class="text-button full" data-action="skip-onboarding">Skip for now</button>'
            : ""
        }`
      : "";

  const tabBar = document.getElementById("tab-bar");
  tabBar.hidden = noTabs;
  document.getElementById("create-post-fab").hidden =
    screen !== "community" || Boolean(id && id !== "feed");
  tabBar.innerHTML = tabs
    .map(
      ([r, i, t]) =>
        `<button data-go="${r}" class="${r === activeTab ? "active" : ""} ${
          r === "insight" ? "insight-tab" : ""
        }" ${r === activeTab ? 'aria-current="page"' : ""}>${icon(
          i
        )}<span>${t}</span></button>`
    )
    .join("");
  const screens = {
    home,
    discover,
    filters: filterPage,
    program: () => programDetail(id),
    community,
    compose,
    comments: () => comments(id),
    saved,
    compare,
    network,
    person: () => person(id),
    tournaments,
    event: () => eventPage(id),
    inbox,
    chat: () => chat(id || "maya"),
    profile,
    "edit-profile": editProfile,

    verification,
    settings,
    "account-security": accountSecurity,
    "privacy-settings": privacySettings,
    "notification-settings": notificationSettings,
    help,
    billing,
    notifications,
    about,
    onboarding: onboardingPage,
    connections,
    achievements,
    ...auth.screens,
    ...insightApp.screens,
    ...reviewApp.screens,
  };
  main.innerHTML = requiresAccount(screen, id)
    ? accountGate(screen)
    : screens[screen]
    ? screens[screen](id)
    : emptyPage("Let’s get you back on track.", "We couldn’t find that page.");
  if (!signedIn())
    main.querySelectorAll('[data-form="comment"]').forEach((form) => {
      form.outerHTML = `<div class="guest-inline"><strong>Join the conversation</strong><p>Sign in or create an account to leave a comment.</p>${button(
        "Sign in",
        "login",
        "primary"
      )}${button("Create account", "signup", "text-button")}</div>`;
    });
  if (screen === "discover") filterResults();
  if (screen === "onboarding") restoreOnboarding();
  if (resetScroll) main.scrollTop = 0;
  if (screen === "chat" && signedIn()) main.scrollTop = main.scrollHeight;
  document.title = `${title} — Chinstrap Mobile`;
}
function startOnboarding(fresh = false, replace = false) {
  if (fresh) onboarding = { role: state.profile.role, step: 1, drafts: {} };
  const key = `${onboarding.role}-2`;
  if (!onboarding.drafts[key])
    onboarding.drafts[key] =
      onboarding.role === "organization"
        ? {
            "field-0":
              state.profile.role === "organization"
                ? state.profile.name
                : "Northstar Academy",
            "field-3": state.profile.city,
            "field-4": state.profile.name,
            "field-5": state.profile.email,
          }
        : {
            "field-0": state.profile.name,
            "field-2": state.profile.email,
            "field-3": state.profile.city,
          };
  state.onboarding = onboarding;
  save();
  go("onboarding", replace);
}
function captureOnboarding() {
  const form = document.getElementById("onboarding-form");
  if (!form) return;
  const data = Object.fromEntries(new FormData(form));
  for (const key of Object.keys(data))
    if (data[key] instanceof File) delete data[key];
  onboarding.drafts[`${onboarding.role}-${onboarding.step}`] = data;
  state.onboarding = onboarding;
  save();
}
function restoreOnboarding() {
  const data = onboarding.drafts[`${onboarding.role}-${onboarding.step}`];
  if (!data) return;
  const form = document.getElementById("onboarding-form");
  if (onboarding.step === 5 && data.method) {
    form.elements.method.value = data.method;
    document.getElementById("onboarding-proof").innerHTML = verificationInput(
      journeys[onboarding.role].methods[Number(data.method)]
    ).replace(" required", "");
  }
  for (const el of form.elements) {
    if (!el.name || el.type === "file") continue;
    if (el.type === "radio") el.checked = data[el.name] === el.value;
    else if (el.type === "checkbox") el.checked = el.name in data;
    else if (data[el.name] !== undefined) el.value = data[el.name];
  }
}
function advanceOnboarding() {
  captureOnboarding();
  if (onboarding.step < 6) {
    onboarding.step++;
    state.onboarding = onboarding;
    save();
    render();
    main.focus({ preventScroll: true });
    return;
  }
  const details = onboarding.drafts[`${onboarding.role}-2`] || {},
    context = onboarding.drafts[`${onboarding.role}-3`] || {},
    last = onboarding.drafts[`${onboarding.role}-6`] || {};
  state.profile = {
    ...state.profile,
    role: onboarding.role,
    name: details["field-0"] || state.profile.name,
    email:
      details[
        `field-${journeys[onboarding.role].profile[2].findIndex(
          (f) => f.type === "email"
        )}`
      ] || state.profile.email,
    city: details["field-3"] || state.profile.city,
  };
  const sportIndex = journeys[onboarding.role].profile[2].findIndex(
    (f) => f.label === "Primary sport"
  );
  const contextSportIndex = journeys[onboarding.role].context[2].findIndex(
    (f) => f.label === "Primary sport"
  );
  state.profile.sport =
    details[`field-${sportIndex}`] ||
    context[`field-${contextSportIndex}`] ||
    state.profile.sport;
  state.plan = last.plan || "Community";
  state.preferences.discoverable = "privacy-0" in last;
  state.preferences.updates = "privacy-1" in last;
  state.verification = "Not submitted";
  state.session = {
    mode: "signed-in",
    provider: state.session?.provider || "demo",
  };
  state.onboarding = null;
  state.authDraft = null;
  save();
  onboarding.step = 1;
  const next = state.returnTo || "home";
  state.returnTo = null;
  save();
  go(next, true);
}
document.addEventListener("click", (event) => {
  const b = event.target.closest("button");
  if (!b) return;
  if (
    !signedIn() &&
    b.matches(
      "[data-save],[data-like],[data-postsave],[data-follow],[data-register],[data-plan],[data-credit-pack],[data-review-helpful],[data-review-action]"
    )
  ) {
    requireActionAccount();
    return;
  }
  if (auth.click(b) || insightApp.click(b) || reviewApp.click(b)) return;
  if (handlePhotoAction(b)) return;
  if (b.dataset.go) {
    if (b.dataset.go === "onboarding") {
      startOnboarding(!state.onboarding);
      return;
    }
    if (b.dataset.go.startsWith("chat/")) {
      state.inboxRead = true;
      save();
    }
    if (b.textContent.includes("Following feed")) feedFilter = "Following";
    go(b.dataset.go);
    return;
  }
  if (b.dataset.save) {
    toggle("saved", b.dataset.save);
    refresh();
    toast(
      state.saved.includes(b.dataset.save)
        ? "Added to your shortlist."
        : "Removed from your shortlist."
    );
    return;
  }
  if (b.dataset.creditPack) {
    toast(`${b.dataset.creditPack} selected.`);
    return;
  }
  if (b.dataset.toast) {
    toast(b.dataset.toast);
    return;
  }
  if (b.dataset.postshare) {
    const url = new URL(location.href);
    url.hash = `comments/${b.dataset.postshare}`;
    const dialog = document.getElementById("post-share-sheet");
    dialog.querySelector("input").value = url.href;
    dialog.showModal();
    return;
  }
  if (b.dataset.action === "close-share") {
    document.getElementById("post-share-sheet").close();
    return;
  }
  if (b.dataset.action === "copy-post-link") {
    const input = document.querySelector("#post-share-sheet input");
    if (navigator.clipboard)
      navigator.clipboard
        .writeText(input.value)
        .then(() => {
          document.getElementById("post-share-sheet").close();
          toast("Post link copied.");
        })
        .catch(() => {
          input.focus();
          input.select();
        });
    else {
      input.focus();
      input.select();
    }
    return;
  }
  if (b.dataset.like) {
    toggle("likes", b.dataset.like);
    refresh();
    return;
  }
  if (b.dataset.postsave) {
    toggle("savedPosts", b.dataset.postsave);
    refresh();
    toast(
      state.savedPosts.includes(b.dataset.postsave)
        ? "Post saved. Find it in Community → Saved."
        : "Post removed from saved."
    );
    return;
  }
  if (b.dataset.follow) {
    toggle("following", b.dataset.follow);
    refresh();
    return;
  }
  if (b.dataset.category) {
    category = b.dataset.category;
    refresh();
    return;
  }
  if (b.dataset.feed) {
    feedFilter = b.dataset.feed;
    refresh();
    return;
  }
  if (b.dataset.register) {
    toggle("registered", b.dataset.register);
    refresh();
    toast(
      state.registered.includes(b.dataset.register)
        ? "Reservation saved."
        : "Reservation canceled."
    );
    return;
  }
  if (b.dataset.plan) {
    state.plan = b.dataset.plan;
    save();
    refresh();
    toast("Plan selected.");
    return;
  }
  if (b.dataset.role) {
    captureOnboarding();
    onboarding.role = b.dataset.role;
    const key = `${onboarding.role}-2`;
    if (!onboarding.drafts[key])
      onboarding.drafts[key] =
        onboarding.role === "organization"
          ? {
              "field-0":
                state.profile.role === "organization"
                  ? state.profile.name
                  : "Northstar Academy",
              "field-3": state.profile.city,
              "field-4": state.profile.name,
              "field-5": state.profile.email,
            }
          : {
              "field-0": state.profile.name,
              "field-2": state.profile.email,
              "field-3": state.profile.city,
            };
    state.onboarding = onboarding;
    save();
    refresh();
    return;
  }
  if (b.dataset.action === "back") {
    if (route === "onboarding" && onboarding.step > 1) {
      captureOnboarding();
      onboarding.step--;
      state.onboarding = onboarding;
      save();
      render();
    } else back();
  }
  if (b.dataset.action === "skip-onboarding") {
    advanceOnboarding();
  }
  if (b.dataset.action === "read-notifications") {
    state.notificationsRead = true;
    save();
    refresh();
    toast("All notifications marked as read.");
  }
  if (b.dataset.action === "reset-filters") {
    query = "";
    category = "All";
    filters = { sport: "All sports", distance: "Any distance", verified: true };
    refresh();
  }
});
document.addEventListener("input", (event) => {
  if (reviewApp.input(event.target)) return;
  if (event.target.closest("#onboarding-form")) captureOnboarding();
  if (event.target.id === "inbox-search") {
    let count = 0;
    document.querySelectorAll("[data-conversation]").forEach((el) => {
      el.hidden = !el.dataset.conversation.includes(
        event.target.value.trim().toLowerCase()
      );
      if (!el.hidden) count++;
    });
    document.getElementById("conversation-empty").hidden = count > 0;
  }
  if (event.target.id === "discover-search") {
    query = event.target.value;
    filterResults();
  }
  if (event.target.id === "network-search") {
    networkQuery = event.target.value;
    document.getElementById("network-results").innerHTML = networkRows(
      people.filter((p) =>
        `${p.name} ${p.role}`.toLowerCase().includes(networkQuery.toLowerCase())
      )
    );
  }
});
document.addEventListener("change", (event) => {
  const el = event.target;
  if (insightApp.change(el) || reviewApp.change(el)) return;
  if (el.dataset.compare !== undefined) {
    selectedComparison[Number(el.dataset.compare)] = el.value;
    refresh();
  }
  if (el.dataset.preference) {
    state.preferences[el.dataset.preference] = el.checked;
    save();
    toast("Preference saved.");
  }
  if (el.id === "verification-method")
    document.getElementById("verification-input").innerHTML = verificationInput(
      journeys[state.profile.role].methods[Number(el.value)]
    );
  if (el.matches("[data-onboarding-method]"))
    document.getElementById("onboarding-proof").innerHTML = verificationInput(
      journeys[onboarding.role].methods[Number(el.value)]
    ).replace(" required", "");
  if (el.id === "post-photo") selectPostPhoto(el);
});
document.addEventListener("submit", (event) => {
  if (
    event.target.matches(
      "[data-auth-form],[data-insight-form],[data-review-form]"
    )
  ) {
    event.preventDefault();
    auth.submit(event.target) ||
      insightApp.submit(event.target) ||
      reviewApp.submit(event.target);
    return;
  }
  const form = event.target.closest("[data-form]");
  if (!form) return;
  event.preventDefault();
  if (
    !signedIn() &&
    [
      "post",
      "comment",
      "message",
      "profile",
      "achievement",
      "connection",
      "verification",
    ].includes(form.dataset.form)
  ) {
    requireActionAccount();
    return;
  }
  const data = Object.fromEntries(new FormData(form));
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") data[key] = value.trim();
  }
  const kind = form.dataset.form;
  if (["comment", "message", "review"].includes(kind) && !data.text) {
    toast("Add some text to continue.");
    return;
  }
  if (kind === "connection") {
    (state.invitations ||= []).push(data);
    save();
    refresh();
    toast("Invitation prepared.");
  }
  if (kind === "achievement") {
    (state.achievements ||= []).unshift(data);
    save();
    refresh();
    toast("Achievement added to your profile.");
  }
  if (kind === "filters") {
    filters = { ...filters, ...data };
    go("discover");
  }
  if (kind === "post") {
    if (photoIsLoading(form)) return;
    const image = postPhoto(form);
    if (!data.text && !image) {
      toast("Add a moment or a photo to share.");
      return;
    }
    state.posts.unshift({
      id: `post-${Date.now()}`,
      person: "me",
      time: "Just now",
      text: data.text,
      image,
      likes: 0,
      comments: [],
    });
    if (!save()) {
      state.posts.shift();
      toast("This post could not be saved. Try a smaller photo or free up browser storage.");
      return;
    }
    feedFilter = "For you";
    go("community");
    toast("Post added to your feed.");
  }
  if (kind === "comment") {
    (state.comments[form.dataset.id] ||= []).push(data.text);
    save();
    refresh();
    toast("Comment added.");
  }
  if (kind === "message") {
    const list = (state.messages[form.dataset.id] ||= []);
    list.push({ text: data.text, mine: true });
    list.push({
      text: "Thanks for sharing! What are your goals for the coming season?",
      mine: false,
    });
    save();
    render();
  }
  if (kind === "profile") {
    if (!data.name) {
      toast("Please enter your name.");
      return;
    }
    state.profile = { ...state.profile, ...data };
    save();
    go("profile");
    toast("Profile updated.");
  }
  if (kind === "verification") {
    state.verification = "Pending review";
    save();
    refresh();
    toast("Verification request saved.");
  }
  if (kind === "onboarding") {
    advanceOnboarding();
  }
});
window.addEventListener("popstate", () => render());
window.addEventListener("hashchange", () => {
  if (decodeURIComponent(location.hash.slice(1)) !== route) render();
});
render();
