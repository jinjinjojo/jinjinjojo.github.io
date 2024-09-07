// Function to capitalize names properly (e.g., 'john doe' -> 'John Doe')
function capitalizeName(name) {
    return name
        .toLowerCase()
        .split(' ')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

// Function to remove any commas or periods at the end of the name
function removeTrailingPunctuation(name) {
    return name.replace(/[,.]+$/, '');
}

// Function to remove any trailing spaces from the name
function removeTrailingSpaces(name) {
    return name.trimEnd();
}

// Function to extract emails from a line of text
function extractEmailFromText(text) {
    const emailPattern = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/;
    const match = emailPattern.exec(text);
    return match ? match[0] : null;
}

// Function to determine if a line is a potential name
function isPotentialName(line) {
    return line.length > 1 && !line.match(/^(Like|Reply|[0-9]+|[•]+|^$|^\s*$|^\S+@\S+)/) && !line.includes("Skip to");
}

// Function to clean and format name by removing "Like" at the beginning and everything after the first two words
function cleanName(name) {
    // Remove "Like " from the start of the name
    if (name.startsWith('Like ') || name.startsWith('like ')) {
        name = name.slice(5); // Remove the "Like " part
    }

    // If the name is "Like Load", ignore it
    if (name === 'Load' || name === 'load') {
        return ''; // Return empty string to indicate it should be ignored
    }

    // Clean up name to ensure only the first two parts are kept
    const parts = name.split(' ');
    if (parts.length <= 2) {
        return name.trim(); // If it has 2 words or less, return as is
    }

    return parts.slice(0, 2).join(' ').trim(); // Keep only the first two parts of the name
}

// Function to process the large text input
function processText(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let results = [];
    let currentName = '';
    let capturingName = true;

    lines.forEach((line) => {
        const email = extractEmailFromText(line);

        if (email) {
            if (currentName) {
                // Check if name starts with "Like" or is "Like Load"
                let formattedName = capitalizeName(cleanName(currentName));
                formattedName = removeTrailingPunctuation(formattedName);
                formattedName = removeTrailingSpaces(formattedName);

                if (formattedName) {
                    const nameParts = formattedName.split(' ');
                    const firstName = nameParts[0] || ''; // First name
                    const lastName = nameParts[1] || ''; // Last name (if available)
                    results.push({ email: email, firstName: firstName, lastName: lastName });
                }

                currentName = ''; // Reset currentName after adding to results
            }
            capturingName = false; // Email found, stop capturing name
        } else if (isPotentialName(line)) {
            if (capturingName) {
                currentName += (currentName ? ' ' : '') + line;
            }
        } else {
            // Reset capturingName if line doesn't seem like part of the name
            capturingName = true;
        }
    });

    if (currentName) {
        let formattedName = capitalizeName(cleanName(currentName));
        formattedName = removeTrailingPunctuation(formattedName);
        formattedName = removeTrailingSpaces(formattedName);

        if (formattedName) {
            const nameParts = formattedName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts[1] || '';
            results.push({ email: 'No email found', firstName: firstName, lastName: lastName });
        }
    }

    const totalContacts = results.length;
    const formattedData = formatForSpreadsheet(results);

    // Create and download the spreadsheet
    createAndDownloadSpreadsheet(results, totalContacts);
}

// Function to format data for easy pasting into Google Sheets
function formatForSpreadsheet(data) {
    if (data.length === 0) return [];
    return data.map(entry => ({
        email: entry.email,
        firstName: entry.firstName,
        lastName: entry.lastName,
    }));
}

// Function to create and download a spreadsheet
function createAndDownloadSpreadsheet(data, totalContacts) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data, { header: ["email", "firstName", "lastName"] });

    // Add headers to the sheet
    XLSX.utils.sheet_add_aoa(ws, [["Email Address", "First Name", "Last Name"]], { origin: "A1" });
    XLSX.utils.book_append_sheet(wb, ws, "Contacts");

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

    // Create a Blob and trigger a download
    const blob = new Blob([s2ab(wbout)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts_${totalContacts}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Reset button state
    const button = document.getElementById('processButton');
    button.classList.remove('opacity-50', 'cursor-not-allowed');
    button.disabled = false;
    document.getElementById('loadingSpinner').classList.add('hidden');
    document.getElementById('buttonText').innerText = 'Process Text';
}

// Function to convert string to ArrayBuffer
function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

// Function to handle the button click
function processButtonClicked() {
    const button = document.getElementById('processButton');
    const inputText = document.getElementById('inputText').value.trim();

    if (!inputText) {
        alert('Please input your text!');
        return;
    }

    button.classList.add('opacity-50', 'cursor-not-allowed');
    button.disabled = true;
    document.getElementById('loadingSpinner').classList.remove('hidden');
    document.getElementById('buttonText').innerText = 'Processing...';

    processText(inputText);
}
