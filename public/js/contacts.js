const { ipcRenderer } = require("electron");
let profile=null;
let all_users=[];







const seperate_data = (data) => {
    all_users=[];
    for(i of Object.keys(data)){
        if(data[i].number === profile.number)
            continue;
        all_users.push(data[i]);
    }
    update_profile();
    populate_users();
}
const logout = () => {
    show_loader();
    ipcRenderer.send("logout", true);
    ipcRenderer.on("logout-result", (event, res) => {
        hide_loader();
        show_toast(res, true);
    });
}
const show_toast = (message='', error=false) => {
    if(message){
        let toast_elem = document.querySelector(".toast");
        toast_elem.querySelector("p").innerHTML=message;
        if(error){
            toast_elem.classList.add("error");
        }else{
            toast_elem.classList.remove("error");
        }
        toast_elem.style.display="flex";
        setTimeout(() => {
            toast_elem.style.display="none";
        }, 5000);
    }
}
const show_loader = () => {
    let loader_elem=document.querySelector(".loader");
    loader_elem.style.display="flex";
}
const hide_loader = () => {
    let loader_elem=document.querySelector(".loader");
    loader_elem.style.display="none";
}
const update_profile = () => {
    let profile_elem = document.querySelector(".profile .left");
    profile_elem.innerHTML=`<img src="../res/user.png" alt="...">
                            <p class="name">${profile.first_name+" "+profile.last_name}</p>`;
}
const open_contact = (number) => {
    show_loader();
    let reciever_profile=null;
    for(i of all_users){
        if(i.number===number){
            reciever_profile=i;
            break;
        }
    }
    if(reciever_profile){
        localStorage.setItem("reciever_profile", JSON.stringify(reciever_profile));
        window.location.replace("../html/chat-page.html");
    }
}

const populate_users = () => {
    let contacts_elem = document.querySelector(".contacts");
    contacts_elem.innerHTML="";
    for(i of all_users){
        contacts_elem.innerHTML+=`<a href="#" class="contact" onclick="open_contact('${i.number}');">
            <div class="left">
                <img src="../res/user.png" alt="...">
                <div>
                    <p>${i.first_name+" "+i.last_name}</p>
                    <p class="last-message">${i.number}</p>
                </div>
            </div>
            <!-- <span class="counter">3</span> -->
        </a>`;
    }
}







show_loader();
ipcRenderer.send("fetch", "users/", "first-fetch-result");
ipcRenderer.on("first-fetch-result", (event, isError, _profile, data) => {
    if(isError){
        hide_loader();
        show_toast("Network Error", true);
    }else{
        profile=_profile;
        if(data){
            seperate_data(data);
        }
        hide_loader();
    }
});







ipcRenderer.on("live-change-detected", (event, _profile, data) => {
    if(data && data['users']){
        profile=_profile;
        if(profile.status==="offline"){
            window.location.replace("../html/index.html");
        }
        update_profile();
        seperate_data(data['users']);
    }else{
        window.location.replace("../html/index.html");
    }
});