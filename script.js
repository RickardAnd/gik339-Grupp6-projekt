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
      case "I-tid":
        badgeClass = "bg-success";
        badgeText = "I tid";
        normalText = "text-white"
        break;
      case "Försenad":
        badgeClass = "bg-warning";
        badgeText = "Försenad";
        normalText = "text-white"
        break;
      case "Inställd":
        badgeClass = "bg-danger";
        badgeText = "Inställd";
        normalText = "text-danger"
        break;
        default: 
        badgeClass = 'bg-secondary';
        badgeText = train.status;
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
