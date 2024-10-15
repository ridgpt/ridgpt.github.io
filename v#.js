  async function loadContent() {
    try {
      const response = await fetch('v#.html');
      if (!response.ok) {
        throw new Error('Bad network response');
      }
      const html = await response.text();
      document.getElementById('version-number').innerHTML = html;
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  }

  loadContent();