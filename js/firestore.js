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
import { getCollection, setCollection, SDECE_RULES, getDocIdByPartnerName } from '/firestore_UNIV.js';
// Your Firestore code here

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
setCollection("sdece-official");

var col_ref = null;

col_ref = getCollection();


console.log(col_ref);

var partners = {}; // queried
var activities = [];

// get docs from firestore and place them in partner and activities

getDocs(col_ref)
	.then((querySnapshot) => {

		//populate activities
		querySnapshot.forEach((doc) => {
			if (
				doc.data().name !== 'Test 2' ||
				doc.data().name !== 'Test2'
			) {
				let a = doc.data();
				a["identifier"] = doc.id;
				activities.push(a);
			}
		});

		console.log("Activities:")
		console.log(activities);

		//populate with partners
		activities.forEach((activity) => {
			let partner = activity[SDECE_RULES[1]];

			//console.log(partner);

			if (partners[partner] == null){
				partners[partner] = [];
				partners[partner].push(activity);
			} 
			else {
				partners[partner].push(activity);
			}

			
		});

		console.log("Partners: ")
		console.log(partners);

		// populate ul with activities
		// querySnapshot.forEach((partner) => {
		// 	console.log(partner.data());

		// 	// Creating DOM elements
		// 	const containerDiv = document.createElement('div');
		// 	const img = document.createElement('svg');
		// 	const listItem = document.createElement('li');
		// 	const anchor = document.createElement('a');
		// 	const nameDiv = document.createElement('div');
		// 	const addressDiv = document.createElement('div');
		// 	const activityDiv = document.createElement('div');

		// 	// Set attributes
		// 	anchor.href = '#';

		// 	anchor.addEventListener('click', () => {
		// 		showModal(partner.data());
		// 	});

		// 	// Adding classes and setting text content
		// 	nameDiv.classList.add(
		// 		'name',
		// 		'font-montserrat',
		// 		'font-bold',
		// 		'text-lg',
		// 		'text-darkbg',
		// 		'leading-[110%]'
		// 	);
		// 	addressDiv.classList.add(
		// 		'address',
		// 		'text-sm',
		// 		'text-customGray',
		// 		'font-hind',
		// 		'font-regular',
		// 		'leading-[120%]',
		// 		'mt-2'
		// 	);
		// 	activityDiv.classList.add(
		// 		'activity',
		// 		'text-sm',
		// 		'text-customBlack',
		// 		'font-hind',
		// 		'font-regular',
		// 		'leading-[110%]',
		// 		'mt-2'
		// 	);

		// 	nameDiv.textContent = partner.data().partner_name;
		// 	addressDiv.textContent = partner.data().partner_city;
		// 	activityDiv.textContent = partner.data().activity_nature;

		// 	// if (partner.activities.length > 0)      // check if list of activities is present, otherwise is skipped to avoid errors
		// 	// {
		// 	//   partner.activities.forEach( (activity) => {
		// 	//     activityDiv.innerHTML += activity.activityName + "<br/>";       // there might be a better way to display multiple activities
		// 	//   });
		// 	// }

		// 	listItem.classList.add(
		// 		'accordion',
		// 		'py-6',
		// 		'px-8',
		// 		'border-b',
		// 		'border-customGray'
		// 	);
		// 	anchor.classList.add('accordion', 'link');

		// 	// Append elements to the DOM
		// 	anchor.appendChild(nameDiv);
		// 	anchor.appendChild(addressDiv);
		// 	anchor.appendChild(activityDiv);

		// 	listItem.appendChild(anchor);
		// 	containerDiv.appendChild(img);
		// 	containerDiv.appendChild(listItem);
		// 	locationList.appendChild(containerDiv);
		// });

		//populate ul with partners
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

	//   var activities = getDocIdByPartnerName(partner.partner_name);
      if (activities.length > 0)      // check if list of activities is present, otherwise is skipped to avoid errors
      {
        activities.forEach( (activity) => {
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
			addressDiv.textContent = partners[partner][0]["partner_city"];
			
			let qq = "";

			for( let activityy of partners[partner]){
				qq += (activityy["activity_nature"] + "\n");
			}
			activityDiv.textContent = qq;

			// if (partner.activities.length > 0)      // check if list of activities is present, otherwise is skipped to avoid errors
			// {
			//   partner.activities.forEach( (activity) => {
			//     activityDiv.innerHTML += activity.activityName + "<br/>";       // there might be a better way to display multiple activities
			//   });
			// }

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
	})
	.catch((error) => {
		console.error('Error getting documents: ', error);
	});

// Display partner modal by clicking partner entry (WIP: and on pin pop up click)
function showModal(partner) {
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
		console.log(activity);
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
	});


  var editButtons =
  document.getElementsByClassName('editButton');
  for (var i = 0; i < editButtons.length; i++) {
    editButtons[i].addEventListener(
      'click',
      function () {		
        console.log("Clicked edit activity");	

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
          if (event.target == modal) {
            modal.classList.add('hidden');
          }
        };
      }
    );
  }
}

