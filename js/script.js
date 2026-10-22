// Varmistetaan, että DOM on latautunut ennen kuin js suoritetaan
document.addEventListener('DOMContentLoaded', () => {

    // Tallennetaan tarvittavat elementit muuttujiin
    const form = document.getElementById('bucket-form'); //Lomake unelmia varten
    const input = document.getElementById('item-input'); //Tekstikenttä unelmia varten
    const categorySelect = document.getElementById('category-select'); //Alasvetovalikko kategorialle
    const errorMessage = document.getElementById('error-message'); //Virheilmoituksen paikka

    loadFromLocalStorage(); // Ladataan tallennetut unelmat LocalStoragesta

    // Lomakkeen lähetyksen event listener
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        resetValidation();
        

        // Haetaan syötteen arvo ja valittu kategoria
        const textValue = input.value.trim();
        const selectedCategory = categorySelect.value;
        let isValid = true;

        // Tarkistetaan onko tekstikenttään kirjoitettu vähintään 3 merkkiä
        if (textValue.length < 3) {
            input.classList.add('invalid');
            errorMessage.textContent = 'Dream must be at least 3 characters long.';
            isValid = false;
        }

        // Tarkistetaan onko kategoria valittu
        if (!selectedCategory) {
            categorySelect.classList.add('invalid');
            if (!errorMessage.textContent) {
                errorMessage.textContent = 'Choose a category.';
            }
            isValid = false;
        }

        // Mikäli kaikki yllä ok, unelma lisätään listaan
        if (!isValid) return;

        addItemToList(textValue, selectedCategory, false);
        saveToLocalStorage();

        input.value = '';
        categorySelect.value = '';
    });

    // Funktio, joka lisää unelman listaan
    function addItemToList(text, categoryId, isCompleted = false) {
        const listUl = document.getElementById(categoryId); // Haetaan oikea kategoria-kortti 
        if (!listUl) return;

        const li = document.createElement('li'); // Luo uuden listaelementin

        // Luo checkbox-elementin toteutuneen unelman merkitsemistä varten
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'item-checkbox';
        checkbox.checked = isCompleted;

        if (isCompleted) {
            li.classList.add('completed');
        }

        // Havaitaan checkboxin klikkaus ja muutetaan ccs-luokka sen mukaan, lisäksi päivitetään kortilla oleva laskuri
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                li.classList.add('completed');
            } else {
                li.classList.remove('completed');
            }
            updateCounters();
            saveToLocalStorage();
        });

        // Luodaan elementti korttiin, johon kirjattu unelma sijoitetaan
        const span = document.createElement('span');
        span.className = 'item-text';
        span.textContent = text;

        // Luodaan div-elementti, jotta sisällön asettelu helpottuu
        const leftContainer = document.createElement('div');
        leftContainer.className = 'item-left';
        leftContainer.appendChild(checkbox);
        leftContainer.appendChild(span);

        // Luodaan poistonappi
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '✕';
        deleteBtn.className = 'delete-btn';
        deleteBtn.title = 'Delete dream';

        // Havaitaan poistonapin klikkaus ja poistetaan elementti listasta, päivitetään myös kortilla oleva laskuri
        deleteBtn.addEventListener('click', () => {
            li.remove();
            updateCounters();
            saveToLocalStorage();
        });

        // Lopuksi laitetaan kaikki tarvittavat elementit div-elementtiin
        li.appendChild(leftContainer);
        li.appendChild(deleteBtn);
        listUl.appendChild(li);

        updateCounters();
    }

    // Funktio, joka poistaa mahdollisesti näkyviin tulleen virheilmoituksen
    function resetValidation() {
        input.classList.remove('invalid');
        categorySelect.classList.remove('invalid');
        errorMessage.textContent = '';
    }

    // Unelmalaskuri
    function updateCounters() {
        const categories = ['cat-travel', 'cat-culture', 'cat-lifestyle']; //luodaan kategorioista lista

        categories.forEach(catId => { // Käydään jokainen kategoria läpi
            const listUl = document.getElementById(catId); // Haetaan oikea gatekoria-kortti
            if (!listUl) return;
            const totalItems = listUl.querySelectorAll('li').length; // Lasketaan kaikki listaelementit
            const completedItems = listUl.querySelectorAll('li.completed').length; // Lasketaan kaikki toteutuneeksi merkatut listaelementit
            const counterDiv = document.getElementById(`counter-${catId}`); // Etsitään laskuri-elementti, johon tulos sijoitetaan
            if (counterDiv) {
                counterDiv.textContent = ` ${completedItems} / ${totalItems}`; //Päivitetään laskurin sisältö
            }
        });
    }

    // Tallennetaan unelmat LocalStorageen
    function saveToLocalStorage() {

        // Käsiteltävät kategoriat
        const categories = ['cat-travel', 'cat-culture', 'cat-lifestyle'];

        // Käydään jokaisen kategorian ID läpi
        categories.forEach(catId => {
            const listUl = document.getElementById(catId); // haetaan oikea kategoria
            if (!listUl) return; // Palaa takaisin, jos kategoriaa ei löydy
            const items = listUl.querySelectorAll('li'); // Kerää löydetyt
            
            //Luodaan taulukot kerätyille tiedoille
            let texts = [];
            let states = [];

            // Käydään läpi kerätyty tiedot ja tsekataan onko klikattu toteutuneeksi vai ei
            items.forEach(li => {
                const text = li.querySelector('.item-text').textContent;
                const isChecked = li.querySelector('.item-checkbox').checked;
                texts.push(text);
                states.push(isChecked ? '1' : '0'); // '1' = ruksattu, '0' = ei ruksattu
            });

            // Tallennetaan merkkijonoina erotinmerkillä
            localStorage.setItem(catId + '_texts', texts.join('||'));
            localStorage.setItem(catId + '_states', states.join('||'));
        });
    }

    // Hakee tallennetut tiedot
    function loadFromLocalStorage() {
        const categories = ['cat-travel', 'cat-culture', 'cat-lifestyle'];

        // Käydään jokaisen kategorian ID läpi
        categories.forEach(catId => {
            const savedTexts = localStorage.getItem(catId + '_texts');
            const savedStates = localStorage.getItem(catId + '_states');

            // Muutetaan merkkijonot takaisin taulukoiksi ja lisätään ne listaan
            if (savedTexts) {
                const texts = savedTexts.split('||');
                const states = savedStates ? savedStates.split('||') : [];

                for (let i = 0; i < texts.length; i++) {
                    if (texts[i].trim() !== "") { // Tarkistetaan, ettei rivi ole tyhjä
                        const isCompleted = (states[i] === '1'); // Tarkistetaan onko toteutunut vai ei
                        addItemToList(texts[i], catId, isCompleted); // Lisätään tallennettu unelma kortille
                    }
                }
            }
        });
    }
});