// Force settings via console
(function() {
    // Define the settings you want to force
    const settings = {
        gamma: 5,                     // Brightness
        volume: 0.2,                  // Sound volume (0-1)
        sensitivity: 1.49,            // Mouse sensitivity
        cl_crosshair_size: 'small',  // Crosshair size
        cl_crosshair_color: '0 0 0', // Crosshair color (RGB)
        cl_crosshair_translucent: 1,  // 1 = enabled
        wheel_jump_everywhere: 1,     // 1 = enabled
        net_optimization: 1,          // 1 = enabled
        minmodels: 1,                 // 1 = disable HD models/skins
        mp_decals: 0,                  // 0 = no bullet marks/blood
        _cl_autowepswitch: 0,         // 0 = don't auto-switch weapons
        hud_centerid: 1                // 1 = center player names
    };

    // Apply settings to the form (if needed)
    for (const [key, value] of Object.entries(settings)) {
        const el = document.querySelector(`[name="${key}"]`);
        if (!el) continue;

        if (el.type === 'checkbox') {
            el.checked = !!value;
        } else if (el.tagName.toLowerCase() === 'select') {
            el.value = value;
        } else {
            el.value = value;
        }

        // Update display for sliders/spans
        const span = document.getElementById(`${key}-show`);
        if (span) {
            if (key === 'volume') span.textContent = `${value * 100}%`;
            else span.textContent = value;
        }
    }

    console.log('All settings applied!');
})();
