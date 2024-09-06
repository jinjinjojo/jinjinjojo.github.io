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

// Function to clean and format name by removing everything after the first two spaces
function cleanName(name) {
    const parts = name.split(' ');
    if (parts.length <= 2) {
        return name.trim();
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
                let formattedName = capitalizeName(cleanName(currentName));
                formattedName = removeTrailingPunctuation(formattedName);
                formattedName = removeTrailingSpaces(formattedName);
                results.push({ email: email, name: formattedName });
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
        results.push({ email: 'No email found', name: formattedName });
    }

    const totalContacts = results.length;
    const formattedData = formatForSpreadsheet(results);
    
    downloadCSV(formattedData, `contacts_${totalContacts}.csv`);

    document.getElementById('result').innerText = `Formatted Data for Google Sheets (${totalContacts} total contacts):\n\n${formattedData}`;
}

// Function to format data for easy pasting into Google Sheets
function formatForSpreadsheet(data) {
    if (data.length === 0) return "No data found.";
    return data.map(entry => `${entry.email}\t${entry.name}`).join('\n');
}

// Function to trigger file download
function downloadCSV(data, filename) {
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Event listener for the button
document.getElementById('processButton').addEventListener('click', () => {
    const inputText = document.getElementById('inputText').value;
    processText(inputText);
});
