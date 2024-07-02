// FIRESTORE DATABASE

import {
	getFirestore,
	collection,
	getDocs,
	addDoc,
	updateDoc,
	doc,
	query,
	where,
	getDoc,
} from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';
//import { getCollection, setCollection, SDECE_RULES, getDocIdByPartnerName, editEntry } from '/firestore_UNIV.js';
import {getCollection, setCollection, getDocMap, groupBy, SDECE_RULES_TEST, } from '/firestore_UNIV_v2_mirror.js';
// Your Firestore code here

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var col_ref = null;

var activities = null;
var partners = null;

setCollection("sdece-official-TEST", true, true).then(() => {
	col_ref = getCollection();

	activities = getDocMap();
	partners = groupBy("partner_name"); // queried

	console.log(activities);
	console.log(partners);

	// get docs from firestore and place them in partner and activities
	Object.keys(partners).forEach((partner) => {
		const containerDiv = document.createElement('div');
		const img = document.createElement('svg');
		const listItem = document.createElement('li');
		const anchor = document.createElement('a');
		const nameDiv = document.createElement('div');
		const addressDiv = document.createElement('div');
		const activityDiv = document.createElement('div');

		// Set attributes
		anchor.href = '#';

		anchor.addEventListener('click', 
			function () {
				showModal(partners[partner]);
		});

		// Adding classes and setting text content
		containerDiv.classList.add('partnerDiv');

		if (Object.keys(activities).length > 0)      // check if list of activities is present, otherwise is skipped to avoid errors
		{
			Object.keys(activities).forEach( (activity) => {
			activityDiv.innerHTML += activity.activity_name + "<br/>";       // there might be a better way to display multiple activities
			});
		}
		else {
			console.log("No activities found");
		}
		
		nameDiv.classList.add(
			'name',
			'font-montserrat',
			'font-bold',
			'text-lg',
			'text-darkbg',
			'leading-[110%]'
		);
		addressDiv.classList.add(
			'address',
			'text-sm',
			'text-customGray',
			'font-hind',
			'font-regular',
			'leading-[120%]',
			'mt-2'
		);
		activityDiv.classList.add(
			'activity',
			'text-sm',
			'text-customBlack',
			'font-hind',
			'font-regular',
			'leading-[110%]',
			'mt-2'
		);

		nameDiv.textContent = partner;
		addressDiv.textContent = partners[partner][0]["partner_address"];
		
		let qq = "";

		for( let activityy of partners[partner]){ // the little texts on the partner sidenav
			qq += (activityy["activity_nature"] + "\n");
		}
		activityDiv.textContent = qq;

		listItem.classList.add(
			'accordion',
			'py-6',
			'px-8',
			'border-b',
			'border-customGray',
			'w-full'
		);
		anchor.classList.add('accordion', 'link');

		// Append elements to the DOM
		anchor.appendChild(nameDiv);
		anchor.appendChild(addressDiv);
		anchor.appendChild(activityDiv);

		listItem.appendChild(anchor);
		containerDiv.appendChild(img);
		containerDiv.appendChild(listItem);
		locationList.appendChild(containerDiv);

	});
});





var currently_viewed_activity = null;

// Display partner modal by clicking partner entry (WIP: and on pin pop up click)
function showModal(partner) {
	currently_viewed_activity = null;
	console.log("SHOW THE MODAL");
	const modal = document.getElementById('partnerModal');
	const modalContent = document.getElementById('modalContent');

	// Clear previous content
	modalHeader.innerHTML= "";
	modalContent.innerHTML = '';
	//modal.innerHTML = '';

  // Create div elements for each piece of information
  const backarrowDiv = document.createElement("button");
  const closeDiv = document.createElement("div");
  const nameDiv = document.createElement("div");
  const addressDiv = document.createElement("div");
  
  const activityHeaderDiv = document.createElement("div");
  const contactPersonDiv = document.createElement("div");
  const activityDiv = document.createElement("div");
  const admuContactDiv = document.createElement("div");
  const admuEmailDiv = document.createElement("div");
  const admuOfficeDiv = document.createElement("div");
  const orgDiv = document.createElement("div");
  const datesDiv = document.createElement("div");

  nameDiv.classList.add("modal-name", "float-left");
  addressDiv.classList.add("modal-address");

  // Set the content of each div
  backarrowDiv.innerHTML = '<svg viewBox="0 0 1024 1024" class="w-6 h-6" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#a0a0a0" stroke="#a0a0a0" stroke-width="50" transform="matrix(-1, 0, 0, -1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z" fill="#a0a0a0"></path></g></svg>'
  backarrowDiv.classList.add("float-left");
  backarrowDiv.addEventListener("click", () => {
		currently_viewed_activity = null;
	  modalHeader.innerHTML = "";
	  modalContent.innerHTML = "";

	  // Append the div elements to the modal content
	  modalHeader.appendChild(nameDiv);
	  modalHeader.appendChild(closeDiv);
	
	  //modalContent.appendChild(addressDiv);
	  modalContent.appendChild(activityHeaderDiv);
	  modalContent.appendChild(activityDiv);
  });

  closeDiv.innerHTML = '<svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#a0a0a0" class="w-6 h-6"><path d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z" fill="#aaaaaa"></path></svg>'
  closeDiv.classList.add("close", "float-right");

  console.log(partner[0]);

  nameDiv.textContent = partner[0].partner_name.substring(0, 45) + "...";
  addressDiv.textContent =
    "Latitude, Longitude: " + partner[0].partner_coordinates._lat + ", " + partner[0].partner_coordinates._long;

  // Activities header with add activity button
  activityHeaderDiv.innerHTML = "List of activities: "
  const addActivity = document.createElement("button");
  addActivity.innerHTML = '<svg  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path d="M6 12h6V6h1v6h6v1h-6v6h-1v-6H6z"></path></svg>'

  // Add button for adding activities
  addActivity.addEventListener("click", () => {
	console.log("Clicked add activity in the partner modal")
  });

  activityHeaderDiv.appendChild(addActivity);
  activityHeaderDiv.classList.add("modal-activities-header");


  // Add each activity to the modal content

  console.log(partner.length);
  if (partner.length > 0)      // check if list of activities is present, otherwise is skipped to avoid errors
  {
    partner.forEach((activity) => {
      // View activity details button
      const activityButton = document.createElement("button");
	  activityButton.classList.add("modal-activities", "flex", "flex-row", "justify-between");

      const activityName = document.createElement("div")
      const arrow = document.createElement("div")

      activityName.textContent = activity.activity_nature + "";
      arrow.innerHTML = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#a0a0a0" class="w-6 h-6"><g id="SVGRepo_bgCarrier" stroke-width="2"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z" fill="#a0a0a0"></path></g></svg>'
	  
      activityButton.appendChild(activityName);
      activityButton.appendChild(arrow);

      // Set div content for activity details

      const activityNameDiv = document.createElement("div");
      const activityAddressDiv = document.createElement("div");
      const activityContactDiv = document.createElement("div");
      const activityOrganizationDiv = document.createElement("div");
      const activityDatesDiv = document.createElement("div");
      const activityOfficeDiv = document.createElement("div");

      activityNameDiv.innerHTML = partner[0].activity_nature + "";
      activityNameDiv.classList.add("font-bold", "text-2xl", "text-lightbg");

      activityAddressDiv.innerHTML = partner[0].partner_address;
	  activityAddressDiv.classList.add("modal-address");

      activityContactDiv.innerHTML = "<b>Contact</b> <br> " + partner[0].partner_contact_name + "<br>" + partner[0].partner_email + "<br>";
      activityOrganizationDiv.innerHTML = "<b>Organization/Unit</b> <br>" + partner[0].organization_unit;
      activityDatesDiv.innerHTML = "<b>Date/s of Partnership</b> <br>" + partner[0].activity_date;

      activityOfficeDiv.innerHTML = "<hr> <br> <b class='font-bold text-2xl' style='color: #3d97af'>Ateneo Office Oversight</b> <br>" + partner[0].ADMU_office + "<br>" + partner[0].ADMU_contact_name + "<br>"  + partner[0].ADMU_email + "<br>";

      // View activity details in modal after clicking activity
      activityButton.addEventListener("click", () => {
		let iden = activity.identifier;
		console.log("clicked on activity with ID: " + iden);
		currently_viewed_activity = iden;
		
		modalHeader.innerHTML= "";
        modalContent.innerHTML = "";
        
		modalHeader.appendChild(backarrowDiv);
		modalHeader.appendChild(nameDiv);
		modalHeader.appendChild(closeDiv);

        modalContent.appendChild(activityNameDiv);
        modalContent.appendChild(activityAddressDiv);
        modalContent.appendChild(activityContactDiv);
        modalContent.appendChild(activityOrganizationDiv);
        modalContent.appendChild(activityDatesDiv);
        modalContent.appendChild(activityOfficeDiv);
      });

      activityDiv.appendChild(activityButton);
      activityDiv.appendChild(document.createElement("hr"));
      activityDiv.appendChild(document.createElement("br"));
    });
  }

  activityDiv.classList.add("modal-activities");

  
  admuContactDiv.innerHTML = "<b>AdMU Contact: </b>" + partner[0].ADMU_contact;
  admuEmailDiv.innerHTML = "<b>AdMU Email: </b>" + partner[0].ADMU_email;
  admuOfficeDiv.innerHTML = "<b>AdMU Office: </b>" + partner[0].ADMU_office;
  orgDiv.innerHTML = "<b>Organization: </b>" + partner[0].organization_unit;

  

  // Append the div elements to the modal content
  modalHeader.appendChild(nameDiv);
  modalHeader.appendChild(closeDiv);

  modalContent.appendChild(addressDiv);
  modalContent.appendChild(activityHeaderDiv);
  modalContent.appendChild(activityDiv);

  // modalContent.appendChild(contactPersonDiv);
  // modalContent.appendChild(admuContactDiv);
  // modalContent.appendChild(admuEmailDiv);
  // modalContent.appendChild(admuOfficeDiv);
  // modalContent.appendChild(orgDiv);
  // modalContent.appendChild(datesDiv);

	// Show the modal
	modal.style.display = 'block';

	// Close the modal when the close button is clicked
	const closeButton = document.getElementsByClassName('close')[0];
	closeButton.addEventListener('click', () => {
		modal.style.display = 'none';
		currently_viewed_activity = null;
	});


  var editButtons =
  document.getElementsByClassName('editButton');
  for (var i = 0; i < editButtons.length; i++) {
    editButtons[i].addEventListener(
      'click',
      function () {		
        console.log("Clicked edit activity");
		console.log("currently editing doc id: " + currently_viewed_activity);	

		//don't do anything if the currently viewed activity is null

		if( currently_viewed_activity != null){
			//Close activity details modal
			document.getElementById("partnerModal").style.display = "none";
			console.log("Activity modal closed");
								
			// Select the modal and partnerName elements
			var modal =
			  document.getElementById(
				'editModal'
			  );
	
			var partnerModal =
			  document.getElementById(
				'partnerModal'
			  );
			// TODO: Integrate this functionality into the modal instead
			// var partnerName = this.getAttribute("data-loc");
			//       window.open(
			//         `editloc.html?partnerName=${encodeURIComponent(partnerName)}`,
			//         "_blank"
			//       );
			  
			// Display the modal
			modal.classList.remove('hidden');
			modal.classList.add('flex');
			partnerModal.classList.add('hidden'); // Not sure if this should be hidden nalang, or should be kept open with the editModal on top nalang
			  
			// Close the modal when the user clicks anywhere outside of it
			window.onclick = function (event) {
				console.log(event.target);
				if (event.target == modal) {
				modal.classList.add('hidden');
				}
		  	};

			//populate the fields of the modal
			console.log(activities[currently_viewed_activity]);
			Object.keys(activities[currently_viewed_activity]).forEach((activity_field) => {
				console.log(activity_field);
				document.getElementById(activity_field).value = activities[currently_viewed_activity][activity_field];
			});

			
		}
		else {
			console.log("Cannot edit a null document");
		}

		

        
      }
    );
  }
}

document.getElementById("submit_form").addEventListener('click', submitEdit);

function submitEdit(){
	console.log("submitted edit for doc with id: " + currently_viewed_activity);
	let collated_input = {};

	for(let i = 0; i < SDECE_RULES[2].length; i++){
		//SDECE_RULES_TEST[2] are just the field names of each document
		console.log(SDECE_RULES[2][i]);
		let q = document.getElementById(SDECE_RULES[2][i]).value;
		collated_input[SDECE_RULES[2][i]] = q;

		// this is where data validation will happen
		// add the if-else statements of edge cases here
	}

	collated_input["identifier"] = currently_viewed_activity;

	console.log("collated input");
	console.log(collated_input);
	// This actually works but it needs some data validation
	// uncomment at the db's risk
	editEntry(collated_input, currently_viewed_activity);

}

