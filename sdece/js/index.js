export function showMainModal() {
	var mainModal = document.getElementById('mainModal');
	mainModal.style.display = 'flex';

	// display temporarily saved activities to main modal
	var test_entry = {
		ADMU_contact_name : "UHHH",
		ADMU_email: "assadasd@gmail.com",
		ADMU_office: "QWERAS",
		// activity_date: Timestamp.fromDate(test_date),
		activity_name: "SOMRHTING",
		activity_nature: "reading AJKSDHKASDJH",
		additional_partnership: "UHHH",
		identifier: "wNr26AKaKadluPLiJrzG",
		organization_unit: "COMPASDDDDD",
		partner_address: "ddadad",
		partner_contact_name: "dddddaxcz",
		partner_contact_number: "qwerrwe",
		// partner_coordinates: testLoc,
		partner_email: "asdasd@gmail.com",
		partner_name: "HAHAHAHA",
	}

	const mainModalActivityList = mainModalDocument.getElementById('mainModalActivityList');
	mainModalActivityList.innerHTML = '';
	
	var activity = test_entry; //Set what 

	// View activity details button
	// const activityButton = document.createElement('button');
	const activityButton = document.createElement('div');
	activityButton.classList.add('modal-activities');
	const activityName = document.createElement('div');
	const arrow = document.createElement('div');

	activityName.textContent = activity.activity_nature + '';

	arrow.innerHTML =
		'<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#currentColor"><g id="SVGRepo_bgCarrier" stroke-width="2"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z" fill="currentColor"></path></g></svg>';
	arrow.classList.add('arrow');

	activityButton.appendChild(activityName);

	// To do: have list of activities and iterate-add
	mainModalActivityList.appendChild(activityButton);

	console.log('Main modal activities:');
	console.log(mainModalActivityList);

	window.onclick = function (event) {
		if (event.target == mainModal) {
			mainModal.style.display = 'none';
		}
	};
}

export function showAddModal() {
	console.log("The user clicked the '+' button within the Main Modal");
	var addModal = document.getElementById('addModal');
	addModal.style.display = 'flex';

	window.onclick = function (event) {
		if (event.target == addModal) {
			addModal.style.display = 'none';
		}
	};
}

// function addMainButtonText() {
// 	var mainButtonText = document.getElementById('mainButtonText');
// 	mainButtonText.innerHTML = 'Add an activity';
// }
// addMainButtonText();
