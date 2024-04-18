document.addEventListener("DOMContentLoaded", function() {
  const entryTextarea = document.getElementById("entry");
  const saveButton = document.getElementById("saveBtn");
  const saveAudioButton = document.getElementById("saveAudioBtn");
  const deleteButton = document.getElementById("deleteBtn");
  const entriesContainer = document.getElementById("entries");
  const fontSelect = document.getElementById("fontSelect");
  const colorSelect = document.getElementById("colorSelect");
  const toggleEntriesButton = document.getElementById("toggleEntries");
  const startRecordingButton = document.getElementById("startRecording");
  const stopRecordingButton = document.getElementById("stopRecording");
  const recordedAudio = document.getElementById("recordedAudio");
  let mediaRecorder;
  let chunks = [];

  // Load existing entries from local storage
  let savedEntries = JSON.parse(localStorage.getItem("diaryEntries")) || [];

  // Display existing entries
  savedEntries.forEach(entry => {
    displayEntry(entry);
  });

  // Save entry to local storage
  saveButton.addEventListener("click", saveEntry);

  // Save audio to local storage
  saveAudioButton.addEventListener("click", saveEntry);

  // Delete current entry
  deleteButton.addEventListener("click", function() {
    if (confirm("Are you sure you want to delete this entry?")) {
      savedEntries.pop(); // Remove the last entry
      localStorage.setItem("diaryEntries", JSON.stringify(savedEntries));
      entriesContainer.removeChild(entriesContainer.firstChild); // Remove the displayed entry
    }
  });

  // Display entry in the entries container
  function displayEntry(entry) {
    const entryDiv = document.createElement("div");
    entryDiv.classList.add("entry-item");
    entryDiv.innerHTML = `
      <p><strong style="color: white">${entry.timestamp}</strong></p>
      <p style="font-family: ${entry.font}; color: ${entry.color};">${entry.text}</p>
      ${entry.image ? `<img src="${entry.image}" alt="Entry Image">` : ""}
      ${entry.audio ? `<audio controls><source src="${entry.audio}" type="audio/mpeg"></audio>` : ""}
    `;
    entriesContainer.prepend(entryDiv);
  }

  // Toggle display of previous entries
  toggleEntriesButton.addEventListener("click", function() {
    entriesContainer.style.display = entriesContainer.style.display === "none" ? "block" : "none";
  });

  // Change font
  fontSelect.addEventListener("change", function() {
    entryTextarea.style.fontFamily = fontSelect.value;
  });

  // Change text color
  colorSelect.addEventListener("input", function() {
    entryTextarea.style.color = colorSelect.value;
  });

  // Start audio recording
  startRecordingButton.addEventListener("click", function() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function(stream) {
        mediaRecorder = new MediaRecorder(stream);
        startRecordingButton.disabled = true;
        stopRecordingButton.disabled = false;
        chunks = [];
        mediaRecorder.ondataavailable = function(event) {
          chunks.push(event.data);
        }
        mediaRecorder.onstop = function() {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const audioURL = URL.createObjectURL(blob);
          recordedAudio.src = audioURL;
          recordedAudio.style.display = "block";
        }
        mediaRecorder.start();
      })
      .catch(function(err) {
        console.error('Error accessing microphone', err);
      });
  });

  // Stop audio recording
  stopRecordingButton.addEventListener("click", function() {
    mediaRecorder.stop();
    startRecordingButton.disabled = false;
    stopRecordingButton.disabled = true;
  });

  // Function to save entry (both text and audio)
  function saveEntry() {
    const entryText = entryTextarea.value;
    if (entryText.trim() !== "") {
      const entry = {
        text: entryText,
        timestamp: new Date().toLocaleString(),
        font: fontSelect.value,
        color: colorSelect.value,
        image: null,
        audio: recordedAudio.src
      };

      savedEntries.push(entry);
      localStorage.setItem("diaryEntries", JSON.stringify(savedEntries));
      displayEntry(entry);
      entryTextarea.value = "";
      recordedAudio.src = "";
      recordedAudio.style.display = "none";
      stopRecordingButton.disabled = true;
      startRecordingButton.disabled = false;
    } else {
      alert("Please write something before saving!");
    }
  }
});

