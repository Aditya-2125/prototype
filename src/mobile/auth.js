/** Simulated account flows. Passwords never leave the form or enter storage. */
export function createAuth(api) {
  const { state, esc, icon, img, button, go, save, toast, startOnboarding } =
    api;
  const draft = () => state.authDraft || { name: "", email: "" };
  const intro = (kicker, title, copy) =>
    `<span class="eyebrow">${kicker}</span><h2>${title}</h2><p class="subcopy">${copy}</p>`;
  const error = (name) =>
    `<small id="error-${name}" class="field-error" data-error="${name}" aria-live="polite"></small>`;
  const field = (
    label,
    name,
    type,
    placeholder,
    value = "",
    autocomplete = ""
  ) =>
    `<label class="auth-field" for="auth-${name}">${label}</label><div class="auth-input-wrap"><input id="auth-${name}" name="${name}" type="${type}" placeholder="${placeholder}" value="${esc(
      value
    )}" autocomplete="${autocomplete}" aria-describedby="error-${name}" ${
      type === "password" ? "data-password" : ""
    } />${
      type === "password"
        ? `<button type="button" data-auth-action="show-password" data-field="auth-${name}" aria-label="Show ${label.toLowerCase()}" aria-pressed="false">${icon(
            "eye",
            "regular"
          )}</button>`
        : ""
    }</div>${error(name)}`;
  const social = (mode) =>
    `<div class="auth-divider"><span>or continue with</span></div><div class="social-signin"><button class="secondary" data-auth-provider="google" data-mode="${mode}">${icon(
      "google",
      "brands"
    )} Google</button><button class="secondary" data-auth-provider="apple" data-mode="${mode}">${icon(
      "apple",
      "brands"
    )} Apple</button></div>`;
  const form = (kind, content, label) =>
    `<form class="auth-form" data-auth-form="${kind}" novalidate>${content}<button class="primary full auth-submit" type="submit">${label} ${icon(
      "arrow-right"
    )}</button></form>`;

  function welcome() {
    return `<div class="auth-welcome"><div class="welcome-brand">${img(
      "chinstrap-notch-logo-v2.png",
      "Chinstrap"
    )}</div><div class="welcome-visual">${img(
      "hero-cinematic-v2.png",
      "Athletes supporting each other before a game"
    )}<span class="welcome-image-label">EVERY JOURNEY STARTS WITH A TEAM.</span></div><div class="welcome-content"><span class="eyebrow">YOUR GAME. YOUR FUTURE.</span><h2>Big possibilities.<br />A clearer next move.</h2><p>Find your community. Understand your potential.<br />Take your next step with Insight AI.</p><div class="welcome-benefits"><span>${icon(
      "user-group"
    )} Your people</span><span>${icon(
      "wand-magic-sparkles"
    )} Your potential</span><span>${icon(
      "compass"
    )} Your path</span></div>${button(
      "Create an account",
      "signup",
      "primary full"
    )}${button(
      "I already have an account",
      "login",
      "secondary full"
    )}<button class="text-button full" data-auth-action="guest">Continue as guest ${icon(
      "arrow-right"
    )}</button><p class="auth-fineprint">A sports community built on real experiences.</p></div></div>`;
  }
  const accountShell = (content) =>
    `<div class="web-account-shell"><div class="web-account-brand">${img(
      "chinstrap-notch-logo-v2.png",
      "Chinstrap"
    )}</div><section class="web-account-card">${content}</section><p class="account-legal"><a href="#legal/privacy">Privacy</a><span>·</span><a href="#legal/terms">Terms</a></p></div>`;
  function login() {
    return accountShell(
      `<span class="web-auth-icon">${icon("lock")}</span>${intro(
        "WELCOME BACK",
        "Your sports world<br />is waiting.",
        "Sign in to your community, saved programs, messages, and personalized insights."
      )}${form(
        "login",
        `${field(
          "Email address",
          "email",
          "email",
          "you@example.com",
          "demo@chinstrap.com",
          "username"
        )}<div class="password-label"><label class="auth-field" for="auth-password">Password</label>${button(
          "Forgot password?",
          "forgot-password",
          "text-button"
        )}</div><div class="auth-input-wrap"><input id="auth-password" name="password" type="password" value="chinstrap" placeholder="Enter your password" autocomplete="current-password" aria-describedby="error-password" data-password /><button type="button" data-auth-action="show-password" data-field="auth-password" aria-label="Show password" aria-pressed="false">${icon(
          "eye",
          "regular"
        )}</button></div>${error(
          "password"
        )}<label class="remember-account"><input type="checkbox" name="remember" checked /> Keep me signed in on this device</label>`,
        "Sign in securely"
      )}${social(
        "login"
      )}<p class="auth-switch-copy">New to Chinstrap? ${button(
        "Create a free account",
        "signup"
      )}</p>`
    );
  }
  function verifyEmail(reset = false) {
    const email = reset ? state.resetEmail : draft().email;
    return `<div class="page auth-page"><div class="auth-symbol">${icon(
      "envelope-open-text"
    )}</div>${intro(
      reset ? "PASSWORD RECOVERY" : "ONE QUICK CHECK",
      "Verify your email.",
      `Enter the six-digit code for<br /><strong>${esc(
        email || "you@example.com"
      )}</strong>.`
    )}${form(
      reset ? "reset-code" : "verify",
      `<label class="auth-field" for="auth-code">Verification code</label><input id="auth-code" class="code-input" name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" placeholder="000000" aria-describedby="error-code" />${error(
        "code"
      )}`,
      "Verify & continue"
    )}<button class="text-button full" data-auth-action="resend">Send a new code</button>${button(
      "Change email address",
      reset ? "forgot-password" : "signup",
      "text-button full"
    )}<p class="auth-fineprint">Email confirmation is separate from sports-profile verification.</p></div>`;
  }
  function forgot() {
    return `<div class="page auth-page"><div class="auth-symbol">${icon(
      "key"
    )}</div>${intro(
      "LET’S GET YOU BACK IN",
      "Forgot your password?",
      "Enter the email you use for Chinstrap. We’ll walk you through the next step."
    )}${form(
      "forgot",
      field(
        "Email address",
        "email",
        "email",
        "you@example.com",
        state.resetEmail || draft().email,
        "email"
      ),
      "Continue"
    )}${button(
      "Back to sign in",
      "login",
      "text-button full"
    )}</div>`;
  }
  function resetPassword() {
    return `<div class="page auth-page"><div class="auth-symbol">${icon(
      "lock"
    )}</div>${intro(
      "A FRESH START",
      "Create a new password.",
      "Choose a password with at least 8 characters."
    )}${form(
      "reset",
      `${field(
        "New password",
        "password",
        "password",
        "At least 8 characters",
        "",
        "new-password"
      )}${field(
        "Confirm password",
        "confirm",
        "password",
        "Re-enter your password",
        "",
        "new-password"
      )}`,
      "Reset password"
    )}</div>`;
  }
  function resetDone() {
    return `<div class="page auth-page auth-success"><div class="auth-symbol">${icon(
      "check"
    )}</div>${intro(
      "YOU’RE READY",
      "Back in the game.",
      "You’re ready to sign in and pick up where you left off."
    )}${button("Return to sign in", "login", "primary full")}</div>`;
  }
  function provider(id = "google-signup") {
    const [provider, mode] = id.split("-");
    return `<div class="page auth-page"><div class="auth-symbol">${icon(
      provider === "apple" ? "apple" : "google",
      "brands"
    )}</div>${intro(
      "CONTINUE TO CHINSTRAP",
      `Continue with ${provider === "apple" ? "Apple" : "Google"}.`,
      "Choose an account to continue."
    )}<div class="card"><h3>Jamie Smith</h3><p>jamie.smith@example.com</p></div><button class="primary full" data-auth-provider="${provider}" data-mode="${mode}">Continue as Jamie</button>${button(
      "Use email instead",
      mode === "login" ? "login" : "signup",
      "text-button full"
    )}</div>`;
  }
  function ready() {
    return `<div class="page auth-page auth-success"><div class="auth-symbol">${icon(
      "check"
    )}</div>${intro(
      "WELCOME TO YOUR NEXT CHAPTER",
      `You’re in, ${esc(state.profile.name.split(" ")[0])}.`,
      "Your profile is ready to grow with you. Verification and invitations can be finished whenever you’re ready."
    )}<div class="ready-checklist"><span>${icon(
      "circle-check"
    )} Your profile is set up</span><span>${icon(
      "circle-check"
    )} Your preferences are saved</span><span>${icon(
      "circle-check"
    )} Your community is waiting</span></div>${button(
      "Explore my home",
      "home",
      "primary full"
    )}${button("Meet Insight AI", "insight", "secondary full")}</div>`;
  }
  function legal(id) {
    const privacy = id === "privacy";
    return `<div class="page auth-page">${intro(
      "CHINSTRAP",
      privacy ? "Privacy policy" : "Terms of use",
      privacy
        ? "Your information. Your choices."
        : "A community built on respect and real experiences."
    )}<div class="card"><h3>${
      privacy ? "Profile visibility" : "Respect your community"
    }</h3><p>${
      privacy
        ? "Control whether members can find your profile from Settings → Privacy. Your email is not shown in community posts or reviews."
        : "Share thoughtful, accurate experiences. Respect other members and avoid posting private information about someone else."
    }</p></div><div class="card"><h3>${
      privacy ? "Your account data" : "Reviews and verification"
    }</h3><p>${
      privacy
        ? "Your profile and preferences are kept on this device. Passwords are not saved in device storage."
        : "Reviews reflect individual experiences. A verified relationship supports firsthand experience; it does not guarantee a program’s quality or future outcomes."
    }</p></div>${button(
      "Back to Settings",
      "settings",
      "secondary full"
    )}</div>`;
  }
  function finishSignIn() {
    const next = state.returnTo || "home";
    state.returnTo = null;
    save();
    go(next, true);
  }
  function setError(form, name, message) {
    const el = form.elements[name];
    const output = form.querySelector(`[data-error="${name}"]`);
    if (output) output.textContent = message;
    el?.setAttribute("aria-invalid", "true");
  }
  function submit(form) {
    const kind = form.dataset.authForm;
    if (!kind) return false;
    form
      .querySelectorAll("[data-error]")
      .forEach((el) => (el.textContent = ""));
    form
      .querySelectorAll("[aria-invalid]")
      .forEach((el) => el.removeAttribute("aria-invalid"));
    const data = Object.fromEntries(new FormData(form));
    const email = String(data.email || "").trim();
    if (kind === "forgot" && (!email || !form.elements.email.validity.valid))
      setError(form, "email", "Enter a valid email address.");
    if (kind === "login" && !email)
      setError(form, "email", "Enter your email address.");
    if (kind === "login" && !String(data.password || "").trim())
      setError(form, "password", "Enter your password.");
    if (kind === "reset" && String(data.password || "").length < 8)
      setError(form, "password", "Use at least 8 characters.");
    if (kind === "reset" && data.password !== data.confirm)
      setError(form, "confirm", "The passwords don’t match.");
    if (["verify", "reset-code"].includes(kind) && data.code !== "123456")
      setError(form, "code", "That code doesn’t match. Please try again.");
    const invalid = form.querySelector('[aria-invalid="true"]');
    if (invalid) {
      invalid.focus();
      return true;
    }
    if (kind === "login") {
      state.profile.email = email;
      state.session = { mode: "signed-in", provider: "email" };
      save();
      finishSignIn();
      toast("Welcome back.");
    }
    if (kind === "verify") {
      state.profile.name = draft().name || state.profile.name;
      state.profile.email = draft().email || state.profile.email;
      state.session = { mode: "onboarding", provider: "email" };
      save();
      startOnboarding(true);
    }
    if (kind === "forgot") {
      state.resetEmail = email;
      save();
      go("reset-code");
    }
    if (kind === "reset-code") {
      state.resetCodeVerified = true;
      go("reset-password");
    }
    if (kind === "reset") {
      if (!state.resetCodeVerified) {
        go("reset-code");
        return true;
      }
      state.resetCodeVerified = false;
      go("reset-complete", true);
    }
    return true;
  }
  function click(el) {
    if (el.dataset.authProvider) {
      state.authDraft = {
        name: "Jamie Smith",
        email: "jamie.smith@example.com",
      };
      state.profile.name = "Jamie Smith";
      state.profile.email = "jamie.smith@example.com";
      state.session = {
        mode: el.dataset.mode === "login" ? "signed-in" : "onboarding",
        provider: el.dataset.authProvider,
      };
      save();
      if (el.dataset.mode === "login") finishSignIn();
      else startOnboarding(true);
      return true;
    }
    const action = el.dataset.authAction;
    if (!action) return false;
    if (action === "guest") {
      state.session = { mode: "guest" };
      save();
      go("home", true);
    }
    if (action === "show-password") {
      const field = document.getElementById(el.dataset.field),
        show = field.type === "password";
      field.type = show ? "text" : "password";
      el.innerHTML = icon(show ? "eye-slash" : "eye", "regular");
      el.setAttribute("aria-label", show ? "Hide password" : "Show password");
      el.setAttribute("aria-pressed", String(show));
    }
    if (action === "resend") {
      toast("Use your latest verification code.");
    }
    if (action === "signout") {
      state.session = null;
      state.returnTo = null;
      state.authDraft = null;
      state.onboarding = null;
      state.resetEmail = "";
      state.resetCodeVerified = false;
      save();
      go("welcome", true);
    }
    return true;
  }
  return {
    screens: {
      welcome,
      login,
      "verify-email": () => verifyEmail(false),
      "forgot-password": forgot,
      "reset-code": () => verifyEmail(true),
      "reset-password": resetPassword,
      "reset-complete": resetDone,
      provider,
      "onboarding-ready": ready,
      legal,
    },
    click,
    submit,
  };
}
