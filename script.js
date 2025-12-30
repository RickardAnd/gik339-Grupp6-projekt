//Projekt Dynamiska Webbapplikationer Grupp 6
const textfields = document.getElementsByName('textfield')
const submit = document.getElementById('submit');
const clear = document.getElementById('clear');

clear.addEventListener('click', (e) => {

for (let i = 0; i < textfields.length; i++) {
    textfields[i].value = '';
}
})