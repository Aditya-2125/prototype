const colleges = [
  {
    id: "northstar-college",
    name: "Northstar College",
    location: "Chicago, IL",
    division: "D2",
    fit: 91,
    image: "northstar-school.png",
    athletic: 94,
    academic: 88,
    environment: 90,
    cost: "$24,000",
    size: "6,200",
    headline: "Your strongest overall college match.",
    reason:
      "Athletic, academic, roster, and preference signals combine into this match. Your technical strengths align with the program’s needs.",
    watch: "Add verified performance metrics to improve projection confidence.",
  },
  {
    id: "lakeside-university",
    name: "Lakeside University",
    location: "Evanston, IL",
    division: "D3",
    fit: 86,
    image: "editorial-school.jpg",
    athletic: 88,
    academic: 91,
    environment: 79,
    cost: "$19,500",
    size: "3,800",
    headline: "Strong academic fit, close to home.",
    reason:
      "Your academic profile is a strong signal. Review the available roster opportunity alongside your sporting goals.",
    watch:
      "Compare intended study area, academic support, and the full cost of attendance.",
  },
  {
    id: "metro-state",
    name: "Metro State",
    location: "Milwaukee, WI",
    division: "D2",
    fit: 82,
    image: "soccer-stadium.jpg",
    athletic: 86,
    academic: 78,
    environment: 84,
    cost: "$28,000",
    size: "18,500",
    headline: "An opportunity worth exploring.",
    reason:
      "Athletic development and roster opportunity support this fit. Academic preferences need a closer look.",
    watch:
      "Confirm roster needs in your entry year and add your intended area of study.",
  },
];
const metrics = [
  {
    name: "Pass completion",
    value: 84,
    unit: "%",
    benchmark: 80,
    trend: "+4 pts",
    description: "Consistent distribution is a strength in this profile.",
    pct: 84,
    source: "Season statistics",
  },
  {
    name: "20 m sprint",
    value: 3.12,
    unit: "s",
    benchmark: 3.1,
    trend: "Focus area",
    description:
      "Lower is better. Work on acceleration and retest with the same method.",
    pct: 69,
    source: "Timed assessment",
  },
  {
    name: "Endurance",
    value: 11.4,
    unit: "level",
    benchmark: 11,
    trend: "Above benchmark",
    description: "A solid foundation for repeat efforts across a match.",
    pct: 82,
    source: "Shuttle assessment",
  },
  {
    name: "Academic GPA",
    value: 3.7,
    unit: "/ 4",
    benchmark: 3.5,
    trend: "+0.2",
    description:
      "Academic consistency supports a wider range of opportunities.",
    pct: 92,
    source: "Academic record",
  },
];
export function createInsight(api) {
  const {
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
  } = api;
  let division = "All",
    processing = false;
  const currentAthlete = () =>
    state.profile.role === "parent" ? state.activeAthlete || "jamie" : "self";
  const athlete = () =>
    state.profile.role === "parent"
      ? state.activeAthlete === "alex"
        ? {
            name: "Alex Smith",
            sport: "Soccer · Forward",
            year: "Class of 2028",
            id: "alex",
          }
        : {
            name: "Jordan Smith",
            sport: "Soccer · Midfielder",
            year: "Class of 2027",
            id: "jamie",
          }
      : {
          name: state.profile.name,
          sport: `${state.profile.sport} · ${state.profile.position}`,
          year: "Class of 2027",
          id: "self",
        };
  const getCollege = (id) =>
    colleges.find(
      (c) =>
        c.id ===
        ({
          lakeview: "northstar-college",
          "great-lakes": "lakeside-university",
          riverbend: "metro-state",
        }[id] || id)
    ) || colleges[0];
  const note = () =>
    '<p class="insight-disclaimer">Fit helps you explore your options. It is not an admission or recruitment prediction.</p>';
  const nav = (active) =>
    `<nav class="insight-segments" aria-label="Insight sections">${[
      ["insight", "Overview"],
      ["insight-matches", "Matches"],
      ["insight-metrics", "Metrics"],
    ]
      .map(
        ([r, t]) =>
          `<button data-go="${r}" ${
            active === r ? 'aria-current="page"' : ""
          }>${t}</button>`
      )
      .join("")}</nav>`;
  const athleteStrip = () =>
    `<div class="insight-athlete">${avatar(
      "member-avatar.png"
    )}<span><strong>${esc(athlete().name)}</strong><small>${esc(
      athlete().sport
    )} · ${athlete().year}</small></span>${button(
      icon("sliders"),
      "insight-run",
      "icon-button"
    )}</div>`;
  const parentPicker = () =>
    state.profile.role === "parent"
      ? `<label class="field athlete-picker">Viewing athlete<select data-insight-athlete><option value="jamie" ${
          state.activeAthlete !== "alex" ? "selected" : ""
        }>Jordan Smith · Linked athlete</option><option value="alex" ${
          state.activeAthlete === "alex" ? "selected" : ""
        }>Alex Smith · Linked athlete</option></select></label>`
      : "";
  const collegeCard = (c, compact = false) =>
    `<article class="college-card ${
      compact ? "compact" : ""
    }"><button class="college-open" data-go="college/${c.id}">${img(
      c.image,
      c.name
    )}<span class="college-card-copy"><small>${c.division} · ${
      c.location
    }</small><strong>${c.name}</strong><em>${
      c.headline
    }</em></span><span class="college-fit"><b>${
      c.fit
    }%</b><small>match</small></span></button><footer><span>${icon(
      "circle-check"
    )} Explained with 3 fit signals</span><button data-college-save="${
      c.id
    }" aria-pressed="${(state.savedColleges || []).includes(
      c.id
    )}" aria-label="${
      (state.savedColleges || []).includes(c.id) ? "Unsave" : "Save"
    } ${c.name}">${icon(
      "bookmark",
      (state.savedColleges || []).includes(c.id) ? "solid" : "regular"
    )}</button></footer></article>`;
  function overview() {
    const latest = (state.insightHistory || []).find(
      (r) => r.athlete === currentAthlete()
    );
    const roleNote = !["athlete", "parent"].includes(state.profile.role)
      ? `<div class="note" style="margin-bottom:16px">You’re exploring an athlete’s report. Personal athlete analysis and family access are available for athlete and parent profiles.</div>`
      : "";
    return `<div class="page insight-page">${parentPicker()}${roleNote}${athleteStrip()}${nav(
      "insight"
    )}<section class="insight-summary"><div class="insight-summary-top"><span>${icon(
      "wand-magic-sparkles"
    )} COLLEGE FIT READINESS</span><span>Latest report</span></div><h2>See the fit.<br />Know the next move.</h2><p>Your profile is competitive for regional D2 and D3 programs. Verified speed data would improve projection confidence.</p><div class="readiness-preview"><b>87<span>/100</span></b><span>College fit readiness<small>High confidence · analysis</small></span></div><div class="division-summary"><span><small>A PATH TO EXPLORE</small><strong>Regional D2 & D3</strong></span><span class="division-pill">Strong alignment ${icon(
      "arrow-trend-up"
    )}</span></div></section><div class="insight-mini-stats"><div><b>3</b><small>College matches</small></div><div><b>4</b><small>Profile signals</small></div><div><b>${
      latest ? "Just now" : "Updated"
    }</b><small>Last analysis</small></div></div>${heading(
      "Your strongest match",
      "See all",
      "insight-matches"
    )}${collegeCard(colleges[0], true)}${heading(
      "Your next best steps"
    )}<div class="next-steps">${row(
      "gauge-high",
      "Add verified performance metrics",
      "Speed and endurance benchmarks improve match accuracy.",
      "insight-metrics"
    )}${row(
      "video",
      "Expand the academic range",
      "Add GPA and intended study area to improve recommendations.",
      "edit-profile"
    )}${row(
      "graduation-cap",
      "Review roster opportunity",
      "Understand midfield depth in your entry year.",
      "college/northstar-college"
    )}</div><div class="insight-credit-bar"><span>${icon("bolt")} <strong>${
      state.credits
    } credits</strong><small>Viewing reports is always free</small></span>${button(
      "New analysis",
      "insight-run",
      "primary"
    )}</div><div class="insight-footer-links">${button(
      `${icon("clock-rotate-left")} Analysis history`,
      "insight-history"
    )}${button("Plans & credits", "billing")}</div>${note()}</div>`;
  }
  function matches() {
    const found = colleges.filter(
      (c) => division === "All" || c.division === division
    );
    return `<div class="page insight-page">${parentPicker()}${athleteStrip()}${nav(
      "insight-matches"
    )}<h2>Your future, in focus.</h2><p class="subcopy">A starting point for conversations and research.</p><div class="chips">${[
      "All",
      "D2",
      "D3",
    ]
      .map(
        (d) =>
          `<button class="chip ${
            division === d ? "active" : ""
          }" data-division="${d}" aria-pressed="${division === d}">${
            d === "All" ? "All divisions" : d
          }</button>`
      )
      .join("")}</div>${found
      .map((c) => collegeCard(c))
      .join("")}${note()}</div>`;
  }
  function metricScreen() {
    return `<div class="page insight-page">${parentPicker()}${athleteStrip()}${nav(
      "insight-metrics"
    )}<h2>The story in your stats.</h2><p class="subcopy">Your profile against division benchmarks.</p>${metrics
      .map(
        (m) =>
          `<article class="metric-card"><header><h3>${
            m.name
          }</h3><span class="${
            m.name === "20 m sprint" ? "focus-tag" : "strength-tag"
          }">${m.trend}</span></header><div class="metric-values"><span><b>${
            m.value
          }</b> ${m.unit}<small>Your metric</small></span><span><b>${
            m.benchmark
          }</b> ${
            m.unit
          }<small>D2 benchmark</small></span></div><div class="metric-bar"><span style="width:${
            m.pct
          }%"></span></div><p>${
            m.description
          }</p><small class="metric-source">${m.source}</small></article>`
      )
      .join("")}${button(
      "Update my profile",
      "edit-profile",
      "secondary full"
    )}${note()}</div>`;
  }
  function detail(id) {
    const c = getCollege(id);
    return `${img(
      c.image,
      c.name,
      "detail-image"
    )}<div class="page detail-page college-detail"><span class="eyebrow">${
      c.division
    } · ${c.location}</span><h2>${c.name}</h2><p class="subcopy">${
      c.headline
    }</p><div class="college-score-panel"><strong>${
      c.fit
    }<small>%</small></strong><span><b>Overall profile match</b><small>Based on three fit signals</small></span></div>${heading(
      "Why this could fit"
    )}<p class="subcopy">${c.reason}</p><div class="card">${[
      ["Athletic fit", c.athletic],
      ["Academic fit", c.academic],
      ["Roster opportunity", c.environment],
    ]
      .map(
        ([label, n]) =>
          `<div class="evidence-row"><span>${label}</span><div><em style="width:${n}%"></em></div><b>${n}%</b></div>`
      )
      .join("")}</div><div class="card"><h3>A question worth asking</h3><p>${
      c.watch
    }</p></div><div class="college-facts"><div><small>Annual cost</small><b>${
      c.cost
    }</b></div><div><small>Student community</small><b>${
      c.size
    }</b></div></div><button class="primary full" data-college-save="${
      c.id
    }" aria-pressed="${(state.savedColleges || []).includes(c.id)}">${icon(
      "bookmark"
    )} ${
      (state.savedColleges || []).includes(c.id)
        ? "Saved to college shortlist"
        : "Save this college"
    }</button>${button(
      "Review my metrics",
      "insight-metrics",
      "text-button full"
    )}${note()}</div>`;
  }
  function run() {
    return `<div class="page insight-page"><div class="insight-run-symbol">${icon(
      "wand-magic-sparkles"
    )}</div><h2>A fresh perspective.</h2><p class="subcopy">Tell us what matters now. We’ll create an updated report for ${esc(
      athlete().name.split(" ")[0]
    )}.</p><form class="form" data-insight-form="run"><label>Your next goal<select name="goal"><option>College fit & recruiting</option><option>Development priorities</option><option>Roster comparison</option></select></label><label>Put more weight on<select name="priority"><option>A balanced fit</option><option>Academic fit</option><option>Athletic development</option></select></label><div class="analysis-cost"><span><b>1 credit</b><small>${
      state.credits
    } available · ${Math.max(
      0,
      state.credits - 1
    )} after this analysis</small></span>${icon(
      "bolt"
    )}</div><button class="primary full" ${
      state.credits < 1 || processing ? "disabled" : ""
    }>${
      processing
        ? `${icon("spinner")} Preparing your report…`
        : `${icon("wand-magic-sparkles")} Create my analysis`
    }</button><p class="note">Your existing report stays available, and opening it never consumes a credit.</p></form>${
      state.credits < 1
        ? button("Explore plans", "billing", "text-button full")
        : ""
    }${button(
      "View analysis history",
      "insight-history",
      "text-button full"
    )}</div>`;
  }
  function history() {
    const all = (state.insightHistory || []).filter(
      (r) => r.athlete === currentAthlete()
    );
    return `<div class="page insight-page"><h2>See how your path evolves.</h2><p class="subcopy">Previous reports for ${esc(
      athlete().name
    )}. Reopening a report is free.</p>${
      all.length
        ? all
            .map(
              (r) =>
                `<button class="history-card" data-go="insight-report/${
                  r.id
                }"><span class="history-symbol">${icon(
                  "chart-line"
                )}</span><span><strong>${esc(r.goal)}</strong><small>${esc(
                  r.date
                )} · ${esc(r.priority)}</small><em>${
                  r.matches
                } matches · 1 credit</em></span>${icon(
                  "chevron-right"
                )}</button>`
            )
            .join("")
        : `<div class="empty">${icon(
            "clock-rotate-left"
          )}<h3>Your story starts here.</h3><p>Create a new analysis and it will appear in your history.</p>${button(
            "Create an analysis",
            "insight-run",
            "primary"
          )}</div>`
    }${note()}</div>`;
  }
  function report(id) {
    const report = (state.insightHistory || []).find((r) => r.id === id);
    if (!report) return history();
    return `<div class="page insight-page"><span class="eyebrow">SAVED REPORT</span><h2>${esc(
      report.goal
    )}</h2><p class="subcopy">${esc(report.date)} · ${esc(
      report.priority
    )}<br />Athlete: ${esc(
      report.name
    )}</p><div class="card"><h3>Your next step</h3><p>${
      report.priority === "Academic fit"
        ? "Explore Lakeside University’s academic environment and compare it with your sporting goals."
        : "Build on your technical strengths and compare the programs that align with your development goals."
    }</p></div>${colleges.map((c) => collegeCard(c)).join("")}${note()}</div>`;
  }
  function submit(form) {
    if (form.dataset.insightForm !== "run") return false;
    if (processing) return true;
    if (state.credits < 1) {
      toast("No credits remaining. Your saved reports are still free to view.");
      return true;
    }
    const data = Object.fromEntries(new FormData(form)),
      reportAthlete = athlete(),
      reportAthleteKey = currentAthlete();
    processing = true;
    refresh();
    setTimeout(() => {
      state.credits = Math.max(0, state.credits - 1);
      state.insightHistory ||= [];
      state.insightHistory.unshift({
        id: `analysis-${Date.now()}`,
        athlete: reportAthleteKey,
        name: reportAthlete.name,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        goal: data.goal,
        priority: data.priority,
        matches: 3,
      });
      processing = false;
      save();
      if (location.hash === "#insight-run") go("insight");
      toast("Your report is ready. Saved to analysis history.");
    }, 850);
    return true;
  }
  function click(b) {
    if (b.dataset.division) {
      division = b.dataset.division;
      refresh();
      return true;
    }
    if (b.dataset.collegeSave) {
      state.savedColleges ||= [];
      const id = b.dataset.collegeSave;
      state.savedColleges = state.savedColleges.includes(id)
        ? state.savedColleges.filter((x) => x !== id)
        : [...state.savedColleges, id];
      save();
      refresh();
      toast(
        state.savedColleges.includes(id)
          ? "Saved to your college shortlist."
          : "Removed from your college shortlist."
      );
      return true;
    }
    return false;
  }
  function change(el) {
    if (el.matches("[data-insight-athlete]")) {
      state.activeAthlete = el.value;
      save();
      refresh();
      return true;
    }
    return false;
  }
  return {
    screens: {
      insight: overview,
      "insight-matches": matches,
      "insight-metrics": metricScreen,
      college: detail,
      "insight-run": run,
      "insight-history": history,
      "insight-report": report,
    },
    click,
    submit,
    change,
    collegeCard,
    colleges,
  };
}
