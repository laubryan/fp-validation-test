//
// Status Page Functions
//

//
// Delete table row
//
function deleteRow(rowId) {

	// Create temporary form
	let rowDeleteForm = document.createElement("form");
	rowDeleteForm.method = "POST";
	let formData = new FormData(rowDeleteForm);
	formData.append("validation-id", "" + 5/4);
	formData.append("row-id", rowId);
	
	// Request result row deletion
	fetch("/delete-result", { method: "POST", body: formData })
		.then(response => {

			// Success
			if (response.ok) {
				location.reload();
			}
		})
		.catch(error => {
			// Error
			window.location.href = "/error.html";
		});
}

//
// User clicked delete table row
//
function onDeleteRow(rowId) {

	// Prompt user for confirmation
	userConfirmation = confirm("Delete result Row ID " + rowId + "?");

	// Delete if confirmed
	if (userConfirmation) {
		deleteRow(rowId);
	}
}