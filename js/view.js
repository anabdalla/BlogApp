/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";
const footer = {
    render(user) {  // bekommt Element vom Typ "blogger#user"
        console.log("View: render von footer");
        presenter.owner = user.displayName;
        // Klonen des Template-Knotens (und aller Kinder) für die Seite
        let page = document.getElementById('footer_angemeldet').cloneNode(true);
        // Entfernen des Id-Attributs (keine Dopplungen!)
        page.removeAttribute("id");
        // im Footer müssen Daten für %userName und %userAddress eingesetzt werden
        let cont = page.innerHTML;
        cont = cont.replace("%userName", user.displayName).replace("%userAddress", user.url); // keine RegExp Flags nötig, wir wissen dass die Platzhalter nur einmal vorkommen
        page.innerHTML = cont;
        return page;
    }
};

const header = {// TODO
    render(blogs) { // bekommt Array mit Elementen vom Typ Blog
        console.log("View: render von header");
        // Klonen des Template-Knotens (und aller Kinder) für die Seite
        let page = document.getElementById('header_angemeldet').cloneNode(true);
        page.removeAttribute("id");
        // die List mit den abonnierten Blogs erstellen
        // dazu erstes ul-Element bearbeiten
        let ul = page.querySelector("ul");
        let liTempl = ul.firstElementChild;
        // Template-Daten entfernen
        liTempl.remove();
        // Erstellen eines li-Elements für jeden Blog
        for (let b of blogs) {
            let li = liTempl.cloneNode(true);
            // in ul einfügen
            ul.appendChild(li);
            // %blogName und %postCount ersetzen
            helper.setDataInfo(ul, b);
        }
        
        // nun die Infos des zuletzt aktualisierten Blogs in zweite ul einsetzen
        let latestChange = blogs[0]; // den zuletzt aktualisierten Blog finden
        for (let b of blogs) { // dazu müssen die Blogs verglichen werden
            if (b.lastChange < latestChange.lastChange) { // prüfen, ob Aktualisierung jünger als die des bisher gespeicherten Blogs ist
                latestChange = b; // wenn ja, den aktuelleren Blog in Variable speichern
            }
        }
        // TODO geht noch nicht
        presenter.blogId = latestChange.id;
        // zweites ul Element finden
        let sec = page.querySelector("section").cloneNode(true);
        let ul = sec.firstElementChild;
        // Daten des Blogs in der ul innerhalb der section einsetzen
        helper.setDataInfo(ul, latestChange);
        
        
        // jetzt den %userName einsetzen
        let cont = page.innerHTML;
        cont = cont.replace("%userName", presenter.owner);

        page.innerHTML = cont;
        return page;
    }
};

const overView = {

    render(data) {

        // Lokaler Event Handler für Aktion Delete
        function handleDelete(event) {
            let source = event.target.closest('LI');
            if (source) {
                let action = source.dataset.action;
                // Bei action delete und bestätigter Rückfrage 
                if (action === "delete" && confirm(`Wollen Sie die Person wirklich löschen?`)) {
                    // Löschen der Person aus dem DOM
                    let person = source.parentElement.closest('LI');
                    person.remove();
                    let id = source.dataset.id;
                    // Aufruf der zugehörigen Presenter-Methode
                    presenter[action](id);
                }
            }
        }

        console.log("View: render von overView");
        // Klonen des Template-Knotens für die Seite
        let page = document.getElementById('overview').cloneNode(true);
        // Entfernen des Id-Attributs (keine Doubletten!)
        page.removeAttribute("id");
        let ul = page.querySelector("ul");
        let liTempl = ul.firstElementChild;
        // Erstellen der Buttons und Einsetzen in Template
        helper.setNavButtons(liTempl);
        // Template für LIs aus Clone entfernen
        liTempl.remove();
        // Erstellen eines li-Elements für jedes Produkt
        for (let p of data) {
            // Klonen des Template-Knotens für das Listenelement
            let li = liTempl.cloneNode(true);
            // Einhängen in ul
            ul.appendChild(li);
            // Ersetzen der Platzhalter in ul
            helper.setDataInfo(ul, p);
        }
        // Setzen des lokalen Event-Handlers
        page.addEventListener("click", handleDelete);
        return page;
    }
};

const detailView = {

    render(data) {
        // Lokaler Event Handler für Aktion Delete
        function handleDelete(event) {
            let source = event.target.closest('LI');
            if (source) {
                let action = source.dataset.action;
                if (action === "delete" && confirm(`Wollen Sie die Person wirklich löschen?`)) {
                    let id = source.dataset.id;
                    // Aufruf der zugehörigen Presenter-Methode
                    presenter[action](id);
                }
            }
        }

        console.log("View: render von detailView");
        // Klonen des Template-Knotens für die Seite
        let page = document.getElementById('detail').cloneNode(true);
        // Erstellen der Buttons und Einsetzen in Template
        helper.setNavButtons(page)
        // Entfernen des Id-Attributs (keine Doubletten!)
        page.removeAttribute("id");
        //Einsetzen der Attributwerte
        helper.setDataInfo(page, data);
        // Eventhandler wird für die Seite gesetzt (Delegation)
        page.addEventListener("click", handleDelete);
        return page;
    }
};

// Formular fuer das Editieren und Anlegen eines neuen Person-Objekts
const editView = {

    render(options, data) {

        let handleSave = function (event) {
            event.preventDefault();
            let action = event.target.dataset.action;
            if (action === "save" && confirm(`Wollen Sie die Änderungen wirklich speichern?`)) {
                let person = new Mitarbeiter(form.id, form.name.value, form.birth.value, form.job.value, form.email.value);
                presenter[action](person);
            }
        };

        console.log("View: render von editView");
        // Klonen des Template-Knotens für die Seite
        let div = document.getElementById("edit").cloneNode(true);
        // Entfernen des Id-Attributs (keine Doubletten!)
        div.removeAttribute('id');
        // Fuellen des Templates mit den Objektdaten
        helper.setDataInfo(div, data);
        let form = div.querySelector("form");
        // Datum lässt sich nicht über Platzhalter setzen
        form.birth.value = data.date_of_birth;
        // Setzen der Optionen in der datalist
        let list = form.querySelector("datalist");
        helper.setOptions(list, options);
        // Eventhandler wird für die Seite gesetzt (Delegation)
        div.addEventListener("click", handleSave);
        return div;
    }

};

// helper enthält Methoden, die in mehreren Views benötigt werden.
const helper = {
    // Ersetzt alle %bezeichner Texte in element durch die 
    // gleichnamigen Attributwerte des Objekts
    setDataInfo(element, object) {
        let cont = element.innerHTML;
        for (let key in object) {
            let rexp = new RegExp("%" + key, "g");
            cont = cont.replace(rexp, object[key]);
        }
        element.innerHTML = cont;
    },

    setNavButtons(templ) {
        // Klonen des Button-Komponententemplate
        let buttons = document.getElementById("buttons").cloneNode(true);
        buttons.removeAttribute("id");
        // Buttons in Navigation einsetzen
        let nav = templ.querySelector("nav");
        nav.append(buttons);
    },

    // Setzt bei einer Auswahlliste die Optionen aus options
    setOptions(list, options) {
        for (let o of options) {
            let opt = new Option(o, o);
            list.append(opt);
        }
    }
};

