const tabs = document.querySelectorAll('.planet-tab');
const panels = document.querySelectorAll('.tabpanel-content');

tabs.forEach(tab => {
    // Dynamically inject the planet-name class to bind CSS styles
    const planet = tab.getAttribute('data-planet');
    if (planet) {
        tab.classList.add(planet);
    }

    tab.addEventListener("click", () => {
        // Reset all tabs
        tabs.forEach(t => {
            t.setAttribute("aria-selected", "false");
            t.classList.remove("active");
        });
        
        // Hide all panels
        panels.forEach(p => p.hidden = true);

        // Activate clicked tab
        tab.setAttribute("aria-selected", "true");
        tab.classList.add("active");
        
        // Show associated panel
        const associatedPanel = tab.getAttribute("aria-controls");
        const panel = document.getElementById(associatedPanel);
        if (panel) {
            panel.hidden = false;
        }
    });
});