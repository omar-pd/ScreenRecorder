document.getElementById('startBtn').addEventListener('click', async () => {
    try {
        // Use getDisplayMedia to capture video and audio
        const mediaStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
        });
        document.getElementById('preview').srcObject = mediaStream;
        startRecording(mediaStream);
    } catch (error) {
        console.error('Error starting capture:', error);
    }
});

let mediaRecorder;
let recordedChunks = [];

function startRecording(stream) {
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, {
            type: 'video/webm'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recording.webm';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };

    mediaRecorder.start();
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
}

document.getElementById('stopBtn').addEventListener('click', () => {
    mediaRecorder.stop();
    document.getElementById('preview').srcObject.getTracks().forEach(track => track.stop());
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
});
