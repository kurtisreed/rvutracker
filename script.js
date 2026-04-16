document.addEventListener('DOMContentLoaded', function() {
    let editingEntryId = null;
    let mohsEditingId = null;

    // Logout functionality
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                fetch('logout.php', {
                    method: 'POST'
                })
                .then(response => response.text())
                .then(data => {
                    if (data === 'success') {
                        // Redirect to reload page and show login
                        window.location.reload();
                    }
                })
                .catch(error => {
                    console.error('Logout error:', error);
                    alert('Error logging out. Please try again.');
                });
            }
        });
    }

    // Tab switching functionality
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and contents
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            // Add active class to the clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(button.dataset.tab).classList.add('active');

            if (button.dataset.tab === 'summary') {
                updateSummaryTable();
                loadDashboardCharts();
            }

            if (button.dataset.tab === 'mohs-summary') {
                updateMohsSummaryTable();
                loadMohsDashboardCharts();
            }
            
            if (button.dataset.tab === 'mohs-data-entry') {
                document.getElementById('date').valueAsDate = new Date();
                loadRecords();
            }

        });
    });

    // Autofocus the Name field in the Mohs Data Entry tab when the page loads
    document.getElementById('name').focus();

    // Add event listener for form submission
    document.getElementById('mohsForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission behavior

        const submitButton = this.querySelector('[type="submit"]');
        submitButton.disabled = true;

        let formData = new FormData(this);

        // Get the user's entered date
        let userDate = document.getElementById('date').value;

        // Get the current time
        let now = new Date();
        let currentTime = now.toTimeString().slice(0, 8); // Get HH:MM:SS format

        // Combine the user's date with the current time
        let dateTime = userDate + ' ' + currentTime;

        formData.set('date', dateTime); // Replace the original date with the combined DATETIME

        const url = mohsEditingId !== null ? 'update_mohs_entry.php' : 'submit_mohs.php';
        if (mohsEditingId !== null) {
            formData.append('id', mohsEditingId);
        }

        fetch(url, {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            document.getElementById('mohs-result').innerHTML = data;
            if (mohsEditingId !== null) {
                clearMohsEditingState();
            }
            clearForm();
            document.getElementById('name').focus();
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('mohs-result').innerHTML = 'An error occurred while submitting the form.';
            document.getElementById('name').focus();
        })
        .finally(() => {
            submitButton.disabled = false;
        });
    });

    function clearForm() {
        // Clear text input fields
        document.getElementById('name').value = '';
        document.getElementById('site').value = '';
        document.getElementById('nyu').value = '';
        document.getElementById('stages').value = '';
        document.getElementById('comments').value = '';

        // Reset dropdowns to default values
        document.getElementById('diagnosis').value = 'BCC';
        document.getElementById('repair').value = 'CLC';
        document.getElementById('referral').value = 'Me';
        document.getElementById('addon').value = 'N';

        // Hide and clear 'other' text inputs if they were visible
        document.getElementById('diagnosis-other').style.display = 'none';
        document.getElementById('diagnosis-other').value = '';
        document.getElementById('repair-other').style.display = 'none';
        document.getElementById('repair-other').value = '';
        document.getElementById('referral-other').style.display = 'none';
        document.getElementById('referral-other').value = '';
    }


    
    
    
    // Set today's date for the date input in the Mohs Data Entry form
    document.getElementById('date').valueAsDate = new Date();

    // Show or hide 'other' text inputs based on dropdown selections
    function toggleOtherInput(selectId, otherInputId) {
        document.getElementById(selectId).addEventListener('change', function() {
            const otherInput = document.getElementById(otherInputId);
            if (this.value === 'other') {
                otherInput.style.display = 'block';
            } else {
                otherInput.style.display = 'none';
            }
        });
    }

    toggleOtherInput('diagnosis', 'diagnosis-other');
    toggleOtherInput('repair', 'repair-other');
    toggleOtherInput('referral', 'referral-other');

    // Function to update the summary table
    function updateSummaryTable() {
        fetch('get_rvus.php')
            .then(response => response.json())
            .then(data => {
                function fmt$(val) {
                    return '$' + parseFloat(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
                function perEnc(incomeVal, encounters) {
                    return encounters > 0 ? fmt$(incomeVal / encounters) : '—';
                }

                // Stat cards
                document.getElementById('card-today-income').textContent = fmt$(data.today_income);
                document.getElementById('card-today-rvus').textContent = parseFloat(data.today).toFixed(1);
                document.getElementById('card-today-enc').textContent = data.today_encounters;
                document.getElementById('card-month-income').textContent = fmt$(data.this_month_income);
                document.getElementById('card-month-rvus').textContent = parseFloat(data.this_month).toFixed(1);
                document.getElementById('card-month-enc').textContent = data.this_month_encounters;
                document.getElementById('card-year-income').textContent = fmt$(data.this_year_income);
                document.getElementById('card-year-rvus').textContent = parseFloat(data.this_year).toFixed(1);
                document.getElementById('card-year-enc').textContent = data.this_year_encounters;

                // RVUs
                document.getElementById('today-rvus').textContent = parseFloat(data.today).toFixed(1);
                document.getElementById('this-week-rvus').textContent = parseFloat(data.this_week).toFixed(1);
                document.getElementById('last-week-rvus').textContent = parseFloat(data.last_week).toFixed(1);
                document.getElementById('this-month-rvus').textContent = parseFloat(data.this_month).toFixed(1);
                document.getElementById('last-month-rvus').textContent = parseFloat(data.last_month).toFixed(1);
                document.getElementById('this-year-rvus').textContent = parseFloat(data.this_year).toFixed(1);
                document.getElementById('last-year-rvus').textContent = parseFloat(data.last_year).toFixed(1);

                // Income
                document.getElementById('today-income').textContent = fmt$(data.today_income);
                document.getElementById('this-week-income').textContent = fmt$(data.this_week_income);
                document.getElementById('last-week-income').textContent = fmt$(data.last_week_income);
                document.getElementById('this-month-income').textContent = fmt$(data.this_month_income);
                document.getElementById('last-month-income').textContent = fmt$(data.last_month_income);
                document.getElementById('this-year-income').textContent = fmt$(data.this_year_income);
                document.getElementById('last-year-income').textContent = fmt$(data.last_year_income);

                // Encounters
                document.getElementById('today-encounters').textContent = data.today_encounters;
                document.getElementById('this-week-encounters').textContent = data.this_week_encounters;
                document.getElementById('last-week-encounters').textContent = data.last_week_encounters;
                document.getElementById('this-month-encounters').textContent = data.this_month_encounters;
                document.getElementById('last-month-encounters').textContent = data.last_month_encounters;
                document.getElementById('this-year-encounters').textContent = data.this_year_encounters;
                document.getElementById('last-year-encounters').textContent = data.last_year_encounters;

                // Per encounter (safe division)
                document.getElementById('today-per-patient').textContent = perEnc(data.today_income, data.today_encounters);
                document.getElementById('this-week-per-patient').textContent = perEnc(data.this_week_income, data.this_week_encounters);
                document.getElementById('last-week-per-patient').textContent = perEnc(data.last_week_income, data.last_week_encounters);
                document.getElementById('this-month-per-patient').textContent = perEnc(data.this_month_income, data.this_month_encounters);
                document.getElementById('last-month-per-patient').textContent = perEnc(data.last_month_income, data.last_month_encounters);
                document.getElementById('this-year-per-patient').textContent = perEnc(data.this_year_income, data.this_year_encounters);
                document.getElementById('last-year-per-patient').textContent = perEnc(data.last_year_income, data.last_year_encounters);

                // Procedure counts
                document.getElementById('today-code-173').textContent = parseFloat(data.today_code_173).toFixed(0);
                document.getElementById('this-week-code-173').textContent = parseFloat(data.this_week_code_173).toFixed(0);
                document.getElementById('last-week-code-173').textContent = parseFloat(data.last_week_code_173).toFixed(0);
                document.getElementById('this-month-code-173').textContent = parseFloat(data.this_month_code_173).toFixed(0);
                document.getElementById('last-month-code-173').textContent = parseFloat(data.last_month_code_173).toFixed(0);
                document.getElementById('this-year-code-173').textContent = parseFloat(data.this_year_code_173).toFixed(0);
                document.getElementById('last-year-code-173').textContent = parseFloat(data.last_year_code_173).toFixed(0);
                document.getElementById('today-code-17312').textContent = parseFloat(data.today_code_17312).toFixed(0);
                document.getElementById('this-week-code-17312').textContent = parseFloat(data.this_week_code_17312).toFixed(0);
                document.getElementById('last-week-code-17312').textContent = parseFloat(data.last_week_code_17312).toFixed(0);
                document.getElementById('this-month-code-17312').textContent = parseFloat(data.this_month_code_17312).toFixed(0);
                document.getElementById('last-month-code-17312').textContent = parseFloat(data.last_month_code_17312).toFixed(0);
                document.getElementById('this-year-code-17312').textContent = parseFloat(data.this_year_code_17312).toFixed(0);
                document.getElementById('last-year-code-17312').textContent = parseFloat(data.last_year_code_17312).toFixed(0);
                document.getElementById('today-code-cryo').textContent = parseFloat(data.today_code_cryo).toFixed(0);
                document.getElementById('this-week-code-cryo').textContent = parseFloat(data.this_week_code_cryo).toFixed(0);
                document.getElementById('last-week-code-cryo').textContent = parseFloat(data.last_week_code_cryo).toFixed(0);
                document.getElementById('this-month-code-cryo').textContent = parseFloat(data.this_month_code_cryo).toFixed(0);
                document.getElementById('last-month-code-cryo').textContent = parseFloat(data.last_month_code_cryo).toFixed(0);
                document.getElementById('this-year-code-cryo').textContent = parseFloat(data.this_year_code_cryo).toFixed(0);
                document.getElementById('last-year-code-cryo').textContent = parseFloat(data.last_year_code_cryo).toFixed(0);
                document.getElementById('today-code-111').textContent = parseFloat(data.today_code_111).toFixed(0);
                document.getElementById('this-week-code-111').textContent = parseFloat(data.this_week_code_111).toFixed(0);
                document.getElementById('last-week-code-111').textContent = parseFloat(data.last_week_code_111).toFixed(0);
                document.getElementById('this-month-code-111').textContent = parseFloat(data.this_month_code_111).toFixed(0);
                document.getElementById('last-month-code-111').textContent = parseFloat(data.last_month_code_111).toFixed(0);
                document.getElementById('this-year-code-111').textContent = parseFloat(data.this_year_code_111).toFixed(0);
                document.getElementById('last-year-code-111').textContent = parseFloat(data.last_year_code_111).toFixed(0);
                document.getElementById('today-code-88305').textContent = parseFloat(data.today_code_88305).toFixed(0);
                document.getElementById('this-week-code-88305').textContent = parseFloat(data.this_week_code_88305).toFixed(0);
                document.getElementById('last-week-code-88305').textContent = parseFloat(data.last_week_code_88305).toFixed(0);
                document.getElementById('this-month-code-88305').textContent = parseFloat(data.this_month_code_88305).toFixed(0);
                document.getElementById('last-month-code-88305').textContent = parseFloat(data.last_month_code_88305).toFixed(0);
                document.getElementById('this-year-code-88305').textContent = parseFloat(data.this_year_code_88305).toFixed(0);
                document.getElementById('last-year-code-88305').textContent = parseFloat(data.last_year_code_88305).toFixed(0);
            })
            .catch(error => console.error('Error fetching RVUs:', error));
    }

    // Function to update the Mohs summary table
    function updateMohsSummaryTable() {
        fetch('get_mohs_data.php')
            .then(response => response.json())
            .then(data => {
                // Stat cards
                document.getElementById('mohs-card-month-total').textContent = parseFloat(data.this_month_total).toFixed(0);
                document.getElementById('mohs-card-year-total').textContent = parseFloat(data.this_year_total).toFixed(0);
                document.getElementById('mohs-card-alltime-total').textContent = parseFloat(data.all_time_total).toFixed(0);
                document.getElementById('mohs-card-year-onestage').textContent = parseFloat(data.this_year_onestage).toFixed(1);
                document.getElementById('mohs-card-alltime-onestage').textContent = parseFloat(data.all_time_onestage).toFixed(1);

                document.getElementById('this-month-total').textContent = parseFloat(data.this_month_total).toFixed(0);
                document.getElementById('last-month-total').textContent = parseFloat(data.last_month_total).toFixed(0);
                document.getElementById('this-year-total').textContent = parseFloat(data.this_year_total).toFixed(0);
                document.getElementById('last-year-total').textContent = parseFloat(data.last_year_total).toFixed(0);
                document.getElementById('all-time-total').textContent = parseFloat(data.all_time_total).toFixed(0);
                document.getElementById('this-month-onestage').textContent = parseFloat(data.this_month_onestage).toFixed(1) + "%";
                document.getElementById('last-month-onestage').textContent = parseFloat(data.last_month_onestage).toFixed(1) + "%";
                document.getElementById('this-year-onestage').textContent = parseFloat(data.this_year_onestage).toFixed(1) + "%";
                document.getElementById('last-year-onestage').textContent = parseFloat(data.last_year_onestage).toFixed(1) + "%";
                document.getElementById('all-time-onestage').textContent = parseFloat(data.all_time_onestage).toFixed(1) + "%";
                document.getElementById('this-month-addon').textContent = parseFloat(data.this_month_addon).toFixed(1) + "%";
                document.getElementById('last-month-addon').textContent = parseFloat(data.last_month_addon).toFixed(1) + "%";
                document.getElementById('this-year-addon').textContent = parseFloat(data.this_year_addon).toFixed(1) + "%";
                document.getElementById('last-year-addon').textContent = parseFloat(data.last_year_addon).toFixed(1) + "%";
                document.getElementById('all-time-addon').textContent = parseFloat(data.all_time_addon).toFixed(1) + "%";  
                document.getElementById('this-month-CLC').textContent = parseFloat(data.this_month_CLC).toFixed(1) + "%";
                document.getElementById('last-month-CLC').textContent = parseFloat(data.last_month_CLC).toFixed(1) + "%";
                document.getElementById('this-year-CLC').textContent = parseFloat(data.this_year_CLC).toFixed(1) + "%";
                document.getElementById('last-year-CLC').textContent = parseFloat(data.last_year_CLC).toFixed(1) + "%";
                document.getElementById('all-time-CLC').textContent = parseFloat(data.all_time_CLC).toFixed(1) + "%";     
                document.getElementById('this-month-ILC').textContent = parseFloat(data.this_month_ILC).toFixed(1) + "%";
                document.getElementById('last-month-ILC').textContent = parseFloat(data.last_month_ILC).toFixed(1) + "%";
                document.getElementById('this-year-ILC').textContent = parseFloat(data.this_year_ILC).toFixed(1) + "%";
                document.getElementById('last-year-ILC').textContent = parseFloat(data.last_year_ILC).toFixed(1) + "%";
                document.getElementById('all-time-ILC').textContent = parseFloat(data.all_time_ILC).toFixed(1) + "%";     
                document.getElementById('this-month-flapclosure').textContent = parseFloat(data.this_month_flap).toFixed(1) + "%";
                document.getElementById('last-month-flapclosure').textContent = parseFloat(data.last_month_flap).toFixed(1) + "%";
                document.getElementById('this-year-flapclosure').textContent = parseFloat(data.this_year_flap).toFixed(1) + "%";
                document.getElementById('last-year-flapclosure').textContent = parseFloat(data.last_year_flap).toFixed(1) + "%";
                document.getElementById('all-time-flapclosure').textContent = parseFloat(data.all_time_flap).toFixed(1) + "%";     
                document.getElementById('this-month-FTSG').textContent = parseFloat(data.this_month_FTSG).toFixed(1) + "%";
                document.getElementById('last-month-FTSG').textContent = parseFloat(data.last_month_FTSG).toFixed(1) + "%";
                document.getElementById('this-year-FTSG').textContent = parseFloat(data.this_year_FTSG).toFixed(1) + "%";
                document.getElementById('last-year-FTSG').textContent = parseFloat(data.last_year_FTSG).toFixed(1) + "%";
                document.getElementById('all-time-FTSG').textContent = parseFloat(data.all_time_FTSG).toFixed(1) + "%";    
                document.getElementById('this-month-secondintent').textContent = parseFloat(data.this_month_secondintent).toFixed(1) + "%";
                document.getElementById('last-month-secondintent').textContent = parseFloat(data.last_month_secondintent).toFixed(1) + "%";
                document.getElementById('this-year-secondintent').textContent = parseFloat(data.this_year_secondintent).toFixed(1) + "%";
                document.getElementById('last-year-secondintent').textContent = parseFloat(data.last_year_secondintent).toFixed(1) + "%";
                document.getElementById('all-time-secondintent').textContent = parseFloat(data.all_time_secondintent).toFixed(1) + "%";      
                document.getElementById('this-month-BCC').textContent = parseFloat(data.this_month_BCC).toFixed(1) + "%";
                document.getElementById('last-month-BCC').textContent = parseFloat(data.last_month_BCC).toFixed(1) + "%";
                document.getElementById('this-year-BCC').textContent = parseFloat(data.this_year_BCC).toFixed(1) + "%";
                document.getElementById('last-year-BCC').textContent = parseFloat(data.last_year_BCC).toFixed(1) + "%";
                document.getElementById('all-time-BCC').textContent = parseFloat(data.all_time_BCC).toFixed(1) + "%";   
                document.getElementById('this-month-SCC').textContent = parseFloat(data.this_month_SCC).toFixed(1) + "%";
                document.getElementById('last-month-SCC').textContent = parseFloat(data.last_month_SCC).toFixed(1) + "%";
                document.getElementById('this-year-SCC').textContent = parseFloat(data.this_year_SCC).toFixed(1) + "%";
                document.getElementById('last-year-SCC').textContent = parseFloat(data.last_year_SCC).toFixed(1) + "%";
                document.getElementById('all-time-SCC').textContent = parseFloat(data.all_time_SCC).toFixed(1) + "%";                
                document.getElementById('this-month-other').textContent = parseFloat(data.this_month_other).toFixed(1) + "%";
                document.getElementById('last-month-other').textContent = parseFloat(data.last_month_other).toFixed(1) + "%";
                document.getElementById('this-year-other').textContent = parseFloat(data.this_year_other).toFixed(1) + "%";
                document.getElementById('last-year-other').textContent = parseFloat(data.last_year_other).toFixed(1) + "%";
                document.getElementById('all-time-other').textContent = parseFloat(data.all_time_other).toFixed(1) + "%";
                document.getElementById('this-month-me').textContent = parseFloat(data.this_month_me).toFixed(1) + "%";
                document.getElementById('last-month-me').textContent = parseFloat(data.last_month_me).toFixed(1) + "%";
                document.getElementById('this-year-me').textContent = parseFloat(data.this_year_me).toFixed(1) + "%";
                document.getElementById('last-year-me').textContent = parseFloat(data.last_year_me).toFixed(1) + "%";
                document.getElementById('all-time-me').textContent = parseFloat(data.all_time_me).toFixed(1) + "%";    
                document.getElementById('this-month-amanda').textContent = parseFloat(data.this_month_amanda).toFixed(1) + "%";
                document.getElementById('last-month-amanda').textContent = parseFloat(data.last_month_amanda).toFixed(1) + "%";
                document.getElementById('this-year-amanda').textContent = parseFloat(data.this_year_amanda).toFixed(1) + "%";
                document.getElementById('last-year-amanda').textContent = parseFloat(data.last_year_amanda).toFixed(1) + "%";
                document.getElementById('all-time-amanda').textContent = parseFloat(data.all_time_amanda).toFixed(1) + "%";   
                document.getElementById('this-month-outside').textContent = parseFloat(data.this_month_outside).toFixed(1) + "%";
                document.getElementById('last-month-outside').textContent = parseFloat(data.last_month_outside).toFixed(1) + "%";
                document.getElementById('this-year-outside').textContent = parseFloat(data.this_year_outside).toFixed(1) + "%";
                document.getElementById('last-year-outside').textContent = parseFloat(data.last_year_outside).toFixed(1) + "%";
                document.getElementById('all-time-outside').textContent = parseFloat(data.all_time_outside).toFixed(1) + "%";                 
            })
            .catch(error => console.error('Error fetching Mohs data:', error));
    }    
    

    // Event listener for code buttons
    document.querySelectorAll('.code-button').forEach(button => {
        button.addEventListener('click', function(event) {
            const code = event.target.dataset.code;
            fetchAndDisplayValue(code, true);
        });
    });

    // Event listener for multiplier input change
    document.getElementById('codeTable').addEventListener('input', function(event) {
        if (event.target.classList.contains('multiplier-input')) {
            let row = event.target.closest('tr');
            updateRowProductAndTotal(row);
            updateGrandTotal();
        }
    });

    // Event listener for reduction checkbox change
    document.getElementById('codeTable').addEventListener('change', function(event) {
        if (event.target.classList.contains('reduction-checkbox')) {
            let row = event.target.closest('tr');
            updateRowTotal(row);
            updateGrandTotal();
        }
    });

    // Event listener for form submission
    document.getElementById('codeForm').addEventListener('submit', function(event) {
        event.preventDefault();
        let code = document.getElementById('code').value.trim();
        if (code !== '') {
            fetchAndDisplayValue(code, false);
            document.getElementById('code').value = ''; // Clear input field after submission
            highlightCodeInput();
        } else {
            alert('Please enter a code.');
        }
    });

    // Event listener for approve button
    document.getElementById('approveButton').addEventListener('click', function() {
        const approveButton = this;
        let rows = document.querySelectorAll('#codeTable tbody tr');
        let inputsArray = [];

        rows.forEach(row => {
            let code = row.querySelector('td:nth-child(2)').textContent;
            let multiplier = parseInt(row.querySelector('.multiplier-input').value);

            for (let i = 0; i < multiplier; i++) {
                inputsArray.push(code);
            }
        });

        let inputs = inputsArray.join(',');

        let totalrvus = parseFloat(document.getElementById('grandTotal').textContent);
        let totalincome = totalrvus * 73;

        approveButton.disabled = true;
        const savePromise = editingEntryId !== null
            ? updateInDatabase(editingEntryId, inputs, totalrvus, totalincome, document.getElementById('edit-date').value)
            : saveToDatabase(inputs, totalrvus, totalincome);

        savePromise.finally(() => {
            approveButton.disabled = false;
            if (editingEntryId !== null) {
                clearEditingState();
            }
            loadRvuRecords();
        });

        // Clear the table
        let tableBody = document.querySelector('#codeTable tbody');
        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
        }

        // Reset the grand total
        document.getElementById('grandTotal').textContent = '0.00';

        // Clear radio buttons
        document.querySelectorAll('input[name="defaultCode"]').forEach(radio => {
            radio.checked = false;
        });

        // Clear checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
    });

    // Event listener for delete last entry button
    document.getElementById('deleteLastEntryButton').addEventListener('click', function() {
        deleteLastEntryFromDatabase();
    });

    // Function to delete the last entry from the database
    function deleteLastEntryFromDatabase() {
        fetch('delete_last_entry.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(response => response.text())
        .then(data => {
            document.getElementById('result').innerHTML = data;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('result').innerHTML = 'An error occurred while deleting the last entry.';
        });
    }
    
    // Event listener for delete last Mohs entry button
    document.getElementById('deleteLastMohsEntryButton').addEventListener('click', function() {
        deleteLastMohsEntryFromDatabase();
        loadRecords();
    });

    // Function to delete the last Mohs entry from the database
    function deleteLastMohsEntryFromDatabase() {
        fetch('delete_last_Mohs_entry.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(response => response.text())
        .then(data => {
            document.getElementById('mohs-result').innerHTML = data;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('mohs-result').innerHTML = 'An error occurred while deleting the last entry.';
        });
    }    

    // Fetch and display value function
    function fetchAndDisplayValue(code, isDefault) {
        fetch('lookup.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `code=${code}`
        })
        .then(response => response.text())
        .then(data => {
            if (data.startsWith('Value: ')) {
                let value = parseFloat(data.replace('Value: ', ''));
                addCodeToTable(code, value, isDefault);
                updateGrandTotal();
            } else {
                document.getElementById('result').innerHTML = data;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('result').innerHTML = 'An error occurred. Please try again.';
        });
    }

    // Add code to table function
    function addCodeToTable(code, value, isDefault, multiplier = 1) {
        let tableBody = document.querySelector('#codeTable tbody');
        let row = document.createElement('tr');
        row.setAttribute('data-code', isDefault ? 'default' : code); // Store code in data attribute

        let deleteCell = document.createElement('td');
        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.addEventListener('click', function() {
            deleteRow(row, value);
            updateGrandTotal();
        });
        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);

        let codeCell = document.createElement('td');
        codeCell.textContent = code;
        row.appendChild(codeCell);

        let valueCell = document.createElement('td');
        valueCell.textContent = value.toFixed(2);
        valueCell.classList.add('value-cell');
        row.appendChild(valueCell);

        let multiplierCell = document.createElement('td');
        let multiplierInput = document.createElement('input');
        multiplierInput.type = 'number';
        multiplierInput.value = multiplier;
        multiplierInput.classList.add('multiplier-input', 'small-input');
        multiplierCell.appendChild(multiplierInput);
        row.appendChild(multiplierCell);

        let productCell = document.createElement('td');
        let product = value * multiplier;
        productCell.textContent = product.toFixed(2);
        productCell.classList.add('product-cell');
        row.appendChild(productCell);

        let reductionCell = document.createElement('td');
        let reductionCheckbox = document.createElement('input');
        reductionCheckbox.type = 'checkbox';
        reductionCheckbox.classList.add('reduction-checkbox');
        reductionCell.appendChild(reductionCheckbox);
        row.appendChild(reductionCell);

        let totalCell = document.createElement('td');
        totalCell.textContent = product.toFixed(2);
        totalCell.classList.add('total-cell');
        row.appendChild(totalCell);

        tableBody.appendChild(row);
    }

    // Delete row function
    function deleteRow(row, value) {
        let tableBody = document.querySelector('#codeTable tbody');
        tableBody.removeChild(row);
        updateGrandTotal();
    }

    // Remove default code from table function
    function removeDefaultCodeFromTable() {
        let tableBody = document.querySelector('#codeTable tbody');
        let rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            if (row.getAttribute('data-code') === 'default') {
                tableBody.removeChild(row);
            }
        });
        updateGrandTotal();
    }

    // Remove code from table function
    function removeCodeFromTable(code) {
        let tableBody = document.querySelector('#codeTable tbody');
        let rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            if (row.children[1].textContent === code) {
                tableBody.removeChild(row);
            }
        });
        updateGrandTotal();
    }

    // Update row product and total function
    function updateRowProductAndTotal(row) {
        let valueCell = parseFloat(row.querySelector('.value-cell').textContent);
        let multiplier = parseFloat(row.querySelector('.multiplier-input').value);
        let product = valueCell * multiplier;
        row.querySelector('.product-cell').textContent = product.toFixed(2);
        updateRowTotal(row);
    }

    // Update row total function
    function updateRowTotal(row) {
        let product = parseFloat(row.querySelector('.product-cell').textContent);
        let reductionChecked = row.querySelector('.reduction-checkbox').checked;
        let total = reductionChecked ? product * 0.5 : product;
        row.querySelector('.total-cell').textContent = total.toFixed(2);
    }

    // Update grand total function
    function updateGrandTotal() {
        let total = 0;
        let totalCells = document.querySelectorAll('.total-cell');
        totalCells.forEach(cell => {
            total += parseFloat(cell.textContent);
        });
        document.getElementById('grandTotal').textContent = total.toFixed(2);
    }

    // Highlight code input function
    function highlightCodeInput() {
        let codeInput = document.getElementById('code');
        codeInput.focus();
        codeInput.select();
    }

    // Save to database function
    function saveToDatabase(inputs, totalrvus, totalincome) {
        return fetch('save_data.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `inputs=${inputs}&totalrvus=${totalrvus}&totalincome=${totalincome}`
        })
        .then(response => response.text())
        .then(data => {
            document.getElementById('result').innerHTML = data;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('result').innerHTML = 'An error occurred while saving data.';
        });
    }

    // Update existing entry in database
    function updateInDatabase(id, inputs, totalrvus, totalincome, date) {
        return fetch('update_rvu_entry.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id=${id}&inputs=${encodeURIComponent(inputs)}&totalrvus=${totalrvus}&totalincome=${totalincome}&date=${encodeURIComponent(date)}`
        })
        .then(response => response.text())
        .then(data => {
            document.getElementById('result').innerHTML = data;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('result').innerHTML = 'An error occurred while updating entry.';
        });
    }

    // Clear editing state
    function clearEditingState() {
        editingEntryId = null;
        document.getElementById('editing-banner').style.display = 'none';
        document.getElementById('approveButton').textContent = 'Approve';
        document.getElementById('enter-codes').classList.remove('editing-mode');
    }

    // Load an entry into the code table for editing
    function loadEntryForEdit(record) {
        // Clear current table
        const tableBody = document.querySelector('#codeTable tbody');
        while (tableBody.firstChild) tableBody.removeChild(tableBody.firstChild);
        document.getElementById('grandTotal').textContent = '0.00';

        // Count occurrences of each code in the comma-separated inputs string
        const codes = record.inputs.split(',').filter(c => c.trim() !== '');
        const codeCounts = {};
        codes.forEach(code => {
            const c = code.trim();
            codeCounts[c] = (codeCounts[c] || 0) + 1;
        });

        // Look up each unique code and add to table with correct multiplier
        const lookupPromises = Object.entries(codeCounts).map(([code, count]) =>
            fetch('lookup.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `code=${encodeURIComponent(code)}`
            })
            .then(r => r.text())
            .then(data => {
                if (data.startsWith('Value: ')) {
                    const value = parseFloat(data.replace('Value: ', ''));
                    addCodeToTable(code, value, false, count);
                }
            })
        );

        Promise.all(lookupPromises).then(() => {
            updateGrandTotal();
            editingEntryId = record.id;
            document.getElementById('edit-date').value = record.date.replace(' ', 'T').substring(0, 16);
            document.getElementById('editing-date').textContent = record.date;
            document.getElementById('editing-banner').style.display = 'flex';
            document.getElementById('approveButton').textContent = 'Update Entry';
            document.getElementById('enter-codes').classList.add('editing-mode');
            document.getElementById('codeTable').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // History modal open/close
    document.getElementById('historyButton').addEventListener('click', function() {
        loadRvuRecords();
        document.getElementById('history-modal').style.display = 'flex';
    });

    document.getElementById('closeHistoryModal').addEventListener('click', function() {
        document.getElementById('history-modal').style.display = 'none';
    });

    document.getElementById('history-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });

    // Cancel edit button
    document.getElementById('cancelEditButton').addEventListener('click', function() {
        const tableBody = document.querySelector('#codeTable tbody');
        while (tableBody.firstChild) tableBody.removeChild(tableBody.firstChild);
        document.getElementById('grandTotal').textContent = '0.00';
        clearEditingState();
    });

    // Mohs history modal open/close
    document.getElementById('mohsHistoryButton').addEventListener('click', function() {
        loadMohsRecords();
        document.getElementById('mohs-history-modal').style.display = 'flex';
    });

    document.getElementById('closeMohsHistoryModal').addEventListener('click', function() {
        document.getElementById('mohs-history-modal').style.display = 'none';
    });

    document.getElementById('mohs-history-modal').addEventListener('click', function(e) {
        if (e.target === this) this.style.display = 'none';
    });

    // Cancel Mohs edit
    document.getElementById('cancelMohsEditButton').addEventListener('click', function() {
        clearForm();
        clearMohsEditingState();
    });

    function clearMohsEditingState() {
        mohsEditingId = null;
        document.getElementById('mohs-editing-banner').style.display = 'none';
        document.querySelector('#mohsForm [type="submit"]').textContent = 'Submit';
        document.getElementById('mohsForm').classList.remove('editing-mode');
    }

    function loadMohsRecords() {
        fetch('getRecords.php')
            .then(r => r.json())
            .then(records => {
                const tbody = document.querySelector('#mohsRecordsTable tbody');
                tbody.innerHTML = '';
                records.forEach(record => {
                    const row = tbody.insertRow();
                    row.insertCell(0).textContent = record.date;
                    row.insertCell(1).textContent = record.name;
                    row.insertCell(2).textContent = record.site;
                    row.insertCell(3).textContent = record.diagnosis;
                    row.insertCell(4).textContent = record.stages;
                    row.insertCell(5).textContent = record.repair;
                    row.insertCell(6).textContent = record.referral;
                    const actionCell = row.insertCell(7);
                    const editBtn = document.createElement('button');
                    editBtn.textContent = 'Edit';
                    editBtn.addEventListener('click', () => {
                        document.getElementById('mohs-history-modal').style.display = 'none';
                        loadMohsEntryForEdit(record);
                    });
                    actionCell.appendChild(editBtn);
                });
            })
            .catch(e => console.error('Error loading Mohs records:', e));
    }

    function loadMohsEntryForEdit(record) {
        const diagnosisOptions = ['BCC','SCC','BSCC','AFX','Merkel','Sebaceous carcinoma'];
        const repairOptions    = ['CLC','ILC','Flap','FTSG','2nd','Refer'];
        const referralOptions  = ['Me','Amanda','Neelie','Scholes','Olmstead','Laurel','Stuart','VA'];

        document.getElementById('date').value    = record.date.split(' ')[0];
        document.getElementById('name').value    = record.name;
        document.getElementById('site').value    = record.site;
        document.getElementById('nyu').value     = record.NYU;
        document.getElementById('stages').value  = record.stages;
        document.getElementById('comments').value = record.comments;
        document.getElementById('addon').value   = record.addon;

        function setSelectOrOther(selectId, otherId, value, options) {
            if (options.includes(value)) {
                document.getElementById(selectId).value = value;
                document.getElementById(otherId).style.display = 'none';
                document.getElementById(otherId).value = '';
            } else {
                document.getElementById(selectId).value = 'other';
                document.getElementById(otherId).style.display = 'block';
                document.getElementById(otherId).value = value;
            }
        }

        setSelectOrOther('diagnosis', 'diagnosis-other', record.diagnosis, diagnosisOptions);
        setSelectOrOther('repair',    'repair-other',    record.repair,    repairOptions);
        setSelectOrOther('referral',  'referral-other',  record.referral,  referralOptions);

        mohsEditingId = record.id;
        document.getElementById('mohs-editing-name').textContent = record.name;
        document.getElementById('mohs-editing-banner').style.display = 'flex';
        document.querySelector('#mohsForm [type="submit"]').textContent = 'Update Entry';
        document.getElementById('mohsForm').classList.add('editing-mode');
        document.getElementById('name').focus();
    }

    // Load and display recent RVU entries
    function loadRvuRecords() {
        fetch('get_rvu_records.php')
            .then(response => response.json())
            .then(records => {
                const tbody = document.querySelector('#rvuRecordsTable tbody');
                tbody.innerHTML = '';
                records.forEach(record => {
                    const row = tbody.insertRow();
                    row.insertCell(0).textContent = record.date;
                    const codesCell = row.insertCell(1);
                    codesCell.textContent = record.inputs.length > 50
                        ? record.inputs.substring(0, 50) + '...'
                        : record.inputs;
                    codesCell.title = record.inputs;
                    row.insertCell(2).textContent = parseFloat(record.totalrvus).toFixed(1);
                    row.insertCell(3).textContent = parseFloat(record.totalincome).toFixed(2);
                    const actionCell = row.insertCell(4);
                    const editBtn = document.createElement('button');
                    editBtn.textContent = 'Edit';
                    editBtn.addEventListener('click', () => {
                        document.getElementById('history-modal').style.display = 'none';
                        loadEntryForEdit(record);
                    });
                    actionCell.appendChild(editBtn);
                });
            })
            .catch(error => console.error('Error loading RVU records:', error));
    }

});


            //PIN function to hide RVU summary content
            async function checkPin() {
            const pin = document.getElementById("pin").value;

            try {
                const response = await fetch('verify_pin.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `pin=${pin}`
                });

                const text = await response.text();

                if (text.trim() === 'success') {
                    document.getElementById("pin-input").style.display = "none";
                    document.getElementById("rvu-summary-content").style.display = "block";
                } else {
                    alert("Invalid PIN.");
                }
            } catch (error) {
                alert("Error with request.");
            }
        }
        
//function to load the most recent 10 records of the Mohs data        
function loadRecords() {
    fetch('getRecords.php')
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => { throw new Error(error.error); });
            }
            return response.json();
        })
        .then(data => {
            const table = document.getElementById('recordsTable');
            // Clear any existing rows (except the header)
            table.innerHTML = `
                <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Site</th>
                    <th>NYU</th>
                    <th>Diagnosis</th>
                    <th>Stages</th>
                    <th>Repair</th>
                    <th>Comments</th>
                    <th>Referral</th>
                    <th>Add/on</th>
                </tr>`;
            // Add new rows
            data.forEach(record => {
                const row = table.insertRow();
                row.insertCell(0).innerText = record.date;
                row.insertCell(1).innerText = record.name;
                row.insertCell(2).innerText = record.site;
                row.insertCell(3).innerText = record.NYU;
                row.insertCell(4).innerText = record.diagnosis;
                row.insertCell(5).innerText = record.stages;
                row.insertCell(6).innerText = record.repair;
                row.insertCell(7).innerText = record.comments;
                row.insertCell(8).innerText = record.referral;
                row.insertCell(9).innerText = record.addon;
            });
        })
        .catch(error => console.error('Error:', error.message));
}     



// Helper function to calculate day of the year from a date
function getDayOfYear(dateString) {
    const date = new Date(dateString);
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

// Initialize arrays with 365 null values (for days with no data)
function initializeArray(size, initialValue = null) {
    return Array.from({ length: size }, () => initialValue);
}


// Dashboard chart instances — destroyed and recreated on each tab visit
const _charts = {};
function _destroyChart(id) {
    if (_charts[id]) { _charts[id].destroy(); delete _charts[id]; }
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function monthLabel(yr, mo) {
    return MONTH_NAMES[mo - 1] + ' ' + String(yr).slice(2);
}

function loadDashboardCharts() {
    loadMonthlyIncomeChart();
    loadDailyIncomeChart();
    loadMohsVolumeChart();
}

function loadMonthlyIncomeChart() {
    fetch('get_monthly_income.php')
        .then(r => r.json())
        .then(data => {
            document.getElementById('chart-year-label').textContent = data.this_year_label;
            document.getElementById('chart-lastyear-label').textContent = data.last_year_label;
            _destroyChart('monthlyIncome');
            _charts['monthlyIncome'] = new Chart(
                document.getElementById('monthlyIncomeChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: MONTH_NAMES,
                    datasets: [
                        {
                            label: String(data.this_year_label),
                            data: data.this_year,
                            backgroundColor: 'rgba(0, 123, 255, 0.75)',
                            borderRadius: 3
                        },
                        {
                            label: String(data.last_year_label),
                            data: data.last_year,
                            backgroundColor: 'rgba(0, 123, 255, 0.2)',
                            borderRadius: 3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' } },
                    scales: {
                        y: {
                            ticks: {
                                callback: v => '$' + v.toLocaleString()
                            }
                        }
                    }
                }
            });
        })
        .catch(e => console.error('Monthly income chart error:', e));
}

function loadDailyIncomeChart() {
    fetch('get_daily_income_recent.php')
        .then(r => r.json())
        .then(rows => {
            const labels = rows.map(r => {
                const d = new Date(r.day + 'T00:00:00');
                return MONTH_NAMES[d.getMonth()] + ' ' + d.getDate();
            });
            const values = rows.map(r => r.income);
            _destroyChart('dailyIncome');
            _charts['dailyIncome'] = new Chart(
                document.getElementById('dailyIncomeChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Income',
                        data: values,
                        backgroundColor: 'rgba(0, 123, 255, 0.7)',
                        borderRadius: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { maxRotation: 45, font: { size: 10 } } },
                        y: { ticks: { callback: v => '$' + v.toLocaleString() } }
                    }
                }
            });
        })
        .catch(e => console.error('Daily income chart error:', e));
}


function loadMohsVolumeChart() {
    fetch('get_monthly_mohs_volume.php')
        .then(r => r.json())
        .then(rows => {
            const labels = rows.map(r => monthLabel(r.yr, r.mo));
            const values = rows.map(r => r.cases);
            _destroyChart('mohsVolume');
            _charts['mohsVolume'] = new Chart(
                document.getElementById('mohsVolumeChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Mohs Cases',
                        data: values,
                        backgroundColor: 'rgba(23,162,184,0.75)',
                        borderRadius: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { maxRotation: 45, font: { size: 10 } } },
                        y: { ticks: { stepSize: 1 } }
                    }
                }
            });
        })
        .catch(e => console.error('Mohs volume chart error:', e));
}

// ── Mohs Dashboard Charts ────────────────────────────────────────────────────

function loadMohsDashboardCharts() {
    // Fetch summary data once; pass to charts that need it
    fetch('get_mohs_data.php')
        .then(r => r.json())
        .then(data => {
            const thisYear = new Date().getFullYear();
            const lastYear = thisYear - 1;
            loadMohsClosureMixChart(data, thisYear, lastYear);
            loadMohsTumorMixChart(data);
        })
        .catch(e => console.error('Mohs dashboard data error:', e));

    loadMohsMonthlyCasesChart();
    loadMohsReferralChart();
    loadMohsOneStageChart();
    loadMohsRepairChart();
}

function loadMohsMonthlyCasesChart() {
    fetch('get_monthly_mohs_cases.php')
        .then(r => r.json())
        .then(data => {
            document.getElementById('mohs-chart-year-label').textContent = data.this_year_label;
            document.getElementById('mohs-chart-lastyear-label').textContent = data.last_year_label;
            _destroyChart('mohsMonthly');
            _charts['mohsMonthly'] = new Chart(
                document.getElementById('mohsMonthlyCasesChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: MONTH_NAMES,
                    datasets: [
                        {
                            label: String(data.this_year_label),
                            data: data.this_year,
                            backgroundColor: 'rgba(0, 150, 136, 0.8)',
                            borderRadius: 3
                        },
                        {
                            label: String(data.last_year_label),
                            data: data.last_year,
                            backgroundColor: 'rgba(0, 150, 136, 0.2)',
                            borderRadius: 3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' } },
                    scales: { y: { ticks: { stepSize: 1 } } }
                }
            });
        })
        .catch(e => console.error('Mohs monthly cases chart error:', e));
}

function loadMohsClosureMixChart(data, thisYear, lastYear) {
    document.getElementById('mohs-closure-year-label').textContent = thisYear;
    document.getElementById('mohs-closure-lastyear-label').textContent = lastYear;
    const labels = ['CLC', 'ILC', 'Flap', 'FTSG', '2nd'];
    const thisYearVals = [
        parseFloat(data.this_year_CLC),
        parseFloat(data.this_year_ILC),
        parseFloat(data.this_year_flap),
        parseFloat(data.this_year_FTSG),
        parseFloat(data.this_year_secondintent)
    ];
    const lastYearVals = [
        parseFloat(data.last_year_CLC),
        parseFloat(data.last_year_ILC),
        parseFloat(data.last_year_flap),
        parseFloat(data.last_year_FTSG),
        parseFloat(data.last_year_secondintent)
    ];
    _destroyChart('mohsClosure');
    _charts['mohsClosure'] = new Chart(
        document.getElementById('mohsClosureMixChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: String(thisYear),
                    data: thisYearVals,
                    backgroundColor: 'rgba(0, 150, 136, 0.8)',
                    borderRadius: 3
                },
                {
                    label: String(lastYear),
                    data: lastYearVals,
                    backgroundColor: 'rgba(0, 150, 136, 0.2)',
                    borderRadius: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                y: { ticks: { callback: v => v.toFixed(0) + '%' } }
            }
        }
    });
}

function loadMohsTumorMixChart(data) {
    const bcc   = parseFloat(data.this_year_BCC);
    const scc   = parseFloat(data.this_year_SCC);
    const other = parseFloat(data.this_year_other);
    _destroyChart('mohsTumor');
    _charts['mohsTumor'] = new Chart(
        document.getElementById('mohsTumorMixChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['BCC', 'SCC', 'Other'],
            datasets: [{
                data: [bcc, scc, other],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(201, 203, 207, 0.8)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' },
                tooltip: {
                    callbacks: {
                        label: ctx => ctx.label + ': ' + ctx.raw.toFixed(1) + '%'
                    }
                }
            }
        }
    });
}

function loadMohsReferralChart() {
    fetch('get_mohs_referral_breakdown.php')
        .then(r => r.json())
        .then(rows => {
            const thisYear = new Date().getFullYear();
            const lastYear = thisYear - 1;
            document.getElementById('mohs-referral-year-label').textContent = thisYear;
            document.getElementById('mohs-referral-lastyear-label').textContent = lastYear;

            const labels = rows.map(r => r.referral);

            const thisTotal = rows.reduce((s, r) => s + r.this_year, 0) || 1;
            const lastTotal = rows.reduce((s, r) => s + r.last_year, 0) || 1;
            const thisYearVals = rows.map(r => (r.this_year / thisTotal) * 100);
            const lastYearVals = rows.map(r => (r.last_year / lastTotal) * 100);

            _destroyChart('mohsReferral');
            _charts['mohsReferral'] = new Chart(
                document.getElementById('mohsReferralChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {
                            label: String(thisYear),
                            data: thisYearVals,
                            backgroundColor: 'rgba(0, 150, 136, 0.8)',
                            borderRadius: 3
                        },
                        {
                            label: String(lastYear),
                            data: lastYearVals,
                            backgroundColor: 'rgba(0, 150, 136, 0.2)',
                            borderRadius: 3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: {
                            callbacks: {
                                label: ctx => ctx.dataset.label + ': ' + ctx.raw.toFixed(1) + '%'
                            }
                        }
                    },
                    scales: {
                        y: {
                            max: 100,
                            ticks: { callback: v => v + '%' }
                        }
                    }
                }
            });
        })
        .catch(e => console.error('Mohs referral chart error:', e));
}

function loadMohsOneStageChart() {
    fetch('get_onestage_trend.php')
        .then(r => r.json())
        .then(data => {
            const windowSize = 200;
            const rolling = [];
            for (let i = windowSize - 1; i < data.length; i++) {
                const slice = data.slice(i - windowSize + 1, i + 1);
                const count = slice.filter(d => d.stages === '1').length;
                rolling.push({ date: data[i].date, pct: (count / windowSize) * 100 });
            }
            const labels = rolling.map(d => d.date);
            const values = rolling.map(d => d.pct);

            _destroyChart('mohsOneStage');
            _charts['mohsOneStage'] = new Chart(
                document.getElementById('mohsOneStageChart').getContext('2d'), {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: '1-Stage %',
                        data: values,
                        borderColor: 'rgba(0, 150, 136, 0.9)',
                        borderWidth: 2,
                        fill: false,
                        spanGaps: true,
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: {
                            title: { display: true, text: 'Year' },
                            ticks: {
                                callback: function(value, index, ticks) {
                                    const cur = new Date(labels[value] + 'T00:00:00');
                                    const prev = index > 0 ? new Date(labels[ticks[index - 1]?.value] + 'T00:00:00') : null;
                                    return (!prev || cur.getFullYear() !== prev.getFullYear()) ? cur.getFullYear() : '';
                                }
                            }
                        },
                        y: {
                            min: 0,
                            max: 100,
                            ticks: { callback: v => v + '%' }
                        }
                    }
                }
            });
        })
        .catch(e => console.error('1-stage trend chart error:', e));
}

function loadMohsRepairChart() {
    const rollingWindow = 200;

    function calcRollingProportions(data, windowSize) {
        const result = [];
        for (let i = windowSize - 1; i < data.length; i++) {
            const slice = data.slice(i - windowSize + 1, i + 1);
            const counts = {};
            slice.forEach(item => { counts[item.repair] = (counts[item.repair] || 0) + 1; });
            const total = slice.length;
            result.push({
                date: data[i].date,
                proportions: Object.fromEntries(
                    Object.entries(counts).map(([k, v]) => [k, v / total])
                )
            });
        }
        return result;
    }

    const REPAIR_COLORS = {
        'CLC':  'rgba(0, 150, 136, 0.9)',
        'ILC':  'rgba(255, 159, 64, 0.9)',
        'Flap': 'rgba(54, 162, 235, 0.9)',
        'FTSG': 'rgba(255, 99, 132, 0.9)',
        '2nd':  'rgba(153, 102, 255, 0.9)'
    };

    fetch('get_repair_data.php')
        .then(r => r.json())
        .then(data => {
            const rollingData  = calcRollingProportions(data, rollingWindow);
            const labels       = rollingData.map(d => d.date);
            const repairTypes  = [...new Set(data.map(d => d.repair))];
            const datasets     = repairTypes.map(type => ({
                label: type,
                data: rollingData.map(d => d.proportions[type] || 0),
                borderColor: REPAIR_COLORS[type] || 'rgba(128,128,128,0.9)',
                borderWidth: 2,
                fill: false,
                spanGaps: true,
                pointRadius: 0
            }));

            _destroyChart('mohsRepair');
            _charts['mohsRepair'] = new Chart(
                document.getElementById('repairChart').getContext('2d'), {
                type: 'line',
                data: { labels, datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' } },
                    scales: {
                        x: {
                            title: { display: true, text: 'Year' },
                            ticks: {
                                callback: function(value, index, ticks) {
                                    const cur  = new Date(labels[value]);
                                    const prev = index > 0 ? new Date(labels[ticks[index - 1].value]) : null;
                                    return (!prev || cur.getFullYear() !== prev.getFullYear()) ? cur.getFullYear() : '';
                                }
                            }
                        },
                        y: {
                            title: { display: true, text: 'Proportion' },
                            min: 0,
                            max: 1
                        }
                    }
                }
            });
        })
        .catch(e => console.error('Repair chart error:', e));
}

