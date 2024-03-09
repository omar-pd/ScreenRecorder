const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

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

async function startRecording(stream) {
    if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
    }

    console.log("ffmpeg loaded, starting recording...");
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
            console.log("Data available from recorder...");
        }
    };

    mediaRecorder.onstop = async () => {
        console.log("Recorder stopped, processing data...");
        const blob = new Blob(recordedChunks, {
            type: 'video/webm'
        });
        const data = await blob.arrayBuffer();
        ffmpeg.FS('writeFile', 'recording.webm', new Uint8Array(data, 0, data.byteLength));
       // ffmpeg.FS('writeFile', 'recording.webm', new Uint8Array(data));


        // Convert WebM to MP4
        console.log("Converting to MP4...");
        await ffmpeg.run('-i', 'recording.webm', '-c', 'copy', 'recording.mp4');

        // Prepare the MP4 file for download
        const mp4Data = ffmpeg.FS('readFile', 'recording.mp4');
        const mp4Blob = new Blob([mp4Data.buffer], { type: 'video/mp4' });
        const mp4Url = URL.createObjectURL(mp4Blob);

        const a = document.createElement('a');
        a.href = mp4Url;
        a.download = 'recording.mp4';
        document.body.appendChild(a);
        a.click();
        // Clean up
        URL.revokeObjectURL(mp4Url);
        ffmpeg.FS('unlink', 'recording.webm');
        ffmpeg.FS('unlink', 'recording.mp4');    };

    mediaRecorder.start();
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
}

document.getElementById('stopBtn').addEventListener('click', () => {
    console.log("Stopping recording...");
    mediaRecorder.stop();
    document.getElementById('preview').srcObject.getTracks().forEach(track => track.stop());
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
});
