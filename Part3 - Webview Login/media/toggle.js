(function () {

  // Function to handle label color changes based on toggle state
  function updateLabels(toggle, labelOff, labelOn) {
    if (toggle.checked) {
      labelOff.classList.remove('active-label');
      labelOn.classList.add('active-label');
      // Notify the extension about the toggle state
      vscode.postMessage({ command: 'toggleMode', showMode: false });
    } else {
      labelOn.classList.remove('active-label');
      labelOff.classList.add('active-label');
      // Notify the extension about the toggle state
      vscode.postMessage({ command: 'toggleMode', showMode: true });
    }
  }

  // Initialize the labels on load
  const toggles = document.querySelectorAll('.switch input');
  toggles.forEach(toggle => {
    const labelOff = document.getElementById(`label-off-${toggle.id.replace('toggle', '')}`);
    const labelOn = document.getElementById(`label-on-${toggle.id.replace('toggle', '')}`);

    // Initial label state
    updateLabels(toggle, labelOff, labelOn);

    // Update label colors and notify the extension when the toggle changes
    toggle.addEventListener('change', () => {
      updateLabels(toggle, labelOff, labelOn);
      console.log(`Toggle ${toggle.id} is now ${toggle.checked ? 'ON' : 'OFF'}`);
    });
  });

}());
