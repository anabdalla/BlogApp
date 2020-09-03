/* 
 * 
 /*
 * Adresse über die man auf die Webschnittstelle meines Blogs zugreifen kann:
 */
"use strict";
const model = (function () {
    // Private Variablen
    let loggedIn = false;

    let pathGetBlogs = 'blogger/v3/users/self/blogs';
    let pathBlogs = 'blogger/v3/blogs';
    
    // Private Funktionen 

    // Formatiert den Datum-String in date in zwei mögliche Datum-Strings: 
    // long = false: 24.10.2018
    // long = true: Mittwoch, 24. Oktober 2018, 12:21
    function formatDate(date, long) {
        var newDate;
        if (long == false) { //Kurzfassung
            newDate = date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear();
        }
        if (long == true) { //Langfassung TODO!!!!
            newDate = date.getDay() + ", " + date.getDate() + ". " + date.getMonth() + " " + date. getFullYear(); + ", " + date.getHours() + "." + date.getMinutes();
        }
        return newDate;
    }
    
    // Konstruktoren für Daten-Objekte
    function blog (id, name, postcount, change, release, URL) {
        this.id = id;
        this.blogName = name;
        this.postCount = postcount;
        this.lastChange = change;
        this.releaseDate = release;
        this.URL = URL;   
    }
    
    function post (id, bid, title, change, release, content, comments) {
        this.id = id;
        this.bid = bid;
        this.postName = title;
        this.lastChange = change;
        this.releaseDate = release;
        this.postContent = content;
        this.commentCount = comments;
    }
    
    function comment (id, bid, pid, name, change, release, content) {
        this.id = id;
        this.bid = bid;
        this.pid = pid;
        this.writer = name;
        this.lastChange = change;
        this.releaseDate = release;
        this.commentContent = content;
    }
   

    // Oeffentliche Methoden
    return {
        // Setter für loggedIn
        setLoggedIn(b){
            loggedIn = b;
        },
        // Getter für loggedIn
        isLoggedIn(){
            return loggedIn;
        },
        // Liefert den angemeldeten Nutzer mit allen Infos
        getSelf(callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': 'blogger/v3/users/self'
            });
            // Execute the API request.
            request.execute((result) => {
                callback(result);
            });
        },

        // Liefert alle Blogs des angemeldeten Nutzers
        getAllBlogs(callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathGetBlogs
            });
            // Execute the API request.
            request.execute((result) => {
                callback(result.items);
            });
        },

        // Liefert den Blog mit der Blog-Id bid
        getBlog(bid, callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathBlogs + "/" + bid
            });
            // Execute the API request.
            request.execute((result) => {
                callback(result);
            });
        },

        // Liefert alle Posts zu der  Blog-Id bid
        getAllPostsOfBlog(bid, callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathBlogs + "/" + bid + '/posts'
            });

            request.execute((result) => {
                callback(result.items);
            });
        },

        // Liefert den Post mit der Post-Id pid im Blog mit der Blog-Id bid
        getPost(bid, pid, callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathBlogs + "/" + bid + '/posts/' + pid
            });

            request.execute((result) => {
                callback(result);
            });
        },

        // Liefert alle Kommentare zu dem Post mit der Post-Id pid 
        // im Blog mit der Blog-Id bid
        getAllCommentsOfPost(bid, pid, callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathBlogs + "/" + bid + '/posts/' + pid + "/comments"
            });

            request.execute((result) => {
                callback(result.items);
            });
        },

        // Löscht den Kommentar mit der Id cid zu Post mit der Post-Id pid 
        // im Blog mit der Blog-Id bid 
        // Callback wird ohne result aufgerufen
        deleteComment(bid, pid, cid, callback) {
            var path = pathBlogs + "/" + bid + '/posts/' + pid + "/comments/" + cid;
            console.log(path);
            var request = gapi.client.request({
                'method': 'DELETE',
                'path': path
            });

            request.execute(callback);
        },

        // Fügt dem Blog mit der Blog-Id bid einen neuen Post 
        // mit title und content hinzu, Callback wird mit neuem Post aufgerufen
        addNewPost(bid, title, content, callback) {
            var body = {
                kind: "blogger#post",
                title: title,
                blog: {
                    id: bid
                },
                content: content
            };

            var request = gapi.client.request({
                'method': 'POST',
                'path': pathBlogs + "/" + bid + '/posts',
                'body': body
            });

            request.execute(callback);
        },

        // Aktualisiert title und content im geänderten Post 
        // mit der Post-Id pid im Blog mit der Blog-Id bid
        updatePost(bid, pid, title, content, callback) {
            var body = {
                kind: "blogger#post",
                title: title,
                id: pid,
                blog: {
                    id: bid
                },
                content: content
            };

            var request = gapi.client.request({
                'method': 'PUT',
                'path': pathBlogs + "/" + bid + '/posts/' + pid,
                'body': body
            });

            request.execute(callback);
        },

        // Löscht den Post mit der Post-Id pid im Blog mit der Blog-Id bid, 
        // Callback wird ohne result aufgerufen
        deletePost(bid, pid, callback) {
            var path = pathBlogs + "/" + bid + '/posts/' + pid;
            console.log(path);
            var request = gapi.client.request({
                'method': 'DELETE',
                'path': path
            });

            request.execute(callback);
        }
    };
})();



