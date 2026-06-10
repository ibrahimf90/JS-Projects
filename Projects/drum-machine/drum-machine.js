document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const drumPads = document.querySelectorAll('.drum-pad');

    // Audio Trigger Function
    const playAudio = (id, description) => {
        const audio = document.getElementById(id);
        const pad = audio.parentElement;

        // Reset and Play
        audio.currentTime = 0;
        audio.play().catch(err => console.log("Playback interaction required"));

        // Update Display
        display.innerText = description.replace(/-/g, ' ');

        // Visual Feedback
        pad.classList.add('active');
        setTimeout(() => {
            pad.classList.remove('active');
        }, 150);
    };

    // Click Event Listeners
    drumPads.forEach(pad => {
        pad.addEventListener('click', () => {
            const audioId = pad.querySelector('.clip').id;
            const description = pad.id;
            playAudio(audioId, description);
        });
    });

    // Keyboard Event Listeners
    document.addEventListener('keydown', (e) => {
        const key = e.key.toUpperCase();
        const audio = document.getElementById(key);

        if (audio && audio.classList.contains('clip')) {
            const pad = audio.parentElement;
            pad.click(); // Trigger the click event on the pad
        }
    });
});
