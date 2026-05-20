const defaultEvents = [
  {
    id: "business-leadership-workshop",
    name: "Business Leadership Workshop",
    description: "Eveniment profesional pentru leadership, networking si check-in rapid cu recunoastere faciala.",
    date: "24 Mai 2026",
    time: "10:00",
    location: "Sala Europa",
    status: "Open",
    total: 156,
    registered: 142,
    available: 14,
    private: false
  },
  {
    id: "product-launch-event",
    name: "Product Launch Event",
    description: "Eveniment pentru lansarea unui produs nou.",
    date: "08 Iunie 2026",
    time: "18:00",
    location: "Grand Ballroom",
    status: "Open",
    total: 156,
    registered: 142,
    available: 14,
    private: false
  },
  {
    id: "tech-education-summit",
    name: "Tech Education Summit",
    description: "Eveniment pentru educatie si tehnologie.",
    date: "15 Iunie 2026",
    time: "09:00",
    location: "Campus Hall",
    status: "Coming",
    total: 156,
    registered: 142,
    available: 14,
    private: false
  }
];

const params = new URLSearchParams(window.location.search);
const privateEventId = params.get("event");
const exportedData = window.SECURE_PRESENCE_DATA || {};
const exportedEvents = exportedData.events || [];
const supabaseConfig = window.SECURE_PRESENCE_SUPABASE || {};
const hasSupabaseConfig = Boolean(supabaseConfig.url && supabaseConfig.anonKey && window.supabase);
const supabaseClient = hasSupabaseConfig
  ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey)
  : null;

let events = exportedEvents.length > 0 ? exportedEvents : defaultEvents;
let selectedEvent = events.find((event) => event.id === privateEventId) || events[0];
let currentUser = loadUser();
let currentProfile = loadProfile();
let registeredEventIds = new Set();
let registrations = [];

const phone = document.querySelector(".phone");
const loginView = document.getElementById("login-view");
const profileView = document.getElementById("profile-view");
const eventsView = document.getElementById("events-view");
const availableEventsButton = document.getElementById("available-events-button");
const myEventsButton = document.getElementById("my-events-button");
const eventsList = document.getElementById("events-list");
const myEventsList = document.getElementById("my-events-list");
const detailsView = document.getElementById("details-view");
const registerView = document.getElementById("register-view");
const statusView = document.getElementById("status-view");
const screenTitle = document.getElementById("screen-title");
const screenSubtitle = document.getElementById("screen-subtitle");
const userAvatar = document.getElementById("user-avatar");
const authTitle = document.getElementById("auth-title");
const showLoginButton = document.getElementById("show-login-button");
const showSignupButton = document.getElementById("show-signup-button");
const signupFields = document.getElementById("signup-fields");
const signupPhotoInput = document.getElementById("signup-photo");
const takeSignupPhotoButton = document.getElementById("take-signup-photo-button");
const signupPhotoPreview = document.getElementById("signup-photo-preview");
const signupPhotoStatus = document.getElementById("signup-photo-status");
const loginButton = document.getElementById("login-button");
const signupButton = document.getElementById("signup-button");
const logoutButton = document.getElementById("logout-button");
const saveProfileButton = document.getElementById("save-profile-button");
const registerButton = document.querySelector(".details-view .primary-button");
const submitButton = document.querySelector(".submit-button");
const formMessage = document.getElementById("form-message");
const profileMessage = document.getElementById("profile-message");
let temporaryRegistrations = [];
let statusReturnTimer = null;
let authMode = "login";

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem("securepresence_user") || "null");
  } catch (error) {
    return null;
  }
}

function saveUser(user) {
  currentUser = user;
  try {
    localStorage.setItem("securepresence_user", JSON.stringify(user));
  } catch (error) {
    return;
  }
}

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem("securepresence_profile") || "null");
  } catch (error) {
    return null;
  }
}

function saveProfile(profile) {
  currentProfile = profile;
  try {
    localStorage.setItem("securepresence_profile", JSON.stringify(profile));
  } catch (error) {
    return;
  }
}

function clearUser() {
  currentUser = null;
  currentProfile = null;
  registeredEventIds = new Set();
  registrations = [];
  try {
    localStorage.removeItem("securepresence_user");
    localStorage.removeItem("securepresence_profile");
  } catch (error) {
    return;
  }
}

function localRegistrationsKey() {
  return `securepresence_registrations_${currentUser?.email || "guest"}`;
}

function mapSupabaseEvent(event) {
  return {
    id: event.id,
    name: event.name,
    description: event.description || "",
    date: event.event_date || "",
    time: event.event_time || "",
    location: event.location || "",
    status: event.status || "Upcoming",
    total: event.total || 0,
    registered: event.registered || 0,
    available: event.available || 0,
    private: event.is_private
  };
}

async function loadSupabaseSession() {
  if (!supabaseClient) return;

  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    clearUser();
    return;
  }

  saveUser({
    id: data.session.user.id,
    email: data.session.user.email
  });
}

async function loadProfileFromSupabase() {
  if (!supabaseClient || !currentUser) return;

  const { data } = await supabaseClient
    .from("profiles")
    .select("username,first_name,last_name,phone,cnp,face_photo_data,email")
    .eq("id", currentUser.id)
    .single();

  if (!data) return;

  saveProfile({
    username: data.username || "",
    first_name: data.first_name || "",
    last_name: data.last_name || "",
    phone: data.phone || "",
    cnp: data.cnp || "",
    face_photo_data: data.face_photo_data || "",
    email: data.email || currentUser.email
  });
}

async function loadEvents() {
  if (!supabaseClient || !currentUser) return;

  const { data, error } = await supabaseClient
    .from("events")
    .select("id,name,description,event_date,event_time,location,status,total,registered,available,is_private")
    .order("created_at", { ascending: true });

  if (error || !data || data.length === 0) return;

  events = data.map(mapSupabaseEvent);
  selectedEvent = events.find((event) => event.id === privateEventId) || events[0];
}

async function loadRegistrations() {
  if (!currentUser) return;

  if (supabaseClient && currentUser.id) {
    const { data } = await supabaseClient
      .from("registrations")
      .select("event_id,created_at")
      .eq("user_id", currentUser.id);

    registrations = data || [];
  } else {
    try {
      registrations = JSON.parse(localStorage.getItem(localRegistrationsKey()) || "[]");
    } catch (error) {
      registrations = [];
    }
  }

  registeredEventIds = new Set(registrations.map((registration) => registration.event_id));
}

function eventDateLine(event) {
  return `${event.date} - ${event.time}<br>${event.location}`;
}

function createEventCard(event) {
  const card = document.createElement("article");
  card.className = event.id === selectedEvent.id ? "event-card featured" : "event-card";
  const isRegistered = registeredEventIds.has(event.id);
  const countText = isRegistered ? "Inscris" : `${event.registered} inscrisi`;

  card.innerHTML = `
    <h3>${event.name}</h3>
    <p class="event-meta">${event.date} - ${event.location}</p>
    <div class="event-footer">
      <span class="status">${event.status}</span>
      <span class="registered-count ${isRegistered ? "registered-pill" : ""}">${countText}</span>
    </div>
  `;

  card.addEventListener("click", function () {
    selectedEvent = event;
    showDetailsView();
  });

  return card;
}

function renderEvents() {
  eventsList.innerHTML = "";

  for (const event of events) {
    eventsList.appendChild(createEventCard(event));
  }
}

function parseEventDate(value) {
  const months = {
    ianuarie: 0, februarie: 1, martie: 2, aprilie: 3, mai: 4, iunie: 5,
    iulie: 6, august: 7, septembrie: 8, octombrie: 9, noiembrie: 10, decembrie: 11
  };
  const text = String(value || "").toLowerCase();
  const slashMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) return new Date(Number(slashMatch[3]), Number(slashMatch[2]) - 1, Number(slashMatch[1]));
  const wordMatch = text.match(/(\d{1,2})\s+([a-zăâîșț]+)\s+(\d{4})/);
  if (wordMatch) return new Date(Number(wordMatch[3]), months[wordMatch[2]] ?? 0, Number(wordMatch[1]));
  return new Date(8640000000000000);
}

function renderMyEvents() {
  myEventsList.innerHTML = "";
  const myEvents = events.filter((event) => registeredEventIds.has(event.id));

  if (myEvents.length === 0) {
    myEventsList.innerHTML = `<div class="empty-events">Nu esti inscris inca la niciun eveniment.</div>`;
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = myEvents.filter((event) => parseEventDate(event.date) >= today);
  const past = myEvents.filter((event) => parseEventDate(event.date) < today);

  for (const group of [
    ["Urmeaza sa mergi", upcoming],
    ["Ai fost", past]
  ]) {
    if (group[1].length === 0) continue;
    const title = document.createElement("div");
    title.className = "empty-events";
    title.textContent = group[0];
    myEventsList.appendChild(title);
    for (const event of group[1]) {
      myEventsList.appendChild(createEventCard(event));
    }
  }
}

function showAvailableEvents() {
  eventsList.classList.remove("hidden");
  myEventsList.classList.add("hidden");
  availableEventsButton.classList.add("active");
  myEventsButton.classList.remove("active");
}

function showMyEvents() {
  renderMyEvents();
  eventsList.classList.add("hidden");
  myEventsList.classList.remove("hidden");
  availableEventsButton.classList.remove("active");
  myEventsButton.classList.add("active");
}

function renderDetails() {
  const isRegistered = registeredEventIds.has(selectedEvent.id);
  document.getElementById("details-status").textContent = selectedEvent.private ? "Private registration" : "Open registrations";
  document.getElementById("details-name").textContent = selectedEvent.name;
  document.getElementById("details-date").innerHTML = eventDateLine(selectedEvent);
  document.getElementById("details-description").textContent = selectedEvent.description;
  document.getElementById("details-total").textContent = selectedEvent.total;
  document.getElementById("details-registered").textContent = selectedEvent.registered;
  document.getElementById("details-available").textContent = selectedEvent.available;
  registerButton.textContent = isRegistered ? "Esti deja inscris" : "Inscrie-te la eveniment";
}

function hideAllViews() {
  if (statusReturnTimer) {
    clearTimeout(statusReturnTimer);
    statusReturnTimer = null;
  }

  phone.classList.remove("auth-page");
  loginView.classList.remove("active");
  profileView.classList.remove("active");
  eventsView.classList.remove("active");
  detailsView.classList.remove("active");
  registerView.classList.remove("active");
  statusView.classList.remove("active");
}

function requireLogin() {
  if (currentUser) return true;
  showLoginView();
  return false;
}

function userInitials(email) {
  const name = email.split("@")[0] || "user";
  return name.slice(0, 2).toUpperCase();
}

function profileIsComplete() {
  return Boolean(
    currentProfile &&
    currentProfile.first_name &&
    currentProfile.last_name &&
    currentProfile.phone &&
    currentProfile.face_photo_data
  );
}

function fillProfileForm() {
  document.getElementById("profile-first-name").value = currentProfile?.first_name || "";
  document.getElementById("profile-last-name").value = currentProfile?.last_name || "";
  document.getElementById("profile-phone").value = currentProfile?.phone || "";
  document.getElementById("profile-cnp").value = currentProfile?.cnp || "";
}

function fillRegistrationForm() {
  document.getElementById("first-name").value = currentProfile?.first_name || "not-provided";
  document.getElementById("last-name").value = currentProfile?.last_name || "not-provided";
  document.getElementById("email").value = currentUser?.email || currentProfile?.email || "";
  document.getElementById("phone").value = currentProfile?.phone || "not-provided";
  document.getElementById("cnp").value = currentProfile?.cnp || "not-provided";
  document.getElementById("face-photo").value = currentProfile?.face_photo_data ? "Poza profil incarcata" : "not-provided";
}

function updateUserHeader() {
  if (currentUser) {
    phone.classList.add("logged-in");
    userAvatar.textContent = userInitials(currentUser.email);
  } else {
    phone.classList.remove("logged-in");
    userAvatar.textContent = "US";
  }
}

function setAuthMode(mode) {
  authMode = mode;
  const isSignup = mode === "signup";
  authTitle.textContent = isSignup ? "Sign up user" : "Login user";
  screenTitle.textContent = isSignup ? "Sign up" : "User login";
  screenSubtitle.textContent = isSignup ? "Creeaza cont pentru evenimente" : "Acces pentru evenimentele tale";
  loginButton.classList.toggle("hidden", isSignup);
  signupButton.classList.toggle("hidden", !isSignup);
  signupFields.classList.toggle("hidden", !isSignup);
  showLoginButton.classList.toggle("active", !isSignup);
  showSignupButton.classList.toggle("active", isSignup);
  document.getElementById("login-identity-label").textContent = isSignup ? "Email" : "Email sau username";
  document.getElementById("login-email").type = isSignup ? "email" : "text";
  document.getElementById("login-message").textContent = isSignup
    ? "Daca nu ai cont, creeaza unul cu email si parola."
    : "Cont user pentru inscriere la evenimente.";
}

function cleanUsername(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
}

async function resolveLoginEmail(identity) {
  if (identity.includes("@") || !supabaseClient) return identity;

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("email")
    .eq("username", cleanUsername(identity))
    .maybeSingle();

  if (error || !data) return "";
  return data.email;
}

function updateSignupPhotoPreview() {
  if (signupPhotoInput.files.length === 0) {
    signupPhotoPreview.classList.add("hidden");
    signupPhotoPreview.style.backgroundImage = "";
    signupPhotoStatus.textContent = "Poza este necesara pentru check-in facial.";
    return;
  }

  const imageUrl = URL.createObjectURL(signupPhotoInput.files[0]);
  signupPhotoPreview.style.backgroundImage = `url("${imageUrl}")`;
  signupPhotoPreview.classList.remove("hidden");
  signupPhotoStatus.textContent = "Poza a fost incarcata.";
}

function showLoginView(event) {
  if (event) event.preventDefault();

  hideAllViews();
  phone.classList.add("auth-page");
  updateUserHeader();
  loginView.classList.add("active");
  setAuthMode(authMode);
}

function showProfileView(event) {
  if (event) event.preventDefault();
  if (!requireLogin()) return;

  hideAllViews();
  fillProfileForm();
  profileMessage.textContent = "";
  profileView.classList.add("active");
  screenTitle.textContent = "Profil user";
  screenSubtitle.textContent = "Date folosite automat la inscriere";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function saveProfileData(event) {
  if (event) event.preventDefault();
  if (!requireLogin()) return;

  const firstName = document.getElementById("profile-first-name").value.trim();
  const lastName = document.getElementById("profile-last-name").value.trim();
  const phoneValue = document.getElementById("profile-phone").value.trim();
  const cnpValue = document.getElementById("profile-cnp").value.trim() || "not-provided";
  const photoInput = document.getElementById("profile-photo");
  let photoData = currentProfile?.face_photo_data || "";

  if (photoInput.files.length > 0) {
    photoData = await readFileAsDataUrl(photoInput.files[0]);
  }

  if (!firstName || !lastName || !phoneValue || !photoData) {
    profileMessage.textContent = "Completeaza toate datele si incarca poza.";
    return;
  }

  const profile = {
    email: currentUser.email,
    first_name: firstName,
    last_name: lastName,
    phone: phoneValue,
    cnp: cnpValue,
    face_photo_data: photoData
  };

  if (supabaseClient && currentUser.id) {
    const { error } = await supabaseClient
      .from("profiles")
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        cnp: profile.cnp,
        face_photo_data: profile.face_photo_data,
        full_name: `${profile.first_name} ${profile.last_name}`.trim()
      })
      .eq("id", currentUser.id);

    if (error) {
      profileMessage.textContent = "Profilul nu s-a putut salva in Supabase.";
      return;
    }
  }

  saveProfile(profile);
  await loadEvents();
  showEventsView();
}

async function loginUser(event) {
  if (event) event.preventDefault();

  const identity = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const message = document.getElementById("login-message");

  if (!identity || !password) {
    message.textContent = "Completeaza email/username si parola.";
    return;
  }

  if (supabaseClient) {
    const email = await resolveLoginEmail(identity);
    if (!email) {
      message.textContent = "Username-ul nu exista.";
      return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      message.textContent = "Login Supabase esuat. Verifica email/parola.";
      return;
    }

    saveUser({
      id: data.user.id,
      email: data.user.email
    });
    await loadProfileFromSupabase();
    await loadEvents();
    await loadRegistrations();
  } else {
    saveUser({ email: identity });
    await loadRegistrations();
  }

  updateUserHeader();
  message.textContent = "Autentificat.";

  if (privateEventId) {
    showDetailsView();
  } else {
    showEventsView();
  }
}

async function signupUser(event) {
  if (event) event.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const username = cleanUsername(document.getElementById("signup-username").value);
  const firstName = document.getElementById("signup-first-name").value.trim();
  const lastName = document.getElementById("signup-last-name").value.trim();
  const phoneValue = document.getElementById("signup-phone").value.trim();
  const cnpValue = document.getElementById("signup-cnp").value.trim() || "not-provided";
  const photoInput = document.getElementById("signup-photo");
  const message = document.getElementById("login-message");

  if (!email || !password || !username || !firstName || !lastName || !phoneValue || photoInput.files.length === 0) {
    message.textContent = "Completeaza toate campurile si incarca poza.";
    return;
  }

  if (password.length < 6) {
    message.textContent = "Parola trebuie sa aiba minim 6 caractere.";
    return;
  }

  const photoData = await readFileAsDataUrl(photoInput.files[0]);
  const profile = {
    email,
    username,
    first_name: firstName,
    last_name: lastName,
    phone: phoneValue,
    cnp: cnpValue,
    face_photo_data: photoData
  };

  if (supabaseClient) {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: `${firstName} ${lastName}`.trim()
        }
      }
    });

    if (error) {
      message.textContent = "Contul nu s-a putut crea. Verifica email/parola.";
      return;
    }

    if (!data.session) {
      message.textContent = "Cont creat. Verifica emailul, apoi revino la Login.";
      setAuthMode("login");
      return;
    }

    saveUser({
      id: data.user.id,
      email: data.user.email
    });

    const { error: profileError } = await supabaseClient
      .from("profiles")
      .update({
        username: profile.username,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        cnp: profile.cnp,
        face_photo_data: profile.face_photo_data,
        full_name: `${profile.first_name} ${profile.last_name}`.trim()
      })
      .eq("id", data.user.id);

    if (profileError) {
      message.textContent = "Cont creat, dar profilul nu s-a putut salva.";
      return;
    }
  } else {
    saveUser({ email });
  }

  saveProfile(profile);
  updateUserHeader();
  await loadEvents();
  await loadRegistrations();
  showEventsView();
}

async function logoutUser(event) {
  if (event) event.preventDefault();
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  clearUser();
  showLoginView();
}

function showEventsView(event) {
  if (event) event.preventDefault();
  if (!requireLogin()) return;

  hideAllViews();
  renderEvents();
  renderMyEvents();
  showAvailableEvents();
  eventsView.classList.add("active");
  screenTitle.textContent = "Evenimente disponibile";
  screenSubtitle.textContent = "Date citite din aplicatia admin";
}

function showDetailsView(event) {
  if (event) event.preventDefault();
  if (!requireLogin()) return;

  hideAllViews();
  renderDetails();
  detailsView.classList.add("active");
  screenTitle.textContent = "Detalii eveniment";
  screenSubtitle.textContent = "Event selectat din baza aplicatiei";
}

function showRegisterView(event) {
  if (event) event.preventDefault();
  if (!requireLogin()) return;

  saveRegistration();
}

async function saveRegistration(event) {
  if (event) event.preventDefault();
  if (!requireLogin()) return;

  if (registeredEventIds.has(selectedEvent.id)) {
    showEventsView();
    showMyEvents();
    return;
  }

  fillRegistrationForm();

  const registration = {
    event_id: selectedEvent.id,
    event_name: selectedEvent.name,
    user_email: currentUser.email,
    first_name: document.getElementById("first-name").value,
    last_name: document.getElementById("last-name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    cnp: document.getElementById("cnp").value,
    face_photo_data: currentProfile?.face_photo_data || "",
    synced_to_admin: false,
    created_at: new Date().toISOString()
  };

  if (supabaseClient && currentUser.id) {
    const { error } = await supabaseClient.from("registrations").insert({
      event_id: registration.event_id,
      user_id: currentUser.id,
      first_name: registration.first_name,
      last_name: registration.last_name,
      email: registration.email,
      phone: registration.phone,
      cnp: registration.cnp,
      face_photo_data: registration.face_photo_data,
      synced_to_admin: false
    });

    if (error) {
      const duplicate = String(error.message || "").toLowerCase().includes("duplicate");
      document.getElementById("saved-row").textContent = duplicate
        ? `registrations: esti deja inscris la ${selectedEvent.name}`
        : "registrations: eroare la salvarea in Supabase";
      if (duplicate) {
        registeredEventIds.add(selectedEvent.id);
        showEventsView();
        showMyEvents();
        return;
      }
      showStatusView();
      return;
    }

    await supabaseClient.rpc("increment_event_registration", {
      p_event_id: registration.event_id
    });
  } else {
    try {
      const saved = JSON.parse(localStorage.getItem(localRegistrationsKey()) || "[]");
      saved.push(registration);
      localStorage.setItem(localRegistrationsKey(), JSON.stringify(saved));
    } catch (error) {
      temporaryRegistrations.push(registration);
    }
  }

  registrations.push(registration);
  registeredEventIds.add(selectedEvent.id);
  selectedEvent.registered = Number(selectedEvent.registered || 0) + 1;
  selectedEvent.available = Math.max(Number(selectedEvent.available || 0) - 1, 0);
  renderDetails();
  renderEvents();
  renderMyEvents();
  document.getElementById("saved-row").textContent = `registrations: rand nou creat pentru ${selectedEvent.name}`;
  showStatusView();
}

function showStatusView(event) {
  if (event) event.preventDefault();
  if (!requireLogin()) return;

  hideAllViews();
  statusView.classList.add("active");
  screenTitle.textContent = "Inscriere trimisa";
  screenSubtitle.textContent = "Confirmare locala";
  statusReturnTimer = setTimeout(function () {
    showEventsView();
  }, 5000);
}

showLoginButton.addEventListener("click", () => setAuthMode("login"));
showSignupButton.addEventListener("click", () => setAuthMode("signup"));
takeSignupPhotoButton.addEventListener("click", () => signupPhotoInput.click());
signupPhotoInput.addEventListener("change", updateSignupPhotoPreview);
availableEventsButton.addEventListener("click", showAvailableEvents);
myEventsButton.addEventListener("click", showMyEvents);
loginButton.addEventListener("click", loginUser);
signupButton.addEventListener("click", signupUser);
logoutButton.addEventListener("click", logoutUser);
saveProfileButton.addEventListener("click", saveProfileData);
registerButton.addEventListener("click", showRegisterView);
submitButton.addEventListener("click", saveRegistration);

async function startApp() {
  await loadSupabaseSession();
  await loadProfileFromSupabase();
  updateUserHeader();

  if (!currentUser) {
    showLoginView();
    return;
  }

  await loadEvents();
  await loadRegistrations();

  if (privateEventId) {
    showDetailsView();
  } else {
    showEventsView();
  }
}

startApp();
