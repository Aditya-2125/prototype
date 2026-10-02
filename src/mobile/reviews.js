/** Review entities, categories and copy mirror the existing web prototype. */
export const reviewEntities = [
  {
    id: "northstar",
    type: "club",
    name: "Northstar Academy",
    kind: "Club program",
    tag: "Verified club",
    rating: "4.8",
    count: 142,
    confidence: "High confidence",
    image: "northstar-school.png",
    meta: "Soccer · Chicago, IL",
  },
  {
    id: "midwest-state",
    type: "school",
    name: "Midwest State University",
    kind: "University athletic program",
    tag: "Verified university",
    rating: "4.7",
    count: 96,
    confidence: "High confidence",
    image: "editorial-school.jpg",
    meta: "Basketball · Madison, WI",
  },
  {
    id: "maya",
    type: "professional",
    name: "Coach Maya Chen",
    kind: "Coach",
    tag: "Verified coach",
    rating: "4.9",
    count: 68,
    confidence: "High confidence",
    image: "social-avatar-2.png",
    meta: "Soccer development · Illinois",
  },
  {
    id: "showcase",
    type: "event",
    name: "Chicago Fall ID Showcase",
    kind: "Tournament",
    tag: "Verified tournament",
    rating: "4.6",
    count: 74,
    confidence: "Medium confidence",
    image: "social-track.png",
    meta: "Multi-sport event · Chicago, IL",
  },
  {
    id: "dav",
    type: "school",
    name: "D.A.V High School",
    kind: "High school athletic program",
    tag: "Verified high school",
    rating: "4.4",
    count: 52,
    confidence: "Medium confidence",
    image: "landing-basketball.jpg",
    meta: "Multi-sport · Chicago, IL",
  },
  {
    id: "apex",
    type: "professional",
    name: "Apex Sports Agency",
    kind: "Sports agency",
    tag: "Verified agency",
    rating: "4.5",
    count: 41,
    confidence: "Medium confidence",
    image: "member-avatar.png",
    meta: "Representation · National",
  },
];
const categories = [
  ["all", "All"],
  ["school", "Schools & universities"],
  ["club", "Clubs & travel teams"],
  ["professional", "Coaches, agents & trainers"],
  ["event", "Tournaments & leagues"],
];
const stories = {
  school: [
    [
      "Strong support on and off the field",
      "Academic expectations were clear, the staff communicated early, and the athlete support team followed through.",
    ],
    [
      "A competitive program with useful structure",
      "Training and college preparation felt organized. Families would benefit from earlier updates when travel plans change.",
    ],
  ],
  club: [
    [
      "Clear development plan and excellent feedback",
      "The staff explained where my athlete was progressing and where more work was needed. Communication stayed consistent.",
    ],
    [
      "Strong experience; communication can improve",
      "The experience was challenging in a positive way and the people cared about growth. A few schedule changes arrived late.",
    ],
  ],
  professional: [
    [
      "Advice was specific and actionable",
      "Sessions focused on real development priorities, with honest feedback and a clear plan for what to work on next.",
    ],
    [
      "Professional, responsive, and transparent",
      "Expectations, pricing, and next steps were explained up front. Follow-up was reliable throughout the season.",
    ],
  ],
  event: [
    [
      "Well organized and worth the trip",
      "Check-in, schedules, and field directions were easy to follow. The competition level matched what was advertised.",
    ],
    [
      "Good exposure with a few timing delays",
      "The event delivered useful competition and coach visibility. More real-time updates would make schedule changes easier.",
    ],
  ],
};
export function createReviews(api) {
  const {
    state,
    esc,
    icon,
    img,
    button,
    badge,
    heading,
    go,
    save,
    toast,
    refresh,
  } = api;
  let category = "all",
    query = "",
    filter = "Most relevant",
    rating = 5,
    writerTarget = "";
  const get = (id) => reviewEntities.find((e) => e.id === id);
  const relationships = (e) =>
    e?.type === "event"
      ? ["Athlete / participant", "Parent / guardian", "Coach / team staff"]
      : e?.type === "professional"
      ? ["Athlete / client", "Parent / guardian", "Organization partner"]
      : ["Parent / guardian", "Athlete", "Alumni"];
  function entityCard(e) {
    return `<article class="review-entity-card"><div>${img(
      e.image,
      e.name
    )}<span><small>${esc(e.tag)}</small><h3>${esc(e.name)}</h3><p>${esc(
      e.meta
    )}</p><strong>${icon("star")} ${e.rating} <em>· ${
      e.count
    } reviews</em></strong></span></div><footer>${button(
      "Read reviews",
      `reviews/${e.id}`,
      "secondary"
    )}${button(
      "Write review",
      `write-review/${e.id}`,
      "primary"
    )}</footer></article>`;
  }
  function directory() {
    return `<div class="page review-hub"><span class="eyebrow">VERIFIED COMMUNITY EVIDENCE</span><h2>Reviews for the whole<br />sports journey.</h2><p class="subcopy">Schools, universities, clubs, coaches, agents, tournaments, and leagues.</p><div class="review-hub-actions">${button(
      `${icon("pen-to-square", "regular")} Write a review`,
      "write-review",
      "primary"
    )}${button(
      "My reviews & drafts",
      "my-reviews",
      "text-button"
    )}</div><label class="search-field">${icon(
      "magnifying-glass"
    )}<input id="review-search" aria-label="Search reviewable entities" value="${esc(
      query
    )}" placeholder="Search a school, team, person, or event" /></label><nav class="chips review-type-chips" aria-label="Review entity types">${categories
      .map(
        ([id, label]) =>
          `<button type="button" class="chip ${
            id === category ? "active" : ""
          }" data-review-category="${id}" aria-pressed="${
            id === category
          }">${label}</button>`
      )
      .join("")}</nav><div id="review-results">${results()}</div></div>`;
  }
  function results() {
    const found = reviewEntities.filter(
      (e) =>
        (category === "all" || e.type === category) &&
        `${e.name} ${e.kind} ${e.meta}`
          .toLowerCase()
          .includes(query.toLowerCase())
    );
    return `<p class="review-result-count">${found.length} reviewable ${
      found.length === 1 ? "entity" : "entities"
    }</p>${
      found.length
        ? found.map(entityCard).join("")
        : '<div class="empty"><h3>No matching entity found.</h3><p>Try a broader search or another category.</p><button class="secondary" data-review-action="clear">Clear search & filters</button></div>'
    }`;
  }
  function storyCard(e, index) {
    const [title, copy] = stories[e.type][index],
      role = index === 0 ? "Parent" : "Athlete",
      n = index === 0 ? 5 : 4,
      id = `${e.id}-${index}`;
    return `<article class="card review-story"><header><span class="reviewer-avatar">${icon(
      "user",
      "regular"
    )}</span><span><strong>${role}</strong><small>Verified relationship · ${
      index === 0 ? "Sep 18" : "Aug 29"
    }</small></span><b>${n}.0 ${icon(
      "star"
    )}</b></header><h3>${title}</h3><p>${copy}</p><footer>${badge(
      "Verified relationship"
    )}<button data-review-helpful="${id}" aria-pressed="${(
      state.helpfulReviews || []
    ).includes(id)}">${icon("thumbs-up", "regular")} ${
      index === 0
        ? 18 + Number((state.helpfulReviews || []).includes(id))
        : Number((state.helpfulReviews || []).includes(id))
    } helpful</button></footer></article>`;
  }
  function detail(id) {
    const e = get(id);
    if (!e) return directory();
    const list =
      filter === "Parents"
        ? [0]
        : filter === "Athletes" || filter === "Critical"
        ? [1]
        : [0, 1];
    return `<div class="page review-detail-mobile"><span class="eyebrow">${esc(
      e.kind
    )}</span><h2>${esc(e.name)}</h2><p class="subcopy">${esc(
      e.meta
    )}</p><div class="review-score-card"><div><strong>${
      e.rating
    }</strong><span>${icon("star").repeat(5)}</span><small>${
      e.count
    } verified reviews</small></div><span>${badge(e.confidence)}${[
      [5, 68],
      [4, 21],
      [3, 8],
      [2, 2],
      [1, 1],
    ]
      .map(
        ([n, p]) =>
          `<div class="review-distribution"><small>${n} ${icon(
            "star"
          )}</small><span><i style="width:${p}%"></i></span><b>${p}%</b></div>`
      )
      .join(
        ""
      )}</span></div><p class="review-method-note">Reviews are moderated for authenticity and safety. Ratings are never changed by the reviewed entity.</p>${button(
      "Review this " +
        (e.type === "professional"
          ? "professional"
          : e.type === "event"
          ? "event"
          : "organization"),
      `write-review/${e.id}`,
      "primary full"
    )}${heading("What people are saying")}<div class="chips">${[
      "Most relevant",
      "Parents",
      "Athletes",
      "Critical",
    ]
      .map(
        (t) =>
          `<button class="chip ${
            filter === t ? "active" : ""
          }" data-review-filter="${t}" aria-pressed="${
            filter === t
          }">${t}</button>`
      )
      .join("")}</div>${list
      .map((i) => storyCard(e, i))
      .join("")}${state.reviews
      .filter((r) => r.program === e.id)
      .map(
        (r) =>
          `<div class="card"><h3>${esc(r.title)}</h3><p>${esc(
            r.text
          )}</p>${badge(
            "Your submission · pending verification",
            "clock"
          )}</div>`
      )
      .join("")}</div>`;
  }
  function draft() {
    return state.reviewDrafts?.[writerTarget || "new"] || {};
  }
  function write(id) {
    writerTarget = get(id) ? id : "";
    const e = get(writerTarget),
      d = draft();
    rating = d.rating || rating;
    return `<div class="page review-write"><h2>Write a verified review.</h2><p class="subcopy">Your identity stays private; your relationship label may be shown.</p><form class="form" data-review-form="write"><label>What are you reviewing?<select name="entity" data-review-entity required><option value="">Choose a school, team, person, or event</option>${categories
      .slice(1)
      .map(
        ([type, label]) =>
          `<optgroup label="${label}">${reviewEntities
            .filter((e) => e.type === type)
            .map(
              (e) =>
                `<option value="${e.id}" ${
                  e.id === writerTarget ? "selected" : ""
                }>${e.name}</option>`
            )
            .join("")}</optgroup>`
      )
      .join(
        ""
      )}</select></label><p class="note"><strong>Eligibility check:</strong> We verify your relationship with ${esc(
      e?.name || "the selected entity"
    )} before publication.</p><div><label>Overall experience</label><div class="rating-picker" role="group" aria-label="Rating">${[
      1, 2, 3, 4, 5,
    ]
      .map(
        (n) =>
          `<button type="button" data-review-rating="${n}" class="${
            n <= rating ? "selected" : ""
          }" aria-label="${n} ${n === 1 ? "star" : "stars"}" aria-pressed="${
            rating === n
          }">${icon("star")}</button>`
      )
      .join(
        ""
      )}</div></div><label>Relationship<select name="relationship">${relationships(
      e
    )
      .map(
        (label) =>
          `<option ${
            d.relationship === label ? "selected" : ""
          }>${label}</option>`
      )
      .join("")}</select></label><label>Season<select name="season">${[
      "2025–26",
      "2024–25",
    ]
      .map((t) => `<option ${d.season === t ? "selected" : ""}>${t}</option>`)
      .join(
        ""
      )}</select></label><label>Review title<input name="title" value="${esc(
      d.title || ""
    )}" placeholder="Summarize your experience" required maxlength="100" /></label><label>What should another family know?<textarea name="text" minlength="20" maxlength="2000" placeholder="Share specific details about coaching, communication, culture, cost, or development." required>${esc(
      d.text || ""
    )}</textarea></label><div class="review-write-actions"><button class="secondary" type="button" data-review-action="save-draft">Save draft</button><button class="primary" type="submit">Continue to verification ${icon(
      "arrow-right"
    )}</button></div><p class="review-method-note">Your review stays private until your relationship has been verified.</p></form></div>`;
  }
  function capture() {
    const form = document.querySelector('[data-review-form="write"]');
    if (!form) return;
    const d = Object.fromEntries(new FormData(form));
    state.reviewDrafts ||= {};
    state.reviewDrafts[writerTarget || "new"] = { ...d, rating };
    save();
  }
  function verify() {
    const d = state.pendingReview,
      e = get(d?.program);
    if (!d || !e) return write();
    return `<div class="page"><span class="eyebrow">BEFORE PUBLICATION</span><h2>Verify your relationship.</h2><p class="subcopy">Your review of ${
      e.name
    } has been saved. Choose how you would support your ${esc(
      d.relationship.toLowerCase()
    )} relationship.</p><div class="card"><h3>${esc(d.title)}</h3><p>${esc(
      d.text
    )}</p>${badge(
      "Draft saved · not published",
      "clock"
    )}</div><form class="form" data-review-form="verify"><label>Evidence method<select name="method"><option>Organization email</option><option>Official roster or public listing</option><option>Private participation document</option></select></label><p class="note">Your evidence is used to confirm your relationship. It will not appear publicly with your review.</p><button class="primary">Save verification request</button></form>${button(
      "Finish verification later",
      "my-reviews",
      "text-button full"
    )}</div>`;
  }
  function mine() {
    const drafts = Object.entries(state.reviewDrafts || {});
    return `<div class="page"><h2>Your voice, your reviews.</h2><p class="subcopy">Keep track of drafts and verification status.</p>${state.reviews
      .map(
        (r) =>
          `<div class="card"><span class="eyebrow">${esc(
            get(r.program)?.name || r.program
          )}</span><h3 style="margin-top:10px">${esc(r.title)}</h3><p>${esc(
            r.text
          )}</p>${badge("Pending verification", "clock")}</div>`
      )
      .join("")}${drafts.length ? heading("Saved drafts") : ""}${drafts
      .map(
        ([id, d]) =>
          `<div class="card"><h3>${esc(
            d.title || "Untitled review"
          )}</h3><p>${esc(get(id)?.name || "Choose an entity")}</p>${button(
            "Continue draft",
            id === "new" ? "write-review" : `write-review/${id}`,
            "text-button"
          )}</div>`
      )
      .join("")}${
      !state.reviews.length && !drafts.length
        ? '<div class="empty"><h3>Your perspective matters.</h3><p>Write about an experience that could help another family.</p></div>'
        : ""
    }${button("Write a review", "write-review", "primary full")}</div>`;
  }
  function click(b) {
    if (b.dataset.reviewCategory) {
      category = b.dataset.reviewCategory;
      document.querySelectorAll("[data-review-category]").forEach((el) => {
        el.classList.toggle("active", el.dataset.reviewCategory === category);
        el.setAttribute(
          "aria-pressed",
          String(el.dataset.reviewCategory === category)
        );
      });
      document.getElementById("review-results").innerHTML = results();
      return true;
    }
    if (b.dataset.reviewRating) {
      rating = Number(b.dataset.reviewRating);
      document.querySelectorAll("[data-review-rating]").forEach((el) => {
        el.classList.toggle(
          "selected",
          Number(el.dataset.reviewRating) <= rating
        );
        el.setAttribute(
          "aria-pressed",
          String(Number(el.dataset.reviewRating) === rating)
        );
      });
      return true;
    }
    if (b.dataset.reviewFilter) {
      filter = b.dataset.reviewFilter;
      refresh();
      return true;
    }
    if (b.dataset.reviewHelpful) {
      state.helpfulReviews ||= [];
      const id = b.dataset.reviewHelpful;
      state.helpfulReviews = state.helpfulReviews.includes(id)
        ? state.helpfulReviews.filter((x) => x !== id)
        : [...state.helpfulReviews, id];
      save();
      refresh();
      return true;
    }
    if (b.dataset.reviewAction === "clear") {
      query = "";
      category = "all";
      refresh();
      return true;
    }
    if (b.dataset.reviewAction === "save-draft") {
      capture();
      go("my-reviews");
      toast("Review draft saved.");
      return true;
    }
    return false;
  }
  function change(el) {
    if (el.matches("[data-review-entity]")) {
      const previous = writerTarget || "new",
        target = el.value;
      capture();
      const current = state.reviewDrafts[previous];
      writerTarget = target;
      state.reviewDrafts[target || "new"] = { ...current, entity: target };
      if (previous === "new" && target) delete state.reviewDrafts.new;
      save();
      go(target ? `write-review/${target}` : "write-review");
      return true;
    }
    return false;
  }
  function input(el) {
    if (el.id === "review-search") {
      query = el.value;
      document.getElementById("review-results").innerHTML = results();
      return true;
    }
    return false;
  }
  function submit(form) {
    const kind = form.dataset.reviewForm;
    if (!kind) return false;
    if (kind === "write") {
      capture();
      const d = draft();
      if (!get(d.entity) || !d.title?.trim() || d.text?.trim().length < 20)
        return true;
      state.pendingReview = {
        ...d,
        program: d.entity,
        title: d.title.trim(),
        text: d.text.trim(),
      };
      save();
      go("review-verification");
    }
    if (kind === "verify") {
      const pending = state.pendingReview;
      if (pending) {
        state.reviews.unshift({
          ...pending,
          status: "pending",
          method: form.elements.method.value,
        });
        delete state.reviewDrafts[pending.program];
        state.pendingReview = null;
        save();
      }
      go("my-reviews");
      toast("Review saved. Verification is pending.");
    }
    return true;
  }
  return {
    screens: {
      reviews: (id) => (id ? detail(id) : directory()),
      "write-review": write,
      "review-verification": verify,
      "my-reviews": mine,
    },
    click,
    change,
    input,
    submit,
    capture,
  };
}
