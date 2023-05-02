const { ipcRenderer } = require("electron");
let profile=null;
let all_users=[];





show_loader();
ipcRenderer.send("fetch", "users/", "first-fetch-result");
ipcRenderer.on("first-fetch-result", (event, isError, _profile, data) => {
    if(isError){
        hide_loader();
        show_toast("Network Error", true);
    }else{
        if(data){
            seperate_data(data);
        }
        profile=_profile;
    }
});






const seperate_data = (data) => {
    all_users=[];
    for(i of Object.keys(data)){
        all_users.push(data[i]);
    }
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
const populate_users = () => {
    let contacts_elem = document.querySelector(".contacts");
    contacts_elem.innerHTML="";
    for(i of all_users){
        contacts_elem.innerHTML+=`<div class="contact" onclick="">
            <div class="left">
                <img src="../res/user.png" alt="...">
                <div>
                    <p>${i.first_name+" "+i.last_name}</p>
                    <p class="last-message">hello</p>
                </div>
            </div>
            <!-- <span class="counter">3</span> -->
        </div>`;
    }
}