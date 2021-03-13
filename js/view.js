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
        cont = cont.replace("%userName", user.displayName).replace("%userAddress", user.url).replace("%userAddress", user.url); // keine RegExp Flags nötig, wir wissen dass die Platzhalter nur einmal vorkommen
        page.innerHTML = cont;
        return page;
    }
};

const header = {
    // render-Methode liefert das befüllte Header-Template zurück
    // ABER die BlogInfo des aktuellen Blogs fehlt noch!
    render(blogs, blog) { // bekommt Array mit Elementen vom Typ Blog und dem Blog für die BlogInfo
        console.log("View: render von header");
        // Klonen des Template-Knotens (und aller Kinder) für die Seite
        let page = document.getElementById('header_angemeldet').cloneNode(true);
        page.removeAttribute("id");
        // die List mit den abonnierten Blogs erstellen
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
        // BlogInfo in die ul einsetzen
        let cont = page.innerHTML;
        // TODO geht noch nicht - zuerst die Kurzfassung der Daten einsetzen
        //blog.setFormatDates(blog.lastChange);
        //cont = cont.replace("%lastChange", blog.shortDate);
        //blog.setFormatDates(blog.releaseDate);
        //cont = cont.replace("%releaseDate", blog.shortDate);
        // restliche Infos einsetzen
        helper.setDataInfo(page, blog);
        //  %userName einsetzen
        cont = page.innerHTML;
        cont = cont.replace("%userName", presenter.owner);  // hakt noch
        page.innerHTML = cont;
        return page;
    }
};

const blogOverview = {
    render (blog, posts) {
        // Lokaler Event Handler für Aktion Delete
        function handleDelete(event) {
            let source = event.target.closest('LI');
            if (source) {
                let action = source.dataset.action;
                // Bei action delete und bestätigter Rückfrage 
                if (action === "delete" && confirm(`Wollen Sie den Post wirklich löschen?`)) {
                    // Löschen des Posts aus dem DOM
                    let post = source.parentElement.closest('LI');
                    post.remove();
                    let pid = source.dataset.id;
                    let bid = source.dataset.bid;
                    // Aufruf der zugehörigen Presenter-Methode
                    presenter[action](bid, pid);
                }
            }
        }
        
        // TODO Editor
        console.log("View: render von blogOverview");
        let page = document.getElementById('Blog-Übersicht').cloneNode(true);
        page.removeAttribute("id");
        // Blognamen einsetzen
        let cont = page.innerHTML;
        cont = cont.replace("%blogName", blog.blogName);
        page.innerHTML = cont;
        // die Liste mit den Posts erstellen
        let ul = page.querySelector("ul");
        let liTempl = ul.firstElementChild;
        helper.setNavButtons(liTempl);
        liTempl.remove();   // Template aus Clone entfernen
        for (let p of posts) {
            let li = liTempl.cloneNode(true);
            ul.appendChild(li);
            helper.setDataInfo(ul, p);
        }
     // TODO lokalen Eventhandler setzen
     page.addEventListener("click", handleDelete);
     return page;
    }
};
// TODO
const detailView = {
    // bekommt den Post übergeben
    // nur zum ausprobieren
    render (post) {
        console.log("View: render von detailView");
        presenter.postId=post.id;
        let page = document.getElementById("Detailansicht").cloneNode(true);
        page.removeAttribute("id");
        // Postinfos einsetzen
        let postInfo = document.getElementById("post").cloneNode(true);
        postInfo.removeAttribute("id");
        helper.setDataInfo(postInfo, post);
        helper.setNavButtons(postInfo);
        return page;
        
        // TODO comments einsetzen
    }
    
};

const detailViewC={
    
    render(post){
         let page = document.getElementById('post').cloneNode(true);
        page.removeAttribute("id");
        // Blognamen einsetzen
        let cont = page.innerHTML;
        let h= page.querySelector("header");
        let hTempl = h.firstElementChild;
         hTemplate.remove();
        cont = helper.setDataInfo(h,post)
        page.innerHTML = cont;
        return page;
    }
}

const detailViewP = {
    render (blog, posts) {
        // 
           let page = document.getElementById('post').cloneNode(true);
        page.removeAttribute("id");
        
        let cont = page.innerHTML;
        let h= page.querySelector("section");
       
        cont = helper.setDataInfo(h,post)
        page.innerHTML = cont;
       
     return page;
    }
};

const CommentViewC={
    render(comments){
        let page= document.getElementById('comment').cloneNode(true);
        page.remove("id");
        let cont= page.innerHTML;
          let ul= page.querySelector("ul");
          liTemplate=ul.fistElementChild;
            hTemplate.remove();
             for (let c of comments) {
            let li = liTempl.cloneNode(true);
            ul.appendChild(li);
            helper.seDataInfo(ul,c);
        }
return page;
}}
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
    // Setzt die Navigations-Buttons in das Nav-Element des Templates in temp
    setNavButtons(templ) {
        // Klonen des Button-Komponententemplate
        let buttons = document.getElementById("Buttons").cloneNode(true);
        buttons.removeAttribute("id");
        // Buttons in Navigation einsetzen
        let nav = templ.querySelector("nav");
        nav.append(buttons);
    }
};