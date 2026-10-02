const attachments = new WeakMap();
const supportedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 10 * 1024 * 1024;

export function photoPicker(icon) {
  return `<div class="post-photo-field"><span class="post-photo-label">Photo <small>Optional</small></span><label class="post-photo-picker" id="post-photo-picker">${icon("image", "regular")}<strong>Upload a photo</strong><span>Choose from your photos or files</span><small id="post-photo-help">JPG, PNG or WebP · Up to 10 MB</small><input id="post-photo" type="file" name="photo" accept="image/jpeg,image/png,image/webp" aria-label="Upload a photo" aria-describedby="post-photo-help post-photo-status" /></label><div id="post-image-preview" class="post-photo-preview" hidden><div class="post-photo-details"><span id="post-photo-name"></span><div><button type="button" class="text-button" data-post-photo="replace">Change photo</button><button type="button" class="text-button" data-post-photo="remove">Remove</button></div></div></div><p id="post-photo-status" class="post-photo-status" role="status" aria-live="polite"></p></div>`;
}

export const postPhoto = (form) => attachments.get(form)?.image || "";
export const photoIsLoading = (form) => !!attachments.get(form)?.loading;

function updatePicker(form) {
  const attachment = attachments.get(form);
  const image = attachment?.image || "";
  const preview = form.querySelector("#post-image-preview");
  const picker = form.querySelector("#post-photo-picker");
  const status = form.querySelector("#post-photo-status");
  picker.classList.toggle("has-photo", !!image);
  preview.hidden = !image;
  if (image) {
    const photo = preview.querySelector("img") || new Image();
    photo.alt = "Selected photo";
    photo.src = image;
    if (!photo.isConnected) preview.prepend(photo);
  } else preview.querySelector("img")?.remove();
  form.querySelector("#post-photo-name").textContent = attachment?.name || "";
  status.textContent = attachment?.loading ? "Preparing your photo…" : attachment?.error || "";
  status.classList.toggle("is-error", !!attachment?.error);
  form.querySelector(".primary").disabled = !!attachment?.loading;
  form.querySelector("#post-photo").setAttribute("aria-invalid", String(!!attachment?.error));
  preview.setAttribute("aria-busy", String(!!attachment?.loading));
}

async function preparePhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const photo = new Image();
    photo.src = url;
    await photo.decode();
    const scale = Math.min(1, 1600 / Math.max(photo.naturalWidth, photo.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(photo.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(photo.naturalHeight * scale));
    canvas.getContext("2d").drawImage(photo, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/webp", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function selectPostPhoto(input) {
  const form = input.closest('[data-form="post"]');
  const file = input.files?.[0];
  if (!form || !file) return;
  // Keep a previous selection until its replacement is ready.
  const previous = attachments.get(form);
  const selection = { image: previous?.image || "", name: previous?.name || "" };
  attachments.set(form, selection);
  input.value = "";
  if (!supportedTypes.has(file.type)) {
    selection.error = "Choose a JPG, PNG or WebP image.";
    updatePicker(form);
    return;
  }
  if (file.size > maxBytes) {
    selection.error = "Choose a photo smaller than 10 MB.";
    updatePicker(form);
    return;
  }
  selection.loading = true;
  updatePicker(form);
  try {
    const image = await preparePhoto(file);
    if (!form.isConnected || attachments.get(form) !== selection) return;
    selection.image = image;
    selection.name = file.name;
  } catch {
    selection.error = "This photo could not be opened. Please choose another image.";
  } finally {
    selection.loading = false;
    if (form.isConnected && attachments.get(form) === selection) updatePicker(form);
  }
}

export function handlePhotoAction(button) {
  const form = button.closest('[data-form="post"]');
  if (!form || !button.dataset.postPhoto) return false;
  const input = form.querySelector("#post-photo");
  if (button.dataset.postPhoto === "replace") input.click();
  else {
    attachments.delete(form);
    input.value = "";
    updatePicker(form);
    input.focus();
  }
  return true;
}
