document.querySelector('.typeRegex button').addEventListener('click', () => {
    const regexInput = document.getElementById('regex').value;

    if (!regexInput) {
        alert('Please enter a regular expression.');
        return;
    }

    const formData = new URLSearchParams();
    formData.append('regex', regexInput);

    fetch('http://localhost:5000/generate-dfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to generate DFA graph.');
            }
            return response.blob();
        })
        .then((blob) => {
            const url = URL.createObjectURL(blob);
            const resultDiv = document.querySelector('.results');
            resultDiv.style.display = "block";
            resultDiv.innerHTML = `<h2>Result:</h2><img src="${url}" alt="DFA Graph" />`
        })
        .catch((error) => {
            console.error(error);
            alert('Error generating DFA graph. See console for details.');
        });
});

document.getElementById("dfa").addEventListener("change", function() {
    const formData = new FormData();
    formData.append("dfa_image", this.files[0]);  // Attach the image file

    fetch("http://localhost:5000/upload-dfa", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        const resultDiv = document.querySelector(".results");
        resultDiv.style.display = "block";
        if (data.regex) {
            resultDiv.innerHTML = `<h3>Extracted Regex:</h3> <p>${data.regex}</p>`;
        } else {
            resultDiv.innerHTML = `<h3>Error:</h3> <p>${data.error}</p>`;
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Failed to upload and process the image.");
    });
});