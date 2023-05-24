// Get references to the required elements from the HTML document
const busStopIdInput = document.getElementById('busStopId'); // Input field for bus stop ID
const filterDropdown = document.querySelector('.dropdown'); // Dropdown container element
const filterDropdownItems = document.querySelectorAll('#filter .dropdown-item'); // Dropdown items
const displayBus = document.getElementById('displayBus'); // Element to display bus arrival data
let currentFilter = ""; // Variable to store the current filter

// Hide the dropdown filter initially
filterDropdown.style.display = 'none';

// Add click event listeners to filter dropdown items
for (const item of filterDropdownItems) {
  item.addEventListener('click', function(event) {
    // prevent the default navigation or page reload that would normally occur when a filter dropdown item is clicked
    event.preventDefault();
    const filter = this.getAttribute('data-filter'); // Get the selected filter value from the clicked dropdown item

    // Remove 'active' class from all dropdown items
    for (const item of filterDropdownItems) {
      item.classList.remove('active');
    }

    // Add 'active' class to the clicked dropdown item
    this.classList.add('active');

    // Apply the selected filter
    applyFilter(filter);
  });
}

// Function to apply the selected filter
function applyFilter(filter) {
  currentFilter = filter; // Store the selected filter value
  const rows = displayBus.querySelectorAll('tbody > tr'); // Get all rows within the bus arrival data table

  // Loop through each row and show/hide based on the filter
  for (const row of rows) {
    const busId = row.getAttribute('data-bus-id'); // Get the bus ID associated with the row

    // Show the row if the filter is empty or the busId matches the filter
    if (filter === "" || busId === filter) {
      row.style.display = 'table-row'; // Show the row
    } else {
      row.style.display = 'none'; // Hide the row
    }
  }
}

// Function to fetch bus arrival data from an API
async function fetchBusArrival(busStopId) {
  const response = await fetch(`https://arrivelah2.busrouter.sg/?id=${busStopId}`); // Fetch the bus arrival data for the specified bus stop ID
  if (response.ok) {
    const arrivalData = await response.json(); // Convert the response to JSON
    return arrivalData;
  } else {
    throw new Error("Error fetching bus arrival data."); // Throw an error if the API request is not successful
  }
}

// Function to format the fetched arrival data into HTML table rows
function formatArrivalData(arrivalData) {
  const tbody = document.createElement('tbody'); // Create a new table body element
  const buses = arrivalData.services; // Get the array of bus services from the arrival data
  for (const bus of buses) {
    const busItem = document.createElement('tr'); // Create a new table row for each bus service
    busItem.setAttribute('data-bus-id', bus.no); // Add a data attribute to store the bus ID
    busItem.innerHTML += `
      <td class="text-center">${bus.no}</td>
      <td class="text-center">${bus.operator}</td>
    `;

    // Loop through the bus timings and add them as table cells
    const busTimings = [bus.next, bus.subsequent, bus.next2, bus.next3];
    for (let busTiming of busTimings) {
      let arrivalTimeString = 'No bus available';
      if (busTiming && busTiming.time) {
        let busTime = new Date(busTiming.time);
        let currentTime = new Date();
        let timeDiff = Math.round((busTime - currentTime) / 60000);
        arrivalTimeString = `${timeDiff} min(s)`;
      }
      busItem.innerHTML += `
        <td class="text-center">${arrivalTimeString}</td>
      `;
    }
    tbody.appendChild(busItem); // Add the bus row to the table body
  }

  return tbody; // Return the formatted table body
}

// Function to display the bus arrival data on the webpage
function displayBusArrival(busStopId) {
  displayBus.innerHTML = 'Loading...'; // Display a loading message while fetching the bus arrival data
  fetchBusArrival(busStopId)
    .then((arrivalData) => {
      const formattedArrivalData = formatArrivalData(arrivalData); // Format the fetched arrival data
      displayBus.innerHTML = ''; // Clear the previous contents of the display area
      const thead = document.createElement('thead'); // Create a new table head element
      thead.innerHTML = `
      <tr>
        <th class="text-center">Bus No</th>
        <th class="text-center">Operator</th>
        <th class="text-center">Next</th>
        <th class="text-center">Subsequent</th>
        <th class="text-center">Next2</th>
        <th class="text-center">Next3</th>
      </tr>
      `;
      displayBus.appendChild(thead); // Add the table head to the display area
      displayBus.appendChild(formattedArrivalData); // Add the formatted bus arrival data to the display area
      displayBus.style.display = 'table'; // Display the bus arrival data as a table
      filterDropdown.style.display = 'block'; // Show the dropdown filter after displaying the bus arrival data
      applyFilter(currentFilter); // Apply the filter again after updating the bus arrival data
    })
    .catch((error) => {
      console.error("Error:", error); // Log any errors that occur during the process
    });
}

// Function to get the bus timing based on the user input
function getBusTiming() {
  const busStopId = busStopIdInput.value; // Get the bus stop ID entered by the user
  displayBusArrival(busStopId); // Display the bus arrival data for the specified bus stop ID
}
