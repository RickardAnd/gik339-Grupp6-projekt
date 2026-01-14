// Projekt Dynamiska Webbapplikationer Grupp 6
const textfields = document.getElementsByName("textfield");
const submit = document.getElementById("submit");
const clear = document.getElementById("clear");
const trainIdInput = document.getElementById("trainId");

// Funktion för att visa modalen
function showFeedback(message) {
    const modalElement = document.getElementById('feedbackModal');
    const modalMessage = document.getElementById('modalMessage');

    if (modalElement && modalMessage) {
        modalMessage.textContent = message;
        // Skapar en ny Bootstrap-instans varje gång för att säkerställa att den öppnas
        const bsModal = new bootstrap.Modal(modalElement);
        bsModal.show();
    } else {
        console.error("Kunde inte hitta modal-elementen i HTML.");
    }
}

/* Eventlyssnare för att rensa fält */
clear.addEventListener("click", () => {
    for (let i = 0; i < textfields.length; i++) {
        textfields[i].value = "";
    }
    document.getElementById("status").value = "";
    trainIdInput.value = ""; // Nolla dolda ID:t
    submit.innerText = "Spara tåg";
    submit.classList.replace("btn-warning", "btn-primary");
});

/* Hämta tåglista från databas */
async function fetchTrainTable() {
    try {
        const response = await fetch("http://localhost:3000/trainTable");
        const trains = await response.json();

        const trainList = document.getElementById("trainList");
        trainList.innerHTML = "";

        trains.forEach(train => {
            let badgeClass, badgeText, normalText;
            switch (train.status) {
                case "on_time":
                    badgeClass = "bg-success";
                    badgeText = "I tid";
                    normalText = "text-white";
                    break;
                case "delayed":
                    badgeClass = "bg-warning text-dark";
                    badgeText = "Försenad";
                    normalText = "text-white";
                    break;
                case "cancelled":
                    badgeClass = "bg-danger";
                    badgeText = "Inställd";
                    normalText = "text-danger";
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
                <td><span class="badge ${badgeClass}">${badgeText}</span></td>
                <td class="text-end pe-2">
        <button class="btn btn-sm btn-secondary me-1" onclick="editTrain(${train.id})">
        <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-secondary" onclick="deleteTrain(${train.id}, '${train.trainnr}')">
        <i class="bi bi-trash"></i>
        </button>
                </td>`;
            trainList.appendChild(row);
        });
    } catch (err) {
        console.error("Kunde inte hämta tåg:", err);
    }
}

/* Tog lite hjälp av Gemini då det blev svårt att "kombinera" spara och uppdatera i samma eventlyssnare. 
Jag fick inte till det så frågade hur man kan göra och fick ett bra svar som jag anpassade lite för att passa in i vår kodbas. */

/* Spara eller Uppdatera tåg */
submit.addEventListener("click", async () => {

    const id = trainIdInput.value; // Kolla om vi har ett ID (för PUT)
    const trainData = {
        trainnr: document.getElementById("trainnr").value,
        destination: document.getElementById("destination").value,
        time: document.getElementById("time").value,
        track: document.getElementById("track").value,
        status: document.getElementById("status").value
    };

        // Validering till användaren om något fält är tomt
if (!trainData.trainnr || !trainData.destination || !trainData.time || !trainData.track || !trainData.status) {
        showFeedback("Vänligen fyll i alla fält (Tågnummer, Destination, Tid, Spår och Status).");
        return; // stoppar så tåget inte läggs in
    }

    // Välj metod baserat på om ID finns
    const method = id ? "PUT" : "POST";
    const url = id ? `http://localhost:3000/trainTable/${id}` : "http://localhost:3000/trainTable";

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(trainData)
        });

        if (response.ok) {
            // Visa modal-feedback
            const msg = id ? `Tåg ${trainData.trainnr} har uppdaterats!` : `Tåg ${trainData.trainnr} har sparats!`;
            showFeedback(msg);

            clear.click(); // Rensa formulär och återställ knapp
            fetchTrainTable(); // Uppdatera listan
        }
    } catch (error) {
        showFeedback("Ett fel uppstod vid kommunikation med servern.");
    }
});

/* Funktion för att ladda data i formuläret för ändring */
async function editTrain(id) {
    const response = await fetch("http://localhost:3000/trainTable");
    const trains = await response.json();
    const train = trains.find(t => t.id === id);

    if (train) {
        trainIdInput.value = train.id; // Sätt dolda ID-fältet
        document.getElementById("trainnr").value = train.trainnr;
        document.getElementById("destination").value = train.destination;
        document.getElementById("time").value = train.time;
        document.getElementById("track").value = train.track;
        document.getElementById("status").value = train.status;

        submit.innerText = "Uppdatera tåg";
        submit.classList.replace("btn-primary", "btn-warning");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/* Funktion för att ta bort tåg med feedback */
async function deleteTrain(id, nr) {
    if (confirm(`Är du säker på att du vill ta bort tåg ${nr}?`)) {
        try {
            const response = await fetch(`http://localhost:3000/trainTable/${id}`, { method: "DELETE" });
            if (response.ok) {
                showFeedback(`Tåg ${nr} har tagits bort.`);
                fetchTrainTable();
            }
        } catch (error) {
            showFeedback("Kunde inte ta bort tåget.");
        }
    }
}

document.addEventListener('DOMContentLoaded', fetchTrainTable);