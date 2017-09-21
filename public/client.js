/* Derrick Li - Client side js file: client.js */

/* Loads the table data upon initial visit to main page */
function initialTableAjaxBuild() {
	var req = new XMLHttpRequest();

	req.open('GET', '/initial', true);

	req.addEventListener('load', function() {
		if(req.status >= 200 && req.status < 400)
		{
			var response = JSON.parse(req.responseText);
			buildTable(response);
		}
		else
		{
			console.log('Error in network request: ' + req.statusText);
		}
	});

	req.send(null);
}

/* Binds the 'Add Exercise' button on main page */
function bindAddButton() {

	document.getElementById('addExerciseButton').addEventListener('click', function(event) {

		/* Prevents page from refreshing after clicking submit */
		event.preventDefault();

		var req = new XMLHttpRequest();

		/* Creates an exercise object from user inputs */
		var exercise = {};
		exercise.name  = document.getElementById('exerciseNameInput').value;

		/* If user left rep field blank, null is stored in database so table shows blank cell */
		if(document.getElementById('repsInput').value.length != 0) {
			exercise.reps  = document.getElementById('repsInput').value;
		} else {
			exercise.reps  = null;
		}

		/* If user left weight field blank, null is stored in database so table shows blank cell */
		if(document.getElementById('weightInput').value.length != 0) {
			exercise.weight  = document.getElementById('weightInput').value;
		} else {
			exercise.weight  = null;
		}

		/* If user did not select date, null is stored in database so table shows blank cell */
		if(document.getElementById('dateInput').value.length != 0) {
			exercise.date  = document.getElementById('dateInput').value;
		} else {
			exercise.date  = null;
		}

		exercise.lbs  = document.getElementById('lbsInput').value;

		/* If user did not enter an exercise name, user is alerted and function returns. */
		if(exercise.name == '') {
			alert('Please enter an exercise name.');
			return;
		}

		req.open('POST', '/add-exercise', true);
		req.setRequestHeader('Content-Type', 'application/json');

		req.addEventListener('load', function() {
			if(req.status >= 200 && req.status < 400)
			{
				var response = JSON.parse(req.responseText);
				buildTable(response);

				/* Clears field data once request has successfully been processed */
				document.getElementById('exerciseNameInput').value = '';
				document.getElementById('repsInput').value = '';
				document.getElementById('weightInput').value = '';
				document.getElementById('dateInput').value = '';
				//lbsInput is left whatever it was last for user convenience

			}
			else
			{
				console.log('Error in network request: ' + req.statusText);
			}
		});

		/* Stringify exercise object and send in body of request */
		req.send(JSON.stringify(exercise));
	});

}

/* Binds the 'Clear Table' button on main page */
function bindClearTableButton() {

	document.getElementById('clearTableButton').addEventListener('click', function(event) {

		/* Prevents page from refreshing after clicking submit */
		event.preventDefault();

		var req = new XMLHttpRequest();

		req.open('GET', '/reset-table', true);

		req.addEventListener('load', function() {
			if(req.status >= 200 && req.status < 400)
			{
				var response = JSON.parse(req.responseText);
				buildTable(response);
			}
			else
			{
				console.log('Error in network request: ' + req.statusText);
			}
		});

		req.send(null);
	});

}

/* Takes in a parsed response (i.e. array of objects - each object should have name, reps,
   weight, date, and lbs properties) and builds table to id='tableBody' element */
function buildTable(response) {

	/* Clears table body */
	var tableBodyNode = document.getElementById('tableBody');
	while(tableBodyNode.hasChildNodes() == true)
	{
		tableBodyNode.removeChild(tableBodyNode.lastChild);
	}

	/* Add rows of data */
	for(var i = 0; i < response.length; i++)
	{
		/* Creates row */
		var row = document.createElement('tr');
		tableBodyNode.appendChild(row);

		/* Creates data cells */
		var nameCell = document.createElement('td');
		var repsCell = document.createElement('td');
		var weightCell = document.createElement('td');
		var dateCell = document.createElement('td');
		var lbsCell = document.createElement('td');

		nameCell.textContent = response[i].name;

		/* If reps is null, display '-' */
		if(response[i].reps == null) {
			repsCell.textContent = '-';
		} else {
			repsCell.textContent = response[i].reps;
		}

		/* If weight is null, display '-' */
		if(response[i].weight == null) {
			weightCell.textContent = '-';
		} else {
			weightCell.textContent = response[i].weight;
		}

		/* split('T') splits string at 'T' char into array. [0] is selected. Its format is 'YYYY-MM-DD'. */
		/* If date is null, display '-' */
		if(response[i].date == null)
		{
			dateCell.textContent = '-';
		} else {
			dateCell.textContent = response[i].date.split('T')[0];
		}

		/* Displays lbs or kgs in lbsCell*/
		if(response[i].lbs == '1')
		{
			lbsCell.textContent = 'lbs';
		} else if(response[i].lbs == '0') {
			lbsCell.textContent = 'kgs';
		} else {
			lbsCell.textContent = '-';
		}

		row.appendChild(nameCell);
		row.appendChild(repsCell);
		row.appendChild(weightCell);
		row.appendChild(dateCell);
		row.appendChild(lbsCell);

		/* Creates Edit and Remove buttons. Also creates hidden field to track id. */
		var buttonsCell = document.createElement('td');
		row.appendChild(buttonsCell);

		var form = document.createElement('form');
		form.name = 'edit-remove';
		form.method = 'POST';
		form.action = '/edit-page';
		buttonsCell.appendChild(form);

		var id = document.createElement('input');
		var edit = document.createElement('input');
		var remove = document.createElement('input');

		form.appendChild(id);
		form.appendChild(edit);
		form.appendChild(remove);

		id.type = 'hidden';
		id.name = 'id';
		id.value = response[i].id;

		edit.type = 'submit';
		edit.name = 'Edit';
		edit.value = 'Edit';

		remove.type = 'submit';
		remove.name = 'Remove';
		remove.value = 'Remove';

		/* Binds each remove button to its id value */
		bindRemoveButton(remove, id.value);
	}
}

/* Binds the 'Remove' buttons  */
function bindRemoveButton(removeButton, idValue) {
	removeButton.addEventListener('click', function(event) {

		/* Prevents page from refreshing after clicking submit */
		event.preventDefault();

		var req = new XMLHttpRequest();

		/* Creates an exercise object from table data with just id property */
		var exercise = {};
		exercise.id = idValue;

		req.open('POST', '/remove-exercise', true);
		req.setRequestHeader('Content-Type', 'application/json');

		req.addEventListener('load', function() {
			if(req.status >= 200 && req.status < 400)
			{
				var response = JSON.parse(req.responseText);
				buildTable(response);
			}
			else
			{
				console.log('Error in network request: ' + req.statusText);
			}
		});

		/* Stringify exercise object and send in body of request */
		req.send(JSON.stringify(exercise));
	});
}

document.addEventListener('DOMContentLoaded', function() {
	bindAddButton();
	initialTableAjaxBuild();
	bindClearTableButton();
});