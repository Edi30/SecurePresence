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
const events = exportedEvents.length > 0 ? exportedEvents : defaultEvents;
let selectedEvent = events.find((event) => event.id === privateEventId) || events[0];

const eventsView = document.getElementById("events-view");
const detailsView = document.getElementById("details-view");
const registerView = document.getElementById("register-view");
const statusView = document.getElementById("status-view");
const screenTitle = document.getElementById("screen-title");
const screenSubtitle = document.getElementById("screen-subtitle");
const eventsTab = document.getElementById("events-tab");
const registerTab = document.getElementById("register-tab");
const statusTab = document.getElementById("status-tab");
const registerButton = document.querySelector(".details-view .primary-button");
const submitButton = document.querySelector(".submit-button");
let temporaryRegistrations = [];

function eventDateLine(event) {
  return `${event.date} - ${event.time}<br>${event.location}`;
}

function createEventCard(event) {
  const card = document.createElement("article");
  card.className = event.id === selectedEvent.id ? "event-card featured" : "event-card";

  card.innerHTML = `
    <h3>${event.name}</h3>
    <p class="event-meta">${event.date} - ${event.location}</p>
    <div class="event-footer">
      <span class="status">${event.status}</span>
      <span class="registered-count">${event.registered} inscrisi</span>
    </div>
  `;

  card.addEventListener("click", function () {
    selectedEvent = event;
    showDetailsView();
  });

  return card;
}

function renderEvents() {
  const list = document.getElementById("events-list");
  list.innerHTML = "";

  for (const event of events) {
    list.appendChild(createEventCard(event));
  }
}

function renderDetails() {
  document.getElementById("details-status").textContent = selectedEvent.private ? "Private registration" : "Open registrations";
  document.getElementById("details-name").textContent = selectedEvent.name;
  document.getElementById("details-date").innerHTML = eventDateLine(selectedEvent);
  document.getElementById("details-description").textContent = selectedEvent.description;
  document.getElementById("details-total").textContent = selectedEvent.total;
  document.getElementById("details-registered").textContent = selectedEvent.registered;
  document.getElementById("details-available").textContent = selectedEvent.available;
}

function hideAllViews() {
  eventsView.classList.remove("active");
  detailsView.classList.remove("active");
  registerView.classList.remove("active");
  statusView.classList.remove("active");
  eventsTab.classList.remove("active");
  registerTab.classList.remove("active");
  statusTab.classList.remove("active");
}

function showEventsView(event) {
  if (event) event.preventDefault();

  hideAllViews();
  renderEvents();
  eventsView.classList.add("active");
  screenTitle.textContent = "Evenimente disponibile";
  screenSubtitle.textContent = "Date citite din aplicatia admin";
  eventsTab.classList.add("active");
}

function showDetailsView(event) {
  if (event) event.preventDefault();

  hideAllViews();
  renderDetails();
  detailsView.classList.add("active");
  screenTitle.textContent = "Detalii eveniment";
  screenSubtitle.textContent = "Event selectat din baza aplicatiei";
  eventsTab.classList.add("active");
}

function showRegisterView(event) {
  if (event) event.preventDefault();

  hideAllViews();
  registerView.classList.add("active");
  screenTitle.textContent = "Formular inscriere";
  screenSubtitle.textContent = "Date pregatite pentru registrations";
  registerTab.classList.add("active");
}

function saveRegistration(event) {
  if (event) event.preventDefault();

  const registration = {
    event_id: selectedEvent.id,
    event_name: selectedEvent.name,
    first_name: document.getElementById("first-name").value,
    last_name: document.getElementById("last-name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    cnp: document.getElementById("cnp").value,
    synced_to_admin: false,
    created_at: new Date().toISOString()
  };

  try {
    const saved = JSON.parse(localStorage.getItem("securepresence_registrations") || "[]");
    saved.push(registration);
    localStorage.setItem("securepresence_registrations", JSON.stringify(saved));
  } catch (error) {
    temporaryRegistrations.push(registration);
  }

  document.getElementById("saved-row").textContent = `registrations: rand nou creat pentru ${selectedEvent.name}`;
  showStatusView();
}

function showStatusView(event) {
  if (event) event.preventDefault();

  hideAllViews();
  statusView.classList.add("active");
  screenTitle.textContent = "Inscriere trimisa";
  screenSubtitle.textContent = "Confirmare locala";
  statusTab.classList.add("active");
}

eventsTab.addEventListener("click", showEventsView);
registerTab.addEventListener("click", showRegisterView);
statusTab.addEventListener("click", showStatusView);
registerButton.addEventListener("click", showRegisterView);
submitButton.addEventListener("click", saveRegistration);

if (privateEventId) {
  showDetailsView();
} else {
  showEventsView();
}
