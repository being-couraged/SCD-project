const { log } = require("console");
const {BrowserWindow, app, ipcMain, screen, powerMonitor} = require("electron");
const firebase = require("firebase/app");
const {getDatabase, ref, get, set, remove, onValue} = require("firebase/database");
const storage = require("firebase/storage");
const fs = require("fs");

const firebaseConfig = {
    apiKey: "AIzaSyBid7q71uob_88zzI6mzb8AHhpNzgz7sXo",
    authDomain: "whatsapp-bb8c2.firebaseapp.com",
    databaseURL: "https://whatsapp-bb8c2-default-rtdb.firebaseio.com",
    projectId: "whatsapp-bb8c2",
    storageBucket: "whatsapp-bb8c2.appspot.com",
    messagingSenderId: "1093682295490",
    appId: "1:1093682295490:web:faaf7c5795734da26d015b",
    measurementId: "G-G6P4X6FJP7"
};


let window=null;
const mainWindow = () => {
    let {height, width} = screen.getPrimaryDisplay().workAreaSize;
    window = new BrowserWindow({
        width: width,
        height: height,
        autoHideMenuBar: true,
        webPreferences:{
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    // window.setMenu(null);
    window.maximize();
    window.loadFile(process.cwd()+"/public/html/index.html");
}

app.on("ready", mainWindow);



let firebaseApp = firebase.initializeApp(firebaseConfig);
let database = getDatabase(firebaseApp);
let fileStorage = storage.getStorage(firebaseApp);
let profile=null;


ipcMain.on("insert", (event, path, data, sendBackListener) => {
    if(path){
        set(ref(database, path), data).then((val) => {
            event.reply(sendBackListener, true);
        }).catch((e) => {
            event.reply(sendBackListener, false);
        });
    }
});
ipcMain.on("fetch", (event, path, sendBackListener) => {
    if(path){
        get(ref(database, path)).then((data) => {
            if(data)
                event.reply(sendBackListener, false, profile, data.val());
            else
                event.reply(sendBackListener, false, profile, null);
        }).catch((e) => {
            event.reply(sendBackListener, true, profile, null);
        });
    }
});
ipcMain.on("delete", (event, path, sendBackListener) => {
    if(path){
        remove(ref(database, path)).then((val) => {
            event.reply(sendBackListener, true);
        }).catch((e) => {
            event.reply(sendBackListener, false);
        });
    }
});
ipcMain.on("upload-image", (event, img_name, path, file, sendBackListener) => {
    let data = fs.readFileSync(file, "base64");
    storage.uploadString(storage.ref(fileStorage, img_name), data, "base64", {contentType: "images/jpeg"}).then((res) => {        
        set(ref(database, path), img_name).then((res) => {
            event.reply(sendBackListener, true);
        }).catch((e) => {
            event.reply(sendBackListener, false);
        });
    }).catch((e) => {
        event.reply(sendBackListener, false);
    });
});
ipcMain.on("image-url", (event, name, sendBackListener) => {
    storage.getDownloadURL(storage.ref(fileStorage, `${name}`)).then((url) => {
        let obj = {name: name,
                    url: url}
        event.reply(sendBackListener, obj);
    }).catch((err) => {
        event.reply(sendBackListener, null);
    });
});
ipcMain.on("all-urls", (event, images, sendBackListener) => {
    for(let i=0; i<images.length; i++){
        storage.getDownloadURL(storage.ref(fileStorage, `${images[i].name}`)).then((url) => {
            images[i].url=url;
            event.reply(sendBackListener, images);
        }).catch((e) => {
            event.reply(sendBackListener, false);
        })
    }
});



ipcMain.on("login", (event, credentials) => {
    get(ref(database, `users/${credentials.number}/`)).then((data) => {
        if(data && data.val()){
            if(data.val().password===credentials.password){
                profile=data.val();
                window.loadFile(process.cwd()+"/public/html/contacts.html");
                set(ref(database, `users/${profile.number}/status`), "online");
            }else{
                event.reply("login-result", "Incorrect Password");
            }
        }else{
            event.reply("login-result", "Username not exists");
        }
    }).catch((e) => {
        event.reply("login-result", "Network Error");
    });
});
ipcMain.on("signup", (event, data) =>{
    get(ref(database, `users/${data.number}/`)).then((object) => {
        if(object.val()){
            event.reply("signup-result", "Number Already Exists");
        }else{
            set(ref(database, `users/${data.number}/`), data).then((val) => {
                window.loadFile(process.cwd()+"/public/html/index.html");
            }).catch((e) => {
                event.reply("signup-result", "Network Error");
            });
        }
    }).catch((e) => {
        event.reply("signup-result", "Network Error");
    });
}); 
ipcMain.on("logout", (event, data) => {
    set(ref(database, `users/${profile.number}/status`), "offline").then((val) => {
        profile=null;
        window.loadFile(process.cwd()+"./public/html/index.html");
    }).catch((e) => {
        event.reply("logout-result", "Network Error");
    })
});






onValue(ref(database, "/"), (data) => {
    if(data && data['users']){
        let user_data=data['users'];
        for(i of Object.keys(user_data)){
            if(user_data[i].number===profile.number){
                profile=user_data[i];
                break;
            }
        }
        window.webContents.send("live-change-detected", profile, data.val());
    }
});





powerMonitor.on("lock-screen", (e) => {
    window.loadFile(process.cwd()+"./public/html/index.html");
})