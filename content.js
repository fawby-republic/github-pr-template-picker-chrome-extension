console.log("Github PR Template Picker: Starting.");

/**
 * Helper function: extract "owner/repo" from the URL path.
 * The pathname should be like "/owner/repo/..."
 */
function getRepoIdentifier() {
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts.length >= 2) {
    return `${pathParts[0]}/${pathParts[1]}`;
  }
  return null;
}

/**
 * The init() function builds the custom dropdown button and inserts it into the page.
 * @param {Object} repoTemplates - The mapping of repos to templates.
 */
function init(repoTemplates) {
  const currentRepo = getRepoIdentifier();
  console.log("Current repository:", currentRepo);

  if (!currentRepo || !repoTemplates[currentRepo]) {
    console.log("Github PR Template Picker: No templates configured for this repository.");
    return;
  }

  const options = repoTemplates[currentRepo];
  console.log("Templates for this repository:", options);

  // Get the selected template from the URL or default to "none"
  const urlParams = new URLSearchParams(window.location.search);
  let selectedValue = urlParams.get("template") || "none";

  // Create the container for our custom dropdown
  const container = document.createElement("div");
  container.className = "github-dropdown-container";

  // Create the button that displays the current selection
  const button = document.createElement("button");
  button.className = "github-dropdown-button";
  button.textContent = `template: ${selectedValue}`;

  // Create the dropdown menu that will contain the options
  const menu = document.createElement("div");
  menu.className = "github-dropdown-menu";
  menu.style.display = "none"; // hide initially

  // Create a combined list of options (starting with "none")
  const allOptions = ["none", ...options];
  allOptions.forEach(opt => {
    const item = document.createElement("div");
    item.className = "github-dropdown-item";
    item.textContent = `${opt}`;
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      // Update selected value and the button text
      selectedValue = opt;
      button.textContent = `template: ${opt}`;
      // Update the URL query parameter
      const url = new URL(window.location.href);
      url.searchParams.set("template", opt);
      window.location.href = url.toString();
      // Hide the menu
      menu.style.display = "none";
    });
    menu.appendChild(item);
  });

  // Toggle the dropdown menu when the button is clicked.
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.style.display = (menu.style.display === "none") ? "block" : "none";
  });

  // Close the dropdown if clicking anywhere else.
  document.addEventListener("click", () => {
    menu.style.display = "none";
  });

  // Build the custom dropdown by appending the button and menu to the container.
  container.appendChild(button);
  container.appendChild(menu);

  // Find an insertion point on the page.
  const possiblePlaces = [
    document.getElementsByClassName("range-editor js-range-editor")[0],
  ];

  console.log("Github PR Template Picker: Searching for insertion point.");
  const place = possiblePlaces.find(el => el);
  if (!place) {
    console.log("Github PR Template Picker: ERROR = insertion element not found.");
    return;
  }
  console.log("Github PR Template Picker: Insertion element found:", place);
  place.prepend(container);
}

/**
 * Loads the configuration from config.json and then calls init() with that data.
 */
function loadConfig() {
  const configUrl = chrome.runtime.getURL("config.json");
  fetch(configUrl)
    .then(response => response.json())
    .then(repoTemplates => {
      init(repoTemplates);
    })
    .catch(error => {
      console.error("Error loading config.json:", error);
    });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadConfig);
} else {
  loadConfig();
}
