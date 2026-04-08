document.addEventListener('DOMContentLoaded', () => {

  // Copyright dinamic
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Hamburger menu
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ── PIPEDRIVE INTEGRATION ──
  const PIPEDRIVE_TOKEN = '401be970631b3fdc46e4bdf3ccba2b79b4afa018';
  const PIPEDRIVE_BASE  = 'https://api.pipedrive.com/v1';

  async function sendToPipedrive(data) {
    // 1. Caută sau creează Person
    let personId = null;

    try {
      // Caută dacă există deja persoana cu emailul ăsta
      const searchRes = await fetch(
        `${PIPEDRIVE_BASE}/persons/search?term=${encodeURIComponent(data.email)}&fields=email&api_token=${PIPEDRIVE_TOKEN}`
      );
      const searchData = await searchRes.json();
      if (searchData.data?.items?.length > 0) {
        personId = searchData.data.items[0].item.id;
      }
    } catch (e) { console.warn('Search failed:', e); }

    // Dacă nu există, creează Person nou
    if (!personId) {
      const personRes = await fetch(`${PIPEDRIVE_BASE}/persons?api_token=${PIPEDRIVE_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: [{ value: data.email, primary: true }],
          org_name: data.company || undefined,
        })
      });
      const personData = await personRes.json();
      if (!personData.success) throw new Error('Person creation failed: ' + JSON.stringify(personData));
      personId = personData.data.id;
    }

    // 2. Creează Lead
    const leadRes = await fetch(`${PIPEDRIVE_BASE}/leads?api_token=${PIPEDRIVE_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `${data.name} — TVL Academy LP`,
        person_id: personId,
        note: [
          data.participants ? `Participanți estimați: ${data.participants}` : '',
          data.format       ? `Format preferat: ${data.format}` : '',
          data.message      ? `Mesaj: ${data.message}` : '',
        ].filter(Boolean).join('\n'),
      })
    });
    const leadData = await leadRes.json();
    if (!leadData.success) throw new Error('Lead creation failed: ' + JSON.stringify(leadData));
    return leadData;
  }
  }

});