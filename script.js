//Projekt Dynamiska Webbapplikationer Grupp 6
const textfields = document.getElementsByName("textfield");
const submit = document.getElementById("submit");
const clear = document.getElementById("clear");

/*Eventlyssnare för att ta bort innehåll i fält */
clear.addEventListener("click", (e) => {
  for (let i = 0; i < textfields.length; i++) {
    textfields[i].value = "";
  }
});

/*Hämta tåglista från databas*/
async function fetchTrainTable() {
  const response = await fetch("http://localhost:3000/trainTable");
  const trains = await response.json();

  const trainList = document.getElementById("trainList");
  trainList.innerHTML = "";

  trains.forEach(train => {
    let badgeClass, badgeText, normalText;
switch (train.status) {
    case "on_time":
    // case "I-tid":      Behövs inte längre då vi bara sparar "on_time" i databasen.
        badgeClass = "bg-success";
        badgeText = "I tid";
        normalText = "text-white";
        break;
    case "delayed":
    // case "Försenad":    Behövs inte längre då vi bara sparar "delayed" i databasen.
        badgeClass = "bg-warning text-dark";
        badgeText = "Försenad";
        normalText = "text-white";
        break;
    case "cancelled":
    // case "Inställd":   Behövs inte längre då vi bara sparar "cancelled" i databasen.
        badgeClass = "bg-danger";
        badgeText = "Inställd";
        normalText = "text-danger text-decoration-line-through"; // Lägg till genomstruken text för inställda tåg
        break;
    default: 
        badgeClass = 'bg-secondary';
        badgeText = train.status;
        normalText = "text-white";
}

    const row = document.createElement("tr");
    row.innerHTML = `
        <td><span class="${normalText}">${train.trainnr}</span></td>
        <td><span class="${normalText}">${train.destination}</span></td>
        <td><span class="${normalText}">${train.time}</span></td>
        <td><span class="${normalText}">${train.track}</span></td>
        <td>
            <span class="badge ${badgeClass}">${badgeText}</span>
        </td>
        <td>
            <button class="btn btn-sm btn-primary me-1" onclick="editTrain(${train.id})">Ändra</button>
            <button class="btn btn-sm btn-danger" onclick="deleteTrain(${train.id})">Ta bort</button>
        </td>`;
    trainList.appendChild(row);
  });
};

/*Lyssnare för att hämta tåglista från databas*/
document.addEventListener('DOMContentLoaded', function() {
    fetchTrainTable();
})

// Hjälpfunktion för att visa modalen
function showFeedback(message) {
    const modalElement = document.getElementById('feedbackModal');
    const modalMessage = document.getElementById('modalMessage');
    const bsModal = new bootstrap.Modal(modalElement);
    
    modalMessage.textContent = message;
    bsModal.show();
}

// Eventlyssnare för Spara-knappen
submit.addEventListener("click", async () => {
    const id = document.getElementById("trainId").value;
    const trainData = {
        trainnr: document.getElementById("trainnr").value,
        destination: document.getElementById("destination").value,
        time: document.getElementById("time").value,
        track: document.getElementById("track").value,
        status: document.getElementById("status").value
    };

    // Avgör om vi ska köra POST (nytt) eller PUT (uppdatera)
    const url = id ? `http://localhost:3000/trainTable/${id}` : "http://localhost:3000/trainTable";
    const method = id ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(trainData)
        });

        if (response.ok) {
            showModal(
                id ? "Tåg uppdaterat!" : "Tåg sparat!", 
                `Tåg ${trainData.trainnr} har ${id ? 'ändrats' : 'lagts till'}.`
            );
            
            // Återställ formuläret och ID-fältet
            document.getElementById("trainId").value = "";
            submit.innerText = "Spara tåg";
            submit.classList.replace("btn-warning", "btn-primary");
            clear.click(); 
            fetchTrainTable();
        }
    } catch (error) {
        showModal("Fel", "Kunde inte spara ändringarna.");
    }
});

// Funktion för att ta bort (anropas från knappen i tabellen)
async function deleteTrain(id) {
    if (confirm("Är du säker på att du vill ta bort tåget?")) {
        const response = await fetch(`http://localhost:3000/trainTable/${id}`, {
            method: "DELETE"
        });
        
        if (response.ok) {
            showFeedback("Tåget har tagits bort från systemet.");
            fetchTrainTable();
        }
    }
}

// Uppdatera tåg
// Funktion för att hämta ner data till formuläret
async function editTrain(id) {
    // Hämta hela listan (eller skapa en rutt för att hämta specifikt tåg)
    const response = await fetch("http://localhost:3000/trainTable");
    const trains = await response.json();
    const train = trains.find(t => t.id === id);

    if (train) {
        // Fyll i formuläret
        document.getElementById("trainId").value = train.id;
        document.getElementById("trainnr").value = train.trainnr;
        document.getElementById("destination").value = train.destination;
        document.getElementById("time").value = train.time;
        document.getElementById("track").value = train.track;
        document.getElementById("status").value = train.status;

        // Byt text på spara-knappen för tydlighet
        submit.innerText = "Uppdatera tåg";
        submit.classList.replace("btn-primary", "btn-warning");
        
        // Scrolla upp till formuläret så användaren ser att något hänt
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
