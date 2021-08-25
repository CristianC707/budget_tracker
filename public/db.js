const { response } = require("express");

const indexdb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
let DB;
const request = indexdb.open("budget", 1);

request.onupgradeneeded = ({ target }) => {
    let DB = target.result;
    DB.createObjectStore("pending", {autoIncrement: true});
}

request.onsuccess = ({ target }) => {
    DB = target.result;
    if (navigator.onLine) {
        //verify DB
        storeRecord();
    }
}

request.onerror = function(event) {
    console.log(event.target.errorCode);
}

function saveRecord(record) {
    const transaction = DB.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.add(record);
}

function storeRecord(record) {
    const transaction = DB.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const retrieveAll = store.getAll();
    retrieveAll.onsuccess = function() {
        if (retrieveAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "post",
                body: JSON.stringify(retrieveAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "content-type":"application/json"
                }
            })
            .then(response => {
                return response.json();
            }) 
            .then(() => {
                const transaction = DB.transaction(["pending"], "readwrite");
                const store = transaction.objectStore("pending");
                store.clear()
            })
        }
    }
}
window.addEventListener("online", storeRecord)