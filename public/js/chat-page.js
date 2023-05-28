const {ipcRenderer} = require("electron");
let sender_profile=null, 
reciever_profile=null,
images=[],
chats_list=[];
let img_exts=['png','jpeg','jpg','gif'];
let has_file=false;



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
const show_dialog = (dialog_class) => {
    let dialog = document.querySelector(`.dialog .${dialog_class}`);
    dialog.style.display="flex";
    dialog.parentElement.style.display="flex";
}
const hide_dialog = (dialog) => {
    dialog.style.display="none";
    dialog.parentElement.style.display="none";
}
const populate_profile = () => {
    if(!localStorage.getItem("reciever_profile")){
        window.location.replace("../html/contacts.html");
        return;
    }
    reciever_profile = JSON.parse(localStorage.getItem("reciever_profile"));
    let url="../res/user.png";
    if(reciever_profile.dp!==""){
        for(i of images){
            if(i.name===reciever_profile.dp && i.url!==""){
                url=i.url;
                break;
            }
        }
    }
    let profile_elem=document.querySelector(".profile .left");
    profile_elem.innerHTML=`<img src="${url}" alt="...">
                            <p class="name">${reciever_profile.first_name+" "+reciever_profile.last_name}</p>`;
        
    populate_profile_dialog(url);
}
const populate_profile_dialog = (url) => {
    document.querySelector(".profile-dialog img").src=url;
    document.querySelector(".profile-dialog h2").innerHTML=reciever_profile.first_name+" "+reciever_profile.last_name;
    document.querySelector(".profile-dialog p").innerHTML=reciever_profile.number;
}
const populate_chats = () => {
    let messages_container=document.querySelector(".messages");
    messages_container.innerHTML="";
    for(i of chats_list){
        let side="left";
        if(i.sender===sender_profile.number)
            side="right";
        let data=`<div class="message ${side}" id="${i.id}">`;
        if(i.file_name && i.file_name!==""){
            let url="";
            for(j of images){
                if(j.name===i.id){
                    url=j.url;
                }
            }
            let preview="../res/file-preview.png";
            for(j of img_exts){
                if(j.toLowerCase()===i.file_name.split(".").pop().toLowerCase()){
                    preview=url;
                    break;
                }
            }
            data+=`<div class="file" onclick="download_file('${url}', '${i.file_name}');">
                <img src="${preview}" alt="...">
                <p>${i.file_name}</p>            
            </div>`;
        }    
        data+=`<p class="body">${i.body}</p>
            <p class="time">${i.time}</p>
        </div>`;
        messages_container.innerHTML+=data;
    }
    if(document.querySelector(".messages .message:last-child"))
        document.querySelector(".messages .message:last-child").scrollIntoView();
}
const seperate_data = (data) => {
    if(!data)
        return;
    chats_list=[];
    for(i of Object.keys(data)){
        if((data[i].sender==sender_profile.number && data[i].reciever===reciever_profile.number) || (data[i].sender==reciever_profile.number && data[i].reciever===sender_profile.number)){
            chats_list.push(data[i]);
        }
    }
    populate_chats();
}
const separate_images = () => {
    for(i of chats_list){
        if(i.file_name && i.file_name!==""){
            images.push({name: i.id, url:""});
        }
    }
}
const send_message = () => {
    let message_inp = document.querySelector("textarea[name='message-body']");
    if(!has_file && message_inp.value===""){
        return;
    }
    document.querySelector(".message-input .preview").classList.remove("show");
    let message = {};
    let file_path="";
    if(has_file){
        let file = document.querySelector(".message-input input[name='file-name']").files[0];
        message.file_name=file.name;
        file_path=file.path;
    }
    message.body=message_inp.value;
    message.sender=sender_profile.number;
    message.reciever=reciever_profile.number;
    let time="";
    let date = new Date(Date.now());
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let am_pm = (hours<12)?"AM":"PM";
    if(hours>12)
        hours=hours-12;
    if(hours<10)
        hours="0"+hours;
    if(minutes<10)
        minutes="0"+minutes;
    time=hours+":"+minutes+" "+am_pm;
    message.time=time;
    message.id=new Date().getTime();

    message_inp.value="";

    ipcRenderer.send("send-msg", `chats/${message.id}/`, message, file_path, "message_sent");
    ipcRenderer.on("message_sent", (event, res) => {
        if(res){

        }else{
            show_toast("message not sent", true);
        }
    });
}
const preview_image = (e) => {
    let url = "../res/file-preview.png";
    if(e.target.files[0]){
        has_file=true;
    }else{
        return;
    }
    document.querySelector(".message-input .preview").classList.add("show");
    let ext=e.target.files[0].name.split(".").pop();
    for(i of img_exts){
        if(i.toLowerCase()===ext.toLowerCase()){
            url = URL.createObjectURL(e.target.files[0]);
            break;
        }
    }
    document.querySelector(".message-input .preview img").src=url;
    document.querySelector(".message-input .preview p").innerHTML=e.target.files[0].name;
};
const clear_files = (elem) => {
    document.querySelector(".message-input .preview").classList.remove("show");
    has_file=false;
}
const download_file = (url, file_name) => {
    if(url===""){
        show_toast("Still loading, please wait", true);
        return;
    }
    show_loader();
    ipcRenderer.send("download-file", url, file_name, "get-res");
    ipcRenderer.on("get-res", (event, res) => {
        hide_loader();
        show_toast("File downloaded to downloads directory");
    })
}



show_loader();
populate_profile();
ipcRenderer.send("fetch", "chats/", "chats-fetch-result");
ipcRenderer.on("chats-fetch-result", (event, isError, profile, data) => {
    if(isError){
        hide_loader();
        show_toast("Network Error", true);
    }else{
        sender_profile=profile;
        seperate_data(data);
        hide_loader();
        images=[];
        images.push({name: reciever_profile.dp, url: ""});
        separate_images();
        ipcRenderer.send("all-urls", images, "getting-images-for-first-time");
        ipcRenderer.on("getting-images-for-first-time", (event, list) => {
            images=list;
            populate_profile();
            populate_chats();
        });
    }
});







ipcRenderer.on("live-change-detected", (event, _profile, data) => {
    reciever_profile=_profile;
    populate_profile();
    if(data && data['chats']){
        seperate_data(data['chats']);
    }else if(data && data['users']){
        let users_list = data['users'];
        for(i of Object.keys(users_list)){
            if(users_list[i].number===reciever_profile.number){
                reciever_profile=users_list[i];
                break;
            }
        }
        images=[];
        images.push({name: reciever_profile.dp, url: ""});
        separate_images();
        ipcRenderer.send("all-urls", images, "getting-images-every-load");
        ipcRenderer.on("getting-images-every-load", (event, list) => {
            images=list;
            populate_profile();
            populate_chats();
        });
    }else{
        window.location.replace("../html/contacts.html");
    }
});