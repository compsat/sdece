import {setCollection, getCollection} from "/firestore_UNIV.js";
import { removeJsCssFiles, loadJsCssFiles } from "./index_UNIV.js";

export function setCurrentBranchCookie(name, value){
    const DATE = new Date();
    DATE.setTime(DATE.getTime() + (DATE.getTime() * 24 * 60 * 60 * 1000));
    document.cookie = name + "=" + value, + ";path=current_branch/"; 
    console.log(document.cookie);
}


export function getCurrentBranchCookie(){
    let pattern = new RegExp("current_branch" + "=.[^;]*");
    var matched = document.cookie.match(pattern);
    if(matched){
        var cookie = matched[0].split('=');
        console.log(cookie[1]);
        return cookie[1];
    }
    return null;
}


if(getCurrentBranchCookie() != null){
    collections.setAttribute("placeholder", getCurrentBranchCookie());
    setCollection(getCurrentBranchCookie());
    removeJsCssFiles();
    loadJsCssFiles(getCurrentBranchCookie());
}               