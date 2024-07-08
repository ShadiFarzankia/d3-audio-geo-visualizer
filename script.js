let mediaRecorder;
let audioChunks = [];
let audioBlob;

// Check for browser support
if ('webkitSpeechRecognition' in window && navigator.mediaDevices) {
    // Create a new instance of webkitSpeechRecognition
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true; // Enable continuous recognition
    recognition.interimResults = true; // Enable interim results

    // Set the recognition language to English
    recognition.lang = 'en-US';

    // Define the button and the display div using D3
    const recordButton = d3.select('#recordButton');
    const transcriptDisplay = d3.select('#transcriptDisplay');

    // Define a function to handle speech recognition
    recognition.onresult = function(event) {
        let interimTranscript = '';
        let finalTranscript = '';

        // Loop through the results
        for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
                finalTranscript += result[0].transcript;
            } else {
                interimTranscript += result[0].transcript;
            }
        }

        // Display the interim and final transcript
        transcriptDisplay.text(finalTranscript + interimTranscript);
        localStorage.setItem('voiceTranscript', finalTranscript); // Save only the final transcript to local storage
    };

    // Handle errors
    recognition.onerror = function(event) {
        console.error('Error occurred in recognition:', event.error);
    };

    // Function to start recording audio
    async function startRecording() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioChunks = []; // Clear the chunks for the next recording
            console.log('Audio Blob:', audioBlob);
        };

        mediaRecorder.start();
        recognition.start();
    }

    // Start recognition and audio recording on button click using D3
    recordButton.on('click', function() {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            recognition.stop();
        } else {
            startRecording();
        }
    });
} else {
    alert('Speech recognition not supported in this browser or audio recording not supported. Please use Chrome or another compatible browser.');
}
