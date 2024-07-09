import {
    readyField,
    clearMarkers,
    clearLocationList,
    map,
    loadJsCssFiles,
    createJsCssFiles,
} from '/index_UNIV_v2.js';

import {
    getCurrentBranchCookie,
    setCurrentBranchCookie
} from "/cookies.js";

import {
    testAdd,
    testEdit,
    DB_RULES_AND_DATA,
    DB_RULES_AND_DATA_TEST,
} from '/firestore_UNIV_v2_mirror.js';

import {
    sdece_setup,
} from '/js/firestore.js';

import {
    buklod_setup,
} from '/buklod-tao-branch/js/firestore.js';

let collections = document.getElementById('collections');

// due to the way the rule engine is structured, this is how we're gonna roll
Object.keys(DB_RULES_AND_DATA).forEach((coll) => {
    collections.innerHTML += `<option value="${ coll }"> ${coll}</option>`;
});

collections.addEventListener("change", function(){
    const SELECTED = collections.options[collections.selectedIndex].value;
    setCurrentBranchCookie("current_branch", SELECTED);
    console.log(getCurrentBranchCookie());
    location.reload();
});        

if(getCurrentBranchCookie() === null){       
    setCurrentBranchCookie("current_branch", "sdece-official");
    console.log(getCollection());
    loadJsCssFiles(getCurrentBranchCookie()); //needs setCollection to run
}              
else{
    console.log("hi");
    switch(getCurrentBranchCookie()){
        case "sdece-official":
            // load firestore.js for SDECE
            sdece_setup();
            break;
        case "buklod-official":
            buklod_setup();
            // load firestore.js for buklod tao
            break;
    }
    collections.value = getCurrentBranchCookie();
}
