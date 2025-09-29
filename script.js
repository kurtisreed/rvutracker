document.addEventListener('DOMContentLoaded', function() {
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
                loadIncomeCumulativeChart();
            }

            if (button.dataset.tab === 'mohs-summary') {
                updateMohsSummaryTable();
                loadMohsCumulativeChart();
                loadRepairRollingChart();
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

        let formData = new FormData(this);
        
        // Get the user's entered date
        let userDate = document.getElementById('date').value;

        // Get the current time
        let now = new Date();
        let currentTime = now.toTimeString().slice(0, 8); // Get HH:MM:SS format

        // Combine the user's date with the current time
        let dateTime = userDate + ' ' + currentTime;

        formData.set('date', dateTime); // Replace the original date with the combined DATETIME

        fetch('submit_mohs.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            
            document.getElementById('mohs-result').innerHTML = data;
            clearForm(); // Clear the form fields
            document.getElementById('name').focus(); // Focus the Name field after submission
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('mohs-result').innerHTML = 'An error occurred while submitting the form.';
            document.getElementById('name').focus(); // Focus the Name field after error
        });
        loadRecords();
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
                

                const rvusMultiplier = 73; // Multiplier for RVUs to calculate income
                const income = {
                    today: parseFloat(data.today) * rvusMultiplier,
                    this_week: parseFloat(data.this_week) * rvusMultiplier,
                    last_week: parseFloat(data.last_week) * rvusMultiplier,
                    this_month: parseFloat(data.this_month) * rvusMultiplier,
                    last_month: parseFloat(data.last_month) * rvusMultiplier,
                    this_year: parseFloat(data.this_year) * rvusMultiplier,
                    last_year: parseFloat(data.last_year) * rvusMultiplier
                };

                document.getElementById('today-rvus').textContent = parseFloat(data.today).toFixed(1);
                document.getElementById('this-week-rvus').textContent = parseFloat(data.this_week).toFixed(1);
                document.getElementById('last-week-rvus').textContent = parseFloat(data.last_week).toFixed(1);
                document.getElementById('this-month-rvus').textContent = parseFloat(data.this_month).toFixed(1);
                document.getElementById('last-month-rvus').textContent = parseFloat(data.last_month).toFixed(1);
                document.getElementById('this-year-rvus').textContent = parseFloat(data.this_year).toFixed(1);
                document.getElementById('last-year-rvus').textContent = parseFloat(data.last_year).toFixed(1);
                document.getElementById('today-encounters').textContent = parseFloat(data.today_encounters).toFixed(0);
                document.getElementById('this-week-encounters').textContent = parseFloat(data.this_week_encounters).toFixed(0);
                document.getElementById('last-week-encounters').textContent = parseFloat(data.last_week_encounters).toFixed(0);
                document.getElementById('this-month-encounters').textContent = parseFloat(data.this_month_encounters).toFixed(0);
                document.getElementById('last-month-encounters').textContent = parseFloat(data.last_month_encounters).toFixed(0);
                document.getElementById('this-year-encounters').textContent = parseFloat(data.this_year_encounters).toFixed(0);
                document.getElementById('last-year-encounters').textContent = parseFloat(data.last_year_encounters).toFixed(0);
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

                // Update Income
                document.getElementById('today-income').textContent = parseFloat(data.today_income).toFixed(2);
                document.getElementById('this-week-income').textContent = parseFloat(data.this_week_income).toFixed(2);
                document.getElementById('last-week-income').textContent = parseFloat(data.last_week_income).toFixed(2);
                document.getElementById('this-month-income').textContent = parseFloat(data.this_month_income).toFixed(2);
                document.getElementById('last-month-income').textContent = parseFloat(data.last_month_income).toFixed(2);
                document.getElementById('this-year-income').textContent = parseFloat(data.this_year_income).toFixed(2);
                document.getElementById('last-year-income').textContent = parseFloat(data.last_year_income).toFixed(2);

                // Update Per Patient values
                document.getElementById('today-per-patient').textContent = (income.today / data.today_encounters).toFixed(2);
                document.getElementById('this-week-per-patient').textContent = (income.this_week / data.this_week_encounters).toFixed(2);
                document.getElementById('last-week-per-patient').textContent = (income.last_week / data.last_week_encounters).toFixed(2);
                document.getElementById('this-month-per-patient').textContent = (income.this_month / data.this_month_encounters).toFixed(2);
                document.getElementById('last-month-per-patient').textContent = (income.last_month / data.last_month_encounters).toFixed(2);
                document.getElementById('this-year-per-patient').textContent = (income.this_year / data.this_year_encounters).toFixed(2);
                document.getElementById('last-year-per-patient').textContent = (income.last_year / data.last_year_encounters).toFixed(2);
            })
            .catch(error => console.error('Error fetching RVUs:', error));
    }

    // Function to update the Mohs summary table
    function updateMohsSummaryTable() {
        fetch('get_mohs_data.php')
            .then(response => response.json())
            .then(data => {
                console.log(data);


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

        saveToDatabase(inputs, totalrvus, totalincome);

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
    function addCodeToTable(code, value, isDefault) {
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
        multiplierInput.value = '1';
        multiplierInput.classList.add('multiplier-input', 'small-input');
        multiplierCell.appendChild(multiplierInput);
        row.appendChild(multiplierCell);

        let productCell = document.createElement('td');
        let product = value * 1; // Default multiplier is 1
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
        fetch('save_data.php', {
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

// Function to load Mohs cumulative chart
function loadMohsCumulativeChart() {
    fetch('getCumulativeMohsData.php')
        .then(response => response.json())
        .then(data => {
        // Initialize arrays for cumulative counts for 365 days
        let cumulativeCountsThisYear = initializeArray(365);
        let cumulativeCountsLastYear = initializeArray(365);

        let totalThisYear = 0;
        let totalLastYear = 0;

        // Process the data for this year
        data.this_year.forEach(entry => {
            const dayOfYear = getDayOfYear(entry.entry_date);
            totalThisYear += parseInt(entry.entry_count);
            cumulativeCountsThisYear[dayOfYear - 1] = totalThisYear; // dayOfYear - 1 because array is 0-indexed
        });

        // Process the data for last year
        data.last_year.forEach(entry => {
            const dayOfYear = getDayOfYear(entry.entry_date);
            totalLastYear += parseInt(entry.entry_count);
            cumulativeCountsLastYear[dayOfYear - 1] = totalLastYear; // dayOfYear - 1 because array is 0-indexed
        });

        // Create the chart
        const ctx = document.getElementById('cumulativeChart').getContext('2d');
        const cumulativeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({ length: 365 }, (_, i) => i + 1), // Days 1 to 365
                datasets: [
                    {
                        label: 'Cumulative Mohs This Year',
                        data: cumulativeCountsThisYear,
                        borderColor: 'rgba(75, 192, 192, 1)', // Color for this year
                        borderWidth: 2,
                        fill: false,
                        spanGaps: true, // Allow gaps where data is missing
                        pointRadius: 0
                    },
                    {
                        label: 'Cumulative Mohs Last Year',
                        data: cumulativeCountsLastYear,
                        borderColor: 'rgba(255, 99, 132, 1)', // Different color for last year
                        borderWidth: 2,
                        fill: false,
                        spanGaps: true, // Allow gaps where data is missing
                        pointRadius: 0
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        type: 'linear', // Linear scale for day numbers
                        title: {
                            display: true,
                            text: 'Day of the Year'
                        },
                        ticks: {
                            stepSize: 30 // Adjust tick steps if necessary (e.g., every 30 days)
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Cumulative Mohs'
                        }
                    }
                }
            }
        });
    })
    .catch(error => console.error('Error fetching cumulative Mohs data:', error));
}

// Function to load income cumulative chart
function loadIncomeCumulativeChart() {
    fetch('getDataForIncome.php')
        .then(response => response.json())
        .then(data => {
        // Initialize arrays for cumulative income for 365 days
        let cumulativeIncomeThisYear = initializeArray(365);
        let cumulativeIncomeLastYear = initializeArray(365);

        let totalIncomeThisYear = 0;
        let totalIncomeLastYear = 0;

        // Process the data for this year
        data.this_year.forEach(entry => {
            const dayOfYear = getDayOfYear(entry.entry_date);
            totalIncomeThisYear += parseFloat(entry.total_income); // Summing the totalincome
            cumulativeIncomeThisYear[dayOfYear - 1] = totalIncomeThisYear; // dayOfYear - 1 because array is 0-indexed
        });

        // Process the data for last year
        data.last_year.forEach(entry => {
            const dayOfYear = getDayOfYear(entry.entry_date);
            totalIncomeLastYear += parseFloat(entry.total_income); // Summing the totalincome
            cumulativeIncomeLastYear[dayOfYear - 1] = totalIncomeLastYear; // dayOfYear - 1 because array is 0-indexed
        });

        // Create the chart
        const ctx = document.getElementById('cumulativeIncomeChart').getContext('2d');
        const cumulativeIncomeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({ length: 365 }, (_, i) => i + 1), // Days 1 to 365
                datasets: [
                    {
                        label: 'Cumulative Total Income This Year',
                        data: cumulativeIncomeThisYear,
                        borderColor: 'rgba(75, 192, 192, 1)', // Color for this year
                        borderWidth: 2,
                        fill: false,
                        spanGaps: true, // Allow gaps where data is missing
                        pointRadius: 0 // Hide the data points (circles)
                    },
                    {
                        label: 'Cumulative Total Income Last Year',
                        data: cumulativeIncomeLastYear,
                        borderColor: 'rgba(255, 99, 132, 1)', // Different color for last year
                        borderWidth: 2,
                        fill: false,
                        spanGaps: true, // Allow gaps where data is missing
                        pointRadius: 0 // Hide the data points (circles)
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        type: 'linear', // Linear scale for day numbers
                        title: {
                            display: true,
                            text: 'Day of the Year'
                        },
                        ticks: {
                            stepSize: 30 // Adjust tick steps if necessary (e.g., every 30 days)
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Cumulative Total Income'
                        }
                    }
                }
            }
        });
    })
    .catch(error => console.error('Error fetching income data:', error));
}

// Function to load repair rolling chart
function loadRepairRollingChart() {
    const rollingWindow = 200;

// Function to calculate rolling proportions
function calculateRollingProportions(data, windowSize) {
    const rollingData = [];
    for (let i = 0; i < data.length; i++) {
        if (i >= windowSize - 1) {
            const windowSlice = data.slice(i - windowSize + 1, i + 1);
            const repairCounts = {};
            windowSlice.forEach(item => {
                repairCounts[item.repair] = (repairCounts[item.repair] || 0) + 1;
            });
            const total = windowSlice.length;
            rollingData.push({
                date: data[i].date,
                proportions: Object.keys(repairCounts).reduce((acc, repair) => {
                    acc[repair] = repairCounts[repair] / total;
                    return acc;
                }, {})
            });
        }
    }
    return rollingData;
}

// Fetch data from the PHP script
fetch('get_repair_data.php')
    .then(response => response.json())
    .then(data => {
        // Calculate rolling proportions
        const rollingData = calculateRollingProportions(data, rollingWindow);

        // Prepare chart data
        const labels = rollingData.map(item => item.date);
        const repairTypes = [...new Set(data.map(item => item.repair))];
        const datasets = repairTypes.map(type => ({
            label: type,
            data: rollingData.map(item => item.proportions[type] || 0),
            borderColor: getRandomColor(),
                        borderWidth: 2,
                        fill: false,
                        spanGaps: true, // Allow gaps where data is missing
                        pointRadius: 0 // Hide the data points (circles)
        }));

        // Create the chart
        const ctx = document.getElementById('repairChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Year' },
                        ticks: {
                            callback: function(value, index, ticks) {
                                // Show year only if it's the first tick of a new year
                                const currentDate = new Date(labels[value]);
                                const previousDate = index > 0 ? new Date(labels[ticks[index - 1].value]) : null;

                                if (!previousDate || currentDate.getFullYear() !== previousDate.getFullYear()) {
                                    return currentDate.getFullYear();
                                }
                                return '';
                            },
                        },
                    },
                    y: {
                        title: { display: true, text: 'Proportion' },
                        min: 0,
                        max: 1
                    }
                }
            }
        });
    });

    // Function to generate random colors for lines
    function getRandomColor() {
        return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`;
    }
}

