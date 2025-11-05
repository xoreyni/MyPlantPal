document.addEventListener("DOMContentLoaded", () => {
  const addPlantBtn = document.getElementById("addPlantBtn");
  const plantList = document.getElementById("plantList");
  const premiumBtn = document.getElementById("upgradeBtn");

  // load state
  let plants = JSON.parse(localStorage.getItem("plants")) || [];
  let isPremium = localStorage.getItem("premium") === "true";

  function savePlants() {
    localStorage.setItem("plants", JSON.stringify(plants));
  }

  // render all cards
  function renderPlants() {
    plantList.innerHTML = "";
    plants.forEach((plant, index) => {
      const card = document.createElement("div");
      card.className = "plant-card";

      // image
      const img = document.createElement("img");
      img.src = plant.image || "https://via.placeholder.com/250x180.png?text=Plant";
      img.className = "plant-img";
      card.appendChild(img);

      // name
      const name = document.createElement("h3");
      name.textContent = plant.name;
      card.appendChild(name);

      // next watering display
      const info = document.createElement("p");
      if (plant.nextWatering) {
        const next = new Date(plant.nextWatering);
        const daysLeft = Math.max(0, Math.round((next - Date.now()) / (1000 * 60 * 60 * 24)));
        info.innerHTML = `Next watering in: <strong>${daysLeft} day(s)</strong><br><small>${next.toLocaleString()}</small>`;
      } else {
        info.innerHTML = `Next watering: <strong>Not set</strong>`;
      }
      card.appendChild(info);

      // buttons container
      const buttonsDiv = document.createElement("div");
      buttonsDiv.className = "card-buttons";

      // Water button
      const waterBtn = document.createElement("button");
      waterBtn.className = "water-btn";
      // initial state depends on whether plant.justWatered is true and nextWatering exists and future
      const now = Date.now();
      const nextDate = plant.nextWatering ? new Date(plant.nextWatering) : null;
      const isDue = nextDate ? (nextDate - now) <= 0 : false;

      if (plant.justWatered) {
        waterBtn.textContent = "✅ Watered";
        waterBtn.classList.add("watered");
        waterBtn.disabled = true;
      } else {
        waterBtn.textContent = "💧 Water Plant";
        waterBtn.disabled = false;
      }

      waterBtn.addEventListener("click", () => {
        // mark watered now
        plant.lastWatered = new Date().toISOString();
        const next = new Date();
        next.setDate(next.getDate() + Number(plant.schedule));
        plant.nextWatering = next.toISOString();
        plant.justWatered = true; // show Watered state
        savePlants();
        renderPlants();
      });
      buttonsDiv.appendChild(waterBtn);

      // Calendar button (opens Google Calendar). Only works when nextWatering exists.
      const calendarBtn = document.createElement("button");
      calendarBtn.className = "calendar-btn";
      calendarBtn.textContent = "📅 Add to Calendar";
      calendarBtn.addEventListener("click", () => {
        if (!plant.nextWatering) {
          alert("Please press 'Water Plant' first to schedule the next watering and enable calendar export.");
          return;
        }
        const wateringDate = new Date(plant.nextWatering);
        // create RFC-ish format for Google Calendar: YYYYMMDDTHHMMSSZ
        function toGCal(d) {
          return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        }
        const start = toGCal(wateringDate);
        const end = toGCal(new Date(wateringDate.getTime() + 60 * 60 * 1000)); // 1 hour
        const title = encodeURIComponent(`Water ${plant.name}`);
        const details = encodeURIComponent("MyPlantPal reminder: time to water your plant 🌿");
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
        window.open(url, "_blank");
      });
      buttonsDiv.appendChild(calendarBtn);

      // Health check button
const healthBtn = document.createElement("button");
healthBtn.className = "health-btn";
healthBtn.textContent = "🩺 Check Health";

// each plant keeps a fixed healthState (generated once)
if (!plant.healthState) {
  const rand = Math.random();
  if (rand > 0.8) plant.healthState = "pest";
  else if (rand > 0.6) plant.healthState = "light";
  else if (rand > 0.4) plant.healthState = "dry";
  else if (rand > 0.2) plant.healthState = "nutrients";
  else plant.healthState = "healthy";
  savePlants();
}

healthBtn.addEventListener("click", () => {
  let message = "";
  switch (plant.healthState) {
    case "pest":
      message = "⚠️ Pest warning — check leaves for small bugs.";
      break;
    case "light":
      message = "🌤 Needs more sunlight!";
      break;
    case "dry":
      message = "💧 Soil looks dry — water soon!";
      break;
    case "nutrients":
      message = "🌱 Needs fertilizer — consider repotting.";
      break;
    default:
      message = "🌿 Looks healthy!";
  }
  alert(`${plant.name}: ${message}`);
});
buttonsDiv.appendChild(healthBtn);

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "🗑️ Delete";
      deleteBtn.addEventListener("click", () => {
        if (!confirm(`Delete ${plant.name}?`)) return;
        plants.splice(index, 1);
        savePlants();
        renderPlants();
      });
      buttonsDiv.appendChild(deleteBtn);

      card.appendChild(buttonsDiv);
      plantList.appendChild(card);
    });

    // add plant handler
addPlantBtn.addEventListener("click", () => {

  // ✅ 1. Premium limit check first
  if (!isPremium && plants.length >= 3) {
    const upgrade = confirm(
      "🌿 Free version allows up to 3 plants.\nUpgrade to Premium (€4.99) for unlimited plants?"
    );
    if (upgrade) {
      window.open("https://buy.stripe.com/4gM8wOfEn2pjfUXgZ95J600", "_blank");
    }
    return; // stop here — don’t add a plant
  }

  // ✅ 2. Normal plant creation logic
  const nameEl = document.getElementById("plantName");
  const scheduleEl = document.getElementById("wateringSchedule");
  const imageEl = document.getElementById("plantImage");

  const name = nameEl.value.trim();
  const schedule = parseInt(scheduleEl.value, 10);

  if (!name) {
    alert("Please enter a plant name 🌿");
    return;
  }

  const file = imageEl.files[0];
  ...

    const file = imageEl.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const p = {
          id: Date.now(),
          name,
          schedule,
          image: e.target.result,
          lastWatered: null,
          nextWatering: null,
          justWatered: false
        };
        plants.push(p);
        savePlants();
        renderPlants();
      };
      reader.readAsDataURL(file);
    } else {
      const p = {
        id: Date.now(),
        name,
        schedule,
        image: "https://via.placeholder.com/250x180.png?text=Plant",
        lastWatered: null,
        nextWatering: null,
        justWatered: false
      };
      plants.push(p);
      savePlants();
      renderPlants();
    }

    // clear inputs
    nameEl.value = "";
    imageEl.value = "";
  });

  // premium button behavior (redirect to Stripe)
premiumBtn.textContent = "Upgrade to Premium (€4.99)";
premiumBtn.addEventListener("click", () => {
  window.open("https://buy.stripe.com/4gM8wOfEn2pjfUXgZ95J600", "_blank");
});

  // keep 'watered' state cleared when nextWatering passes
  setInterval(() => {
    let changed = false;
    const now = Date.now();
    plants.forEach((p) => {
      if (p.nextWatering) {
        const next = new Date(p.nextWatering).getTime();
        if (next <= now && p.justWatered) {
          // reset justWatered when next watering is due (so button can be pressed again when needed)
          p.justWatered = false;
          changed = true;
        }
      }
    });
    if (changed) {
      savePlants();
      renderPlants();
    }
  }, 60 * 1000); // check every minute

  // initial render
  renderPlants();
});
