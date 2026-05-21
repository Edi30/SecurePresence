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
const brandLockup = document.querySelector(".brand-lockup");
const loginView = document.getElementById("login-view");
const profileView = document.getElementById("profile-view");
const settingsView = document.getElementById("settings-view");
const supportView = document.getElementById("support-view");
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
const userMenu = document.getElementById("user-menu");
const profileMenuButton = document.getElementById("profile-menu-button");
const settingsMenuButton = document.getElementById("settings-menu-button");
const supportMenuButton = document.getElementById("support-menu-button");
const darkModeButton = document.getElementById("dark-mode-button");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const languageSelect = document.getElementById("language-select");
const backButtons = document.querySelectorAll(".back-button");
const languageLabel = document.getElementById("language-label");
const profilePhotoInput = document.getElementById("profile-photo");
const takeProfilePhotoButton = document.getElementById("take-profile-photo-button");
const profilePhotoPreview = document.getElementById("profile-photo-preview");
const profilePhotoStatus = document.getElementById("profile-photo-status");
const authTitle = document.getElementById("auth-title");
const showLoginButton = document.getElementById("show-login-button");
const showSignupButton = document.getElementById("show-signup-button");
const signupFields = document.getElementById("signup-fields");
const forgotPasswordButton = document.getElementById("forgot-password-button");
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
const supportMessageInput = document.getElementById("support-message-input");
const supportMessageStatus = document.getElementById("support-message-status");
const sendSupportMessageButton = document.getElementById("send-support-message-button");
const passwordMessage = document.getElementById("password-message");
const changePasswordButton = document.getElementById("change-password-button");
let temporaryRegistrations = [];
let statusReturnTimer = null;
let authMode = "login";

const translations = {
  ro: {
    appTitle: "SecurePresence",
    userLogin: "User login",
    loginAccess: "Acces pentru evenimentele tale",
    signupTitle: "Sign up",
    signupSubtitle: "Creeaza cont pentru evenimente",
    loginUser: "Login user",
    signupUser: "Sign up user",
    loginTab: "Login",
    signupTab: "Sign up",
    emailOrUsername: "Email",
    email: "Email",
    password: "Password",
    username: "Nume utilizator",
    firstName: "Prenume",
    lastName: "Nume",
    phone: "Telefon",
    facePhoto: "Poza pentru check-in facial",
    takePhoto: "Fa poza",
    changePhoto: "Schimba poza",
    signupPhotoRequired: "Poza este necesara pentru check-in facial.",
    signupPhotoLoaded: "Poza a fost incarcata.",
    profilePhotoReady: "Poza noua este pregatita pentru salvare.",
    profilePhotoLoaded: "Poza profilului este incarcata.",
    profilePhotoHint: "Poza profilului este folosita la check-in.",
    loginButton: "Intra in cont",
    signupButton: "Creeaza cont",
    forgotPassword: "Ai uitat parola?",
    loginHint: "Cont user pentru inscriere la evenimente.",
    signupHint: "Daca nu ai cont, creeaza unul cu email si parola.",
    eventsTitle: "Evenimente",
    available: "Disponibile",
    myRegistrations: "Inscrierile mele",
    databaseTitle: "Functionalitati baza de date",
    databaseDescription: "Site-ul citeste evenimentele publice si trimite inscrierile in registrations.",
    profile: "Profil",
    settings: "Setari",
    support: "Suport",
    logout: "Logout",
    back: "Inapoi",
    profileTitle: "Profil",
    profileScreen: "Profil user",
    profileSubtitle: "Date folosite automat la inscriere",
    saveProfile: "Salveaza profilul",
    settingsTitle: "Setari",
    settingsSubtitle: "Preferinte user",
    darkMode: "Dark mode",
    language: "Limba",
    supportTitle: "Suport",
    supportSubtitle: "Ajutor pentru cont si inscrieri",
    supportMessageTitle: "Mesaj catre administrator",
    supportMessageDescription: "Trimite o problema sau o intrebare despre cont, inscrieri sau evenimente.",
    supportPlaceholder: "Scrie mesajul aici",
    sendSupportMessage: "Trimite mesaj",
    supportEmpty: "Scrie mesajul inainte sa il trimiti.",
    supportSent: "Mesaj trimis catre administrator.",
    supportLocalSent: "Mesaj salvat local. Cand conectezi tabelul support_requests, se trimite online.",
    passwordTitle: "Schimba parola",
    passwordDescription: "Primeste pe email un link securizat pentru resetarea parolei.",
    changePassword: "Trimite link resetare",
    passwordResetSent: "Linkul de resetare a fost trimis pe email.",
    passwordResetLocal: "In demo local nu se poate trimite email. Conecteaza Supabase pentru resetare parola.",
    passwordChangeFailed: "Emailul de resetare nu s-a putut trimite. Incearca din nou.",
    detailsTitle: "Detalii eveniment",
    detailsSubtitle: "Event selectat din baza aplicatiei",
    openRegistrations: "Open registrations",
    privateRegistration: "Private registration",
    totalSeats: "locuri totale",
    registered: "inscrisi",
    availableSeats: "locuri libere",
    registerEvent: "Inscrie-te la eveniment",
    alreadyRegisteredButton: "Esti deja inscris",
    registeredPill: "Inscris",
    noEvents: "Nu esti inscris inca la niciun eveniment.",
    upcomingEvents: "Urmeaza sa mergi",
    pastEvents: "Ai fost",
    statusScreen: "Inscriere trimisa",
    statusSubtitle: "Confirmare locala",
    statusTitle: "Inscriere salvata",
    statusMessage: "Datele tale au fost salvate pentru eventul selectat. Cand conectam Supabase, acelasi formular trimite datele online.",
    statusCardTitle: "Status baza de date",
    adminSyncTitle: "In aplicatia admin",
    adminSyncDescription: "In 5 secunde revii automat la lista principala de evenimente.",
    createdRow: "registrations: rand nou creat",
    createdFor: "registrations: rand nou creat pentru",
    alreadyRegisteredFor: "registrations: esti deja inscris la",
    registrationError: "registrations: eroare la salvarea in Supabase",
    completeProfile: "Completeaza prenume, nume si telefon.",
    profileSaved: "Profil salvat.",
    profileLocalSaved: "Profil salvat local. Verifica politicile Supabase pentru salvare online.",
    completeLogin: "Completeaza email si password.",
    missingUsername: "Username-ul nu exista.",
    loginFailed: "Login Supabase esuat. Verifica email/parola.",
    resetEmailNeeded: "Scrie emailul sau username-ul pentru resetare.",
    resetEmailSent: "Emailul de resetare a fost trimis.",
    resetEmailLocal: "Resetarea parolei merge doar cand site-ul este conectat la Supabase.",
    resetEmailFailed: "Emailul de resetare nu s-a putut trimite.",
    loggedIn: "Autentificat.",
    completeSignup: "Completeaza toate campurile si incarca poza.",
    shortPassword: "Parola trebuie sa aiba minim 6 caractere.",
    signupFailed: "Contul nu s-a putut crea. Verifica email/parola.",
    verifyEmail: "Cont creat. Verifica emailul, apoi revino la Login.",
    profileSaveFailed: "Cont creat, dar profilul nu s-a putut salva.",
    photoUploadFailed: "Poza nu s-a putut salva in Supabase Storage. Verifica bucketul face-photos."
  },
  en: {
    appTitle: "SecurePresence",
    userLogin: "User login",
    loginAccess: "Access your events",
    signupTitle: "Sign up",
    signupSubtitle: "Create an event account",
    loginUser: "Login user",
    signupUser: "Sign up user",
    loginTab: "Login",
    signupTab: "Sign up",
    emailOrUsername: "Email",
    email: "Email",
    password: "Password",
    username: "Username",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone",
    facePhoto: "Face check-in photo",
    takePhoto: "Take photo",
    changePhoto: "Change photo",
    signupPhotoRequired: "Photo is required for facial check-in.",
    signupPhotoLoaded: "Photo has been uploaded.",
    profilePhotoReady: "New photo is ready to save.",
    profilePhotoLoaded: "Profile photo is loaded.",
    profilePhotoHint: "Profile photo is used for check-in.",
    loginButton: "Log in",
    signupButton: "Create account",
    forgotPassword: "Forgot password?",
    loginHint: "User account for event registration.",
    signupHint: "Create an account with email and password.",
    eventsTitle: "Events",
    available: "Available",
    myRegistrations: "My events",
    databaseTitle: "Database features",
    databaseDescription: "The site reads public events and sends registrations to the registrations table.",
    profile: "Profile",
    settings: "Settings",
    support: "Support",
    logout: "Logout",
    back: "Back",
    profileTitle: "Profile",
    profileScreen: "User profile",
    profileSubtitle: "Data used automatically for registration",
    saveProfile: "Save profile",
    settingsTitle: "Settings",
    settingsSubtitle: "User preferences",
    darkMode: "Dark mode",
    language: "Language",
    supportTitle: "Support",
    supportSubtitle: "Help for account and registrations",
    supportMessageTitle: "Message administrator",
    supportMessageDescription: "Send a problem or question about your account, registrations or events.",
    supportPlaceholder: "Write your message here",
    sendSupportMessage: "Send message",
    supportEmpty: "Write a message before sending it.",
    supportSent: "Message sent to administrator.",
    supportLocalSent: "Message saved locally. When the support_requests table is connected, it will be sent online.",
    passwordTitle: "Change password",
    passwordDescription: "Receive a secure password reset link by email.",
    changePassword: "Send reset link",
    passwordResetSent: "Password reset link was sent by email.",
    passwordResetLocal: "Local demo cannot send email. Connect Supabase for password reset.",
    passwordChangeFailed: "Password reset email could not be sent. Try again.",
    detailsTitle: "Event details",
    detailsSubtitle: "Event selected from the app database",
    openRegistrations: "Open registrations",
    privateRegistration: "Private registration",
    totalSeats: "total seats",
    registered: "registered",
    availableSeats: "available seats",
    registerEvent: "Register for event",
    alreadyRegisteredButton: "Already registered",
    registeredPill: "Registered",
    noEvents: "You are not registered for any event yet.",
    upcomingEvents: "Upcoming",
    pastEvents: "Past events",
    statusScreen: "Registration sent",
    statusSubtitle: "Local confirmation",
    statusTitle: "Registration saved",
    statusMessage: "Your data has been saved for the selected event. When Supabase is connected, the same form sends the data online.",
    statusCardTitle: "Database status",
    adminSyncTitle: "In the admin app",
    adminSyncDescription: "In 5 seconds you return automatically to the main events list.",
    createdRow: "registrations: new row created",
    createdFor: "registrations: new row created for",
    alreadyRegisteredFor: "registrations: already registered for",
    registrationError: "registrations: Supabase save error",
    completeProfile: "Complete first name, last name and phone.",
    profileSaved: "Profile saved.",
    profileLocalSaved: "Profile saved locally. Check Supabase policies for online saving.",
    completeLogin: "Complete email/username and password.",
    missingUsername: "Username does not exist.",
    loginFailed: "Supabase login failed. Check email/password.",
    resetEmailNeeded: "Enter email or username for reset.",
    resetEmailSent: "Password reset email was sent.",
    resetEmailLocal: "Password reset works only when the site is connected to Supabase.",
    resetEmailFailed: "Password reset email could not be sent.",
    loggedIn: "Authenticated.",
    completeSignup: "Complete all fields and upload a photo.",
    shortPassword: "Password must have at least 6 characters.",
    signupFailed: "Account could not be created. Check email/password.",
    verifyEmail: "Account created. Check your email, then return to Login.",
    profileSaveFailed: "Account created, but profile could not be saved.",
    photoUploadFailed: "Photo could not be saved in Supabase Storage. Check the face-photos bucket."
  }
};

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
    const profile = JSON.parse(localStorage.getItem("securepresence_profile") || "null");
    const savedPhoto = localStorage.getItem("securepresence_face_photo") || "";
    if (profile && savedPhoto && !profile.face_photo_data) {
      profile.face_photo_data = savedPhoto;
    }
    return profile;
  } catch (error) {
    return null;
  }
}

function saveProfile(profile) {
  const savedPhoto = localStorage.getItem("securepresence_face_photo") || "";
  const photo = profile.face_photo_data || currentProfile?.face_photo_data || savedPhoto || "";
  currentProfile = {
    ...profile,
    face_photo_data: photo
  };
  try {
    localStorage.setItem("securepresence_profile", JSON.stringify(currentProfile));
    if (photo) {
      localStorage.setItem("securepresence_face_photo", photo);
    }
  } catch (error) {
    return;
  }
}

function currentLanguage() {
  return languageSelect?.value || localStorage.getItem("securepresence_language") || "ro";
}

function t(key) {
  const language = currentLanguage();
  return translations[language]?.[key] || translations.ro[key] || key;
}

function setText(id, key) {
  const element = document.getElementById(id);
  if (element) element.textContent = t(key);
}

function clearUser() {
  currentUser = null;
  currentProfile = null;
  registeredEventIds = new Set();
  registrations = [];
  try {
    localStorage.removeItem("securepresence_user");
    localStorage.removeItem("securepresence_profile");
    localStorage.removeItem("securepresence_face_photo");
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

  const metadata = data.session.user.user_metadata || {};
  if (!currentProfile && (metadata.first_name || metadata.last_name || metadata.phone)) {
    saveProfile({
      username: metadata.username || "",
      first_name: metadata.first_name || "",
      last_name: metadata.last_name || "",
      phone: metadata.phone || "",
      cnp: "",
      face_photo_data: "",
      email: data.session.user.email
    });
  }
}

async function loadProfileFromSupabase() {
  if (!supabaseClient || !currentUser) return;

  const { data: userData } = await supabaseClient.auth.getUser();
  const metadata = userData?.user?.user_metadata || {};
  const { data } = await supabaseClient
    .from("profiles")
    .select("username,first_name,last_name,phone,cnp,face_photo_data,email")
    .eq("id", currentUser.id)
    .maybeSingle();

  saveProfile({
    username: data?.username || metadata.username || currentProfile?.username || "",
    first_name: data?.first_name || metadata.first_name || currentProfile?.first_name || "",
    last_name: data?.last_name || metadata.last_name || currentProfile?.last_name || "",
    phone: data?.phone || metadata.phone || currentProfile?.phone || "",
    cnp: data?.cnp || currentProfile?.cnp || "",
    face_photo_data: data?.face_photo_data || currentProfile?.face_photo_data || localStorage.getItem("securepresence_face_photo") || "",
    email: data?.email || currentUser.email
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
  const countText = isRegistered ? t("registeredPill") : `${event.registered} ${t("registered")}`;

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
    myEventsList.innerHTML = `<div class="empty-events">${t("noEvents")}</div>`;
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = myEvents.filter((event) => parseEventDate(event.date) >= today);
  const past = myEvents.filter((event) => parseEventDate(event.date) < today);

  for (const event of upcoming) {
    myEventsList.appendChild(createEventCard(event));
  }

  if (past.length > 0) {
    const title = document.createElement("div");
    title.className = "empty-events";
    title.textContent = t("pastEvents");
    myEventsList.appendChild(title);
    for (const event of past) {
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
  document.getElementById("details-status").textContent = selectedEvent.private ? t("privateRegistration") : t("openRegistrations");
  document.getElementById("details-name").textContent = selectedEvent.name;
  document.getElementById("details-date").innerHTML = eventDateLine(selectedEvent);
  document.getElementById("details-description").textContent = selectedEvent.description;
  document.getElementById("details-total").textContent = selectedEvent.total;
  document.getElementById("details-registered").textContent = selectedEvent.registered;
  document.getElementById("details-available").textContent = selectedEvent.available;
  setText("details-total-label", "totalSeats");
  setText("details-registered-label", "registered");
  setText("details-available-label", "availableSeats");
  registerButton.textContent = isRegistered ? t("alreadyRegisteredButton") : t("registerEvent");
}

function hideAllViews() {
  if (statusReturnTimer) {
    clearTimeout(statusReturnTimer);
    statusReturnTimer = null;
  }

  phone.classList.remove("auth-page");
  loginView.classList.remove("active");
  profileView.classList.remove("active");
  settingsView.classList.remove("active");
  supportView.classList.remove("active");
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
  document.getElementById("profile-email").value = currentUser?.email || currentProfile?.email || "";
  document.getElementById("profile-first-name").value = currentProfile?.first_name || "";
  document.getElementById("profile-last-name").value = currentProfile?.last_name || "";
  document.getElementById("profile-phone").value = currentProfile?.phone || "";
  document.getElementById("profile-cnp").value = currentProfile?.cnp || "";
  updateProfilePhotoPreview();
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
    userMenu.classList.add("hidden");
  }
}

function toggleUserMenu(event) {
  if (event) event.stopPropagation();
  if (!currentUser) return;
  userMenu.classList.toggle("hidden");
}

function closeUserMenu() {
  userMenu.classList.add("hidden");
}

function loadSettings() {
  const darkMode = localStorage.getItem("securepresence_dark_mode") === "true";
  const language = localStorage.getItem("securepresence_language") || "ro";
  setDarkMode(darkMode);
  languageSelect.value = language;
  applyLanguage();
}

function setDarkMode(isDark) {
  darkModeToggle.checked = isDark;
  darkModeButton.classList.toggle("is-on", isDark);
  darkModeButton.setAttribute("aria-pressed", String(isDark));
  phone.classList.toggle("dark-mode", isDark);
  document.body.classList.toggle("dark-mode-body", isDark);
}

function saveDarkMode(isDark) {
  localStorage.setItem("securepresence_dark_mode", String(isDark));
  setDarkMode(isDark);
}

function toggleDarkMode() {
  saveDarkMode(!darkModeToggle.checked);
}

function saveLanguage() {
  localStorage.setItem("securepresence_language", languageSelect.value);
  applyLanguage();
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage();
  darkModeButton.textContent = t("darkMode");
  languageLabel.textContent = t("language");
  languageSelect.options[0].textContent = currentLanguage() === "en" ? "Romanian" : "Romana";
  languageSelect.options[1].textContent = currentLanguage() === "en" ? "English" : "Engleza";
  profileMenuButton.textContent = t("profile");
  settingsMenuButton.textContent = t("settings");
  supportMenuButton.textContent = t("support");
  logoutButton.querySelector("span").textContent = t("logout");
  showLoginButton.textContent = t("loginTab");
  showSignupButton.textContent = t("signupTab");
  loginButton.textContent = t("loginButton");
  signupButton.textContent = t("signupButton");
  forgotPasswordButton.textContent = t("forgotPassword");
  saveProfileButton.textContent = t("saveProfile");
  setText("login-password-label", "password");
  setText("signup-username-label", "username");
  setText("signup-first-name-label", "firstName");
  setText("signup-last-name-label", "lastName");
  setText("signup-phone-label", "phone");
  setText("signup-photo-label", "facePhoto");
  setText("signup-photo-button-label", "takePhoto");
  setText("events-heading", "eventsTitle");
  setText("available-events-button", "available");
  setText("my-events-button", "myRegistrations");
  setText("database-title", "databaseTitle");
  setText("database-description", "databaseDescription");
  setText("profile-heading", "profileTitle");
  setText("profile-photo-button-label", "changePhoto");
  setText("profile-email-label", "email");
  setText("profile-first-name-label", "firstName");
  setText("profile-last-name-label", "lastName");
  setText("profile-phone-label", "phone");
  setText("profile-photo-label", "facePhoto");
  setText("settings-heading", "settingsTitle");
  setText("support-heading", "supportTitle");
  setText("support-message-title", "supportMessageTitle");
  setText("support-message-description", "supportMessageDescription");
  setText("send-support-message-button", "sendSupportMessage");
  setText("password-title", "passwordTitle");
  setText("password-description", "passwordDescription");
  setText("change-password-button", "changePassword");
  supportMessageInput.placeholder = t("supportPlaceholder");
  setText("status-heading", "statusTitle");
  setText("status-message", "statusMessage");
  setText("status-card-title", "statusCardTitle");
  setText("admin-sync-title", "adminSyncTitle");
  setText("admin-sync-description", "adminSyncDescription");
  backButtons.forEach((button) => {
    button.textContent = t("back");
  });
  setAuthMode(authMode);
  updateSignupPhotoPreview();
  updateProfilePhotoPreview();
  renderEvents();
  renderMyEvents();
  renderDetails();
}

function goHome(event) {
  if (event) event.preventDefault();
  if (!currentUser) {
    showLoginView();
    return;
  }
  showEventsView();
}

function setAuthMode(mode) {
  authMode = mode;
  const isSignup = mode === "signup";
  authTitle.textContent = isSignup ? t("signupUser") : t("loginUser");
  if (loginView.classList.contains("active") || !currentUser) {
    screenTitle.textContent = isSignup ? t("signupTitle") : t("userLogin");
    screenSubtitle.textContent = isSignup ? t("signupSubtitle") : t("loginAccess");
  }
  loginButton.classList.toggle("hidden", isSignup);
  signupButton.classList.toggle("hidden", !isSignup);
  signupFields.classList.toggle("hidden", !isSignup);
  forgotPasswordButton.classList.toggle("hidden", isSignup);
  showLoginButton.classList.toggle("active", !isSignup);
  showSignupButton.classList.toggle("active", isSignup);
  document.getElementById("login-identity-label").textContent = isSignup ? t("email") : t("emailOrUsername");
  document.getElementById("login-email").type = isSignup ? "email" : "text";
  document.getElementById("login-message").textContent = isSignup
    ? t("signupHint")
    : t("loginHint");
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

async function sendPasswordResetFromLogin(event) {
  if (event) event.preventDefault();

  const identity = document.getElementById("login-email").value.trim();
  const message = document.getElementById("login-message");

  if (!identity) {
    message.textContent = t("resetEmailNeeded");
    return;
  }

  if (!supabaseClient) {
    message.textContent = t("resetEmailLocal");
    return;
  }

  const email = await resolveLoginEmail(identity);
  if (!email) {
    message.textContent = t("missingUsername");
    return;
  }

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.href.split("#")[0]
  });

  message.textContent = error ? t("resetEmailFailed") : t("resetEmailSent");
}

function updateSignupPhotoPreview() {
  if (signupPhotoInput.files.length === 0) {
    signupPhotoPreview.classList.add("hidden");
    signupPhotoPreview.style.backgroundImage = "";
    signupPhotoStatus.textContent = t("signupPhotoRequired");
    return;
  }

  const imageUrl = URL.createObjectURL(signupPhotoInput.files[0]);
  signupPhotoPreview.style.backgroundImage = `url("${imageUrl}")`;
  signupPhotoPreview.classList.remove("hidden");
  signupPhotoStatus.textContent = t("signupPhotoLoaded");
}

function updateProfilePhotoPreview() {
  if (profilePhotoInput.files.length > 0) {
    const imageUrl = URL.createObjectURL(profilePhotoInput.files[0]);
    profilePhotoPreview.style.backgroundImage = `url("${imageUrl}")`;
    profilePhotoPreview.classList.remove("hidden");
    profilePhotoStatus.textContent = t("profilePhotoReady");
    return;
  }

  if (currentProfile?.face_photo_data) {
    profilePhotoPreview.style.backgroundImage = `url("${currentProfile.face_photo_data}")`;
    profilePhotoPreview.classList.remove("hidden");
    profilePhotoStatus.textContent = t("profilePhotoLoaded");
    return;
  }

  profilePhotoPreview.classList.add("hidden");
  profilePhotoPreview.style.backgroundImage = "";
  profilePhotoStatus.textContent = t("profilePhotoHint");
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
  closeUserMenu();

  hideAllViews();
  fillProfileForm();
  profileMessage.textContent = "";
  profileView.classList.add("active");
  screenTitle.textContent = t("profileScreen");
  screenSubtitle.textContent = t("profileSubtitle");
}

function showSettingsView(event) {
  if (event) event.preventDefault();
  if (!requireLogin()) return;
  closeUserMenu();

  hideAllViews();
  settingsView.classList.add("active");
  screenTitle.textContent = t("settingsTitle");
  screenSubtitle.textContent = t("settingsSubtitle");
}

function showSupportView(event) {
  if (event) event.preventDefault();
  if (!requireLogin()) return;
  closeUserMenu();

  hideAllViews();
  supportMessageStatus.textContent = "";
  passwordMessage.textContent = "";
  supportView.classList.add("active");
  screenTitle.textContent = t("supportTitle");
  screenSubtitle.textContent = t("supportSubtitle");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function cleanFileName(value) {
  return String(value || "face-photo.jpg").toLowerCase().replace(/[^a-z0-9._-]/g, "-");
}

async function saveFacePhoto(file, userId) {
  if (!file) return "";

  if (!supabaseClient) {
    return readFileAsDataUrl(file);
  }

  if (!userId) {
    throw new Error("Missing user id for Storage upload");
  }

  const extension = file.type === "image/png" ? "png" : "jpg";
  const fileName = `${Date.now()}-${cleanFileName(file.name || `face-photo.${extension}`)}`;
  const filePath = `${userId}/${fileName}`;
  const { error } = await supabaseClient.storage
    .from("face-photos")
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type || `image/${extension}`,
      upsert: true
    });

  if (error) {
    throw new Error(error.message || "Storage upload failed");
  }

  const { data } = supabaseClient.storage.from("face-photos").getPublicUrl(filePath);
  try {
    localStorage.setItem("securepresence_face_photo", data.publicUrl);
  } catch (error) {
    return data.publicUrl;
  }
  return data.publicUrl;
}

async function saveProfileToSupabase(userId, profile) {
  if (!supabaseClient || !userId) return null;

  const fullName = `${profile.first_name} ${profile.last_name}`.trim();
  const username = profile.username ? cleanUsername(profile.username) : null;
  const { error: metadataError } = await supabaseClient.auth.updateUser({
    data: {
      username,
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone,
      cnp: profile.cnp,
      face_photo_data: profile.face_photo_data,
      full_name: fullName
    }
  });

  if (metadataError) return metadataError;

  const { error } = await supabaseClient
    .from("profiles")
    .upsert({
      id: userId,
      email: profile.email,
      username,
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone,
      cnp: profile.cnp,
      face_photo_data: profile.face_photo_data,
      full_name: fullName
    }, {
      onConflict: "id"
    });

  if (error) return error;

  const { error: registrationsError } = await supabaseClient
    .from("registrations")
    .update({
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      phone: profile.phone,
      cnp: profile.cnp,
      face_photo_data: profile.face_photo_data
    })
    .eq("user_id", userId);

  return registrationsError;
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
    try {
      photoData = await saveFacePhoto(photoInput.files[0], currentUser.id);
    } catch (error) {
      profileMessage.textContent = t("photoUploadFailed");
      return;
    }
  }

  if (!firstName || !lastName || !phoneValue) {
    profileMessage.textContent = t("completeProfile");
    return;
  }

  const profile = {
    email: currentUser.email,
    username: currentProfile?.username || "",
    first_name: firstName,
    last_name: lastName,
    phone: phoneValue,
    cnp: cnpValue,
    face_photo_data: photoData
  };

  saveProfile(profile);
  updateUserHeader();
  profileMessage.textContent = t("profileSaved");

  if (supabaseClient && currentUser.id) {
    const error = await saveProfileToSupabase(currentUser.id, profile);

    if (error) {
      profileMessage.textContent = t("profileLocalSaved");
      return;
    }
  }

  await loadEvents();
  fillProfileForm();
}

async function loginUser(event) {
  if (event) event.preventDefault();

  const identity = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const message = document.getElementById("login-message");

  if (!identity || !password) {
    message.textContent = t("completeLogin");
    return;
  }

  if (supabaseClient) {
    try {
      const email = await resolveLoginEmail(identity);
      if (!email) {
        message.textContent = t("missingUsername");
        return;
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        message.textContent = t("loginFailed");
        return;
      }

      const metadata = data.user.user_metadata || {};
      saveUser({
        id: data.user.id,
        email: data.user.email
      });
      saveProfile({
        username: metadata.username || currentProfile?.username || "",
        first_name: metadata.first_name || currentProfile?.first_name || "",
        last_name: metadata.last_name || currentProfile?.last_name || "",
        phone: metadata.phone || currentProfile?.phone || "",
        cnp: currentProfile?.cnp || "",
        face_photo_data: currentProfile?.face_photo_data || localStorage.getItem("securepresence_face_photo") || "",
        email: data.user.email
      });

      await loadProfileFromSupabase();
      await loadEvents();
      await loadRegistrations();
    } catch (error) {
      message.textContent = t("loginFailed");
      return;
    }
  } else {
    saveUser({ email: identity });
    await loadRegistrations();
  }

  updateUserHeader();
  message.textContent = t("loggedIn");

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
    message.textContent = t("completeSignup");
    return;
  }

  if (password.length < 6) {
    message.textContent = t("shortPassword");
    return;
  }

  const profile = {
    email,
    username,
    first_name: firstName,
    last_name: lastName,
    phone: phoneValue,
    cnp: cnpValue,
    face_photo_data: ""
  };

  if (supabaseClient) {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          first_name: firstName,
          last_name: lastName,
          phone: phoneValue,
          full_name: `${firstName} ${lastName}`.trim()
        }
      }
    });

    if (error) {
      message.textContent = t("signupFailed");
      return;
    }

    saveUser({
      id: data.user?.id || email,
      email: data.user?.email || email
    });

    try {
      profile.face_photo_data = await saveFacePhoto(photoInput.files[0], data.user?.id);
    } catch (error) {
      message.textContent = t("photoUploadFailed");
      return;
    }

    if (data.user?.id) {
      profile.email = data.user.email || email;
      const profileError = await saveProfileToSupabase(data.user.id, profile);

      if (profileError) {
        message.textContent = t("profileSaveFailed");
        return;
      }
    }
  } else {
    saveUser({ email });
    profile.face_photo_data = await saveFacePhoto(photoInput.files[0], "");
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

async function sendSupportMessage(event) {
  if (event) event.preventDefault();
  if (!requireLogin()) return;

  const message = supportMessageInput.value.trim();
  if (!message) {
    supportMessageStatus.textContent = t("supportEmpty");
    return;
  }

  if (supabaseClient && currentUser.id) {
    const { error } = await supabaseClient.from("support_requests").insert({
      user_id: currentUser.id,
      email: currentUser.email,
      message,
      status: "open"
    });

    if (!error) {
      supportMessageInput.value = "";
      supportMessageStatus.textContent = t("supportSent");
      return;
    }
  }

  try {
    const saved = JSON.parse(localStorage.getItem("securepresence_support_messages") || "[]");
    saved.push({
      email: currentUser.email,
      message,
      created_at: new Date().toISOString()
    });
    localStorage.setItem("securepresence_support_messages", JSON.stringify(saved));
  } catch (error) {
    return;
  }

  supportMessageInput.value = "";
  supportMessageStatus.textContent = t("supportLocalSent");
}

async function changePassword(event) {
  if (event) event.preventDefault();
  if (!requireLogin()) return;

  if (supabaseClient) {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(currentUser.email, {
      redirectTo: window.location.href.split("#")[0]
    });

    if (error) {
      passwordMessage.textContent = t("passwordChangeFailed");
      return;
    }

    passwordMessage.textContent = t("passwordResetSent");
    return;
  }

  passwordMessage.textContent = t("passwordResetLocal");
}

function showEventsView(event) {
  if (event) event.preventDefault();
  if (!requireLogin()) return;

  hideAllViews();
  renderEvents();
  renderMyEvents();
  showAvailableEvents();
  eventsView.classList.add("active");
  screenTitle.textContent = t("eventsTitle");
  screenSubtitle.textContent = "";
}

function showDetailsView(event) {
  if (event) event.preventDefault();
  if (!requireLogin()) return;

  hideAllViews();
  renderDetails();
  detailsView.classList.add("active");
  screenTitle.textContent = t("detailsTitle");
  screenSubtitle.textContent = t("detailsSubtitle");
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
        ? `${t("alreadyRegisteredFor")} ${selectedEvent.name}`
        : t("registrationError");
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
  document.getElementById("saved-row").textContent = `${t("createdFor")} ${selectedEvent.name}`;
  showStatusView();
}

function showStatusView(event) {
  if (event) event.preventDefault();
  if (!requireLogin()) return;

  hideAllViews();
  statusView.classList.add("active");
  screenTitle.textContent = t("statusScreen");
  screenSubtitle.textContent = t("statusSubtitle");
  statusReturnTimer = setTimeout(function () {
    showEventsView();
  }, 5000);
}

showLoginButton.addEventListener("click", () => setAuthMode("login"));
showSignupButton.addEventListener("click", () => setAuthMode("signup"));
forgotPasswordButton.addEventListener("click", sendPasswordResetFromLogin);
takeSignupPhotoButton.addEventListener("click", () => signupPhotoInput.click());
signupPhotoInput.addEventListener("change", updateSignupPhotoPreview);
takeProfilePhotoButton.addEventListener("click", () => profilePhotoInput.click());
profilePhotoInput.addEventListener("change", updateProfilePhotoPreview);
availableEventsButton.addEventListener("click", showAvailableEvents);
myEventsButton.addEventListener("click", showMyEvents);
brandLockup.addEventListener("click", goHome);
backButtons.forEach((button) => button.addEventListener("click", goHome));
userAvatar.addEventListener("click", toggleUserMenu);
profileMenuButton.addEventListener("click", showProfileView);
settingsMenuButton.addEventListener("click", showSettingsView);
supportMenuButton.addEventListener("click", showSupportView);
darkModeButton.addEventListener("click", toggleDarkMode);
languageSelect.addEventListener("change", saveLanguage);
document.addEventListener("click", closeUserMenu);
userMenu.addEventListener("click", (event) => event.stopPropagation());
loginButton.addEventListener("click", loginUser);
signupButton.addEventListener("click", signupUser);
logoutButton.addEventListener("click", logoutUser);
saveProfileButton.addEventListener("click", saveProfileData);
sendSupportMessageButton.addEventListener("click", sendSupportMessage);
changePasswordButton.addEventListener("click", changePassword);
registerButton.addEventListener("click", showRegisterView);
submitButton.addEventListener("click", saveRegistration);

async function startApp() {
  loadSettings();
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
