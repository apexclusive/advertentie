(() => {
  'use strict';

  /* ---------- Header, menu and reading progress (as on the homepage) ---------- */
  const header = document.getElementById('site-header');
  const menuButton = document.querySelector('.menu-button');
  const menu = document.getElementById('mobile-menu');
  const progress = document.getElementById('site-progress');
  let lastY = window.scrollY;

  function closeMenu() {
    if (!menu || !menuButton) return;
    menu.hidden = true;
    menuButton.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const open = menu.hidden;
      menu.hidden = !open;
      menuButton.classList.toggle('open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      if (open) menu.querySelector('a')?.focus();
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') { closeMenu(); menuButton.focus(); }
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 860) closeMenu(); }, { passive: true });
  }

  function onScroll() {
    const y = window.scrollY;
    const range = document.documentElement.scrollHeight - window.innerHeight;
    if (progress && range > 0) progress.style.transform = `scaleX(${Math.min(1, y / range)})`;
    if (header && y > 100 && y > lastY + 8) header.classList.add('is-hidden');
    if (header && (y < lastY - 8 || y < 24)) header.classList.remove('is-hidden');
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Advertentie scan ---------- */
  const form = document.getElementById('ad-form');
  const emptyState = document.getElementById('scan-empty');
  const output = document.getElementById('scan-output');
  const formStatus = document.getElementById('form-status');
  const scoreVal = document.getElementById('score-val');
  const scoreSub = document.getElementById('score-sub');
  const statFocus = document.getElementById('stat-focus-val');
  const statResponse = document.getElementById('stat-response-val');
  const statChecklist = document.getElementById('stat-checklist-val');
  const adCopyTitle = document.getElementById('ad-copy-title');
  const adCopyDesc = document.getElementById('ad-copy-desc');
  const adCopyPrice = document.getElementById('ad-copy-price');
  const adCopyMileage = document.getElementById('ad-copy-mileage');
  const adCopyFocus = document.getElementById('ad-copy-focus');
  const copyBtn = document.getElementById('copy-text-btn');
  const copyStatus = document.getElementById('copy-status');
  const marktplaatsBtn = document.getElementById('marktplaats-btn');
  const resetBtn = document.getElementById('reset-button');
  let generatedText = '';

  const nf = new Intl.NumberFormat('nl-NL');
  const normalizeNumber = value => nf.format(value);

  const buildAdvertText = values => {
    const summaryDescription = values.summaryRaw.includes('Goed onderhouden')
      ? 'systeematisch onderhouden, volledig gedocumenteerd en klaar voor verkoop'
      : values.summaryRaw.includes('prijs/kwaliteit') || values.summaryRaw.includes('prijs-kwaliteit')
      ? 'een uitstekende prijs-kwaliteitverhouding met betrouwbare technische staat'
      : values.summaryRaw.includes('comfortabele uitvoering')
      ? 'een comfortabele uitvoering met luxe extra’s en een verzorgde staat'
      : values.summaryRaw.toLowerCase();

    const opening = `Te koop: ${values.title} voor ${values.price}, ${values.mileage}.`;
    const details = `Deze auto is ${summaryDescription}.`;
    const photoLine = `De advertentie bevat ${values.photos} foto’s die duidelijk de staat, het interieur en de belangrijkste opties laten zien.`;
    const benefits = `De prijs is marktconform en de beschrijving spreekt vooral serieuze kopers aan.`;
    const cta = `Reageer snel op serieuze interesse en vermeld dat bezichtiging op afspraak mogelijk is. Plak deze tekst direct in uw advertentie.`;

    return `${opening}\n\n${details}\n\n${photoLine}\n\n${benefits}\n\n${cta}`;
  };

  const computeScore = values => {
    let score = 52;
    score += { '6': 8, '8': 12, '12': 16 }[values.photosRaw] ?? 10;
    score += { excellent: 14, good: 10, average: 6 }[values.conditionRaw] ?? 8;
    score += { ok: 10, pending: 4 }[values.titleStatusRaw] ?? 8;
    score += { service: 8, value: 6, comfort: 6 }[values.summaryKey] ?? 6;
    return Math.max(40, Math.min(100, Math.round(score)));
  };

  const focusFor = photosRaw => ({
    '6': { val: 'Foto-aantal', sub: 'Voeg heldere buiten- en interieurfoto’s toe' },
    '8': { val: 'Foto-kwaliteit', sub: 'Meer buiten- en interieurfoto’s' },
    '12': { val: 'Beschrijving', sub: 'Benoem opties en onderhoud concreet' }
  })[photosRaw] ?? { val: 'Foto-kwaliteit', sub: 'Meer buiten- en interieurfoto’s' };

  if (form) form.addEventListener('submit', event => {
    event.preventDefault();

    const title = document.getElementById('ad-title').value.trim() || 'Auto te koop';
    const price = normalizeNumber(Number(document.getElementById('price').value) || 0);
    const mileage = normalizeNumber(Number(document.getElementById('mileage').value) || 0);
    const photos = document.getElementById('photos').selectedOptions[0].textContent;
    const photosRaw = document.getElementById('photos').value;
    const conditionRaw = document.getElementById('condition').value;
    const titleStatusRaw = document.getElementById('title-status').value;
    const summarySel = document.getElementById('ad-summary');
    const summaryRaw = summarySel.selectedOptions[0].textContent;
    const summaryKey = summarySel.value;
    const summary = summaryRaw.toLowerCase();

    const values = { title, price: `€ ${price}`, mileage: `${mileage} km`, photos, summary, summaryRaw, photosRaw, conditionRaw, titleStatusRaw, summaryKey };

    const score = computeScore(values);
    const focus = focusFor(photosRaw);
    const response = score >= 90 ? 'Hoog' : score >= 75 ? 'Goed' : 'Beperkt';
    const verdict = score >= 85
      ? 'Sterke basis voor een professionele advertentie'
      : score >= 70
      ? 'Solide startpositie, met hier en daar een verbeterpunt'
      : 'Ruimte voor verbetering bij titel, foto’s en prijs';

    generatedText = buildAdvertText(values);

    scoreVal.textContent = score;
    scoreSub.textContent = verdict;
    statFocus.textContent = focus.val;
    statResponse.textContent = response;
    statChecklist.textContent = `${Math.max(4, Math.round(score / 10))}/10`;

    adCopyTitle.textContent = `Advertentietekst voor ${title}`;
    adCopyDesc.textContent = generatedText;
    adCopyPrice.textContent = `Vraagprijs: € ${price}`;
    adCopyMileage.textContent = `Kilometerstand: ${mileage} km`;
    adCopyFocus.textContent = `Focus: ${summary}`;

    emptyState.hidden = true;
    output.hidden = false;
    copyStatus.textContent = 'Uw advertentietekst is klaar. Kopieer en plak in Marktplaats.';
    formStatus.textContent = `Scan voltooid — score ${score}/100. ${focus.sub}.`;
    window.apexTrack?.('advertentie_scan_submit', { score });
  });

  if (copyBtn) copyBtn.addEventListener('click', async () => {
    if (!generatedText) {
      copyStatus.textContent = 'Genereer eerst de advertentietekst.';
      return;
    }
    try {
      await navigator.clipboard.writeText(generatedText);
      copyStatus.textContent = 'Advertentietekst gekopieerd naar klembord.';
    } catch (error) {
      copyStatus.textContent = 'Kopiëren lukte niet. Selecteer de tekst handmatig.';
    }
  });

  if (marktplaatsBtn) marktplaatsBtn.addEventListener('click', event => {
    if (!generatedText) {
      event.preventDefault();
      copyStatus.textContent = 'Genereer eerst de advertentietekst voordat u naar Marktplaats gaat.';
    }
  });

  if (resetBtn) resetBtn.addEventListener('click', () => {
    form?.reset();
    generatedText = '';
    output.hidden = true;
    emptyState.hidden = false;
    copyStatus.textContent = '';
    formStatus.textContent = 'Opnieuw begonnen. Vul de gegevens opnieuw in.';
  });

  /* ---------- Lead form (same flow as the homepage, mailto fallback) ---------- */
  const leadForm = document.getElementById('lead-form');
  if (leadForm) leadForm.addEventListener('submit', async event => {
    event.preventDefault();
    const status = document.getElementById('lead-form-status');
    const submit = leadForm.querySelector('button[type="submit"]');
    const data = new FormData(leadForm);
    if (data.get('website')) return;
    if (!leadForm.reportValidity()) { status.textContent = 'Vul uw naam, e-mailadres en uw vraag in.'; return; }
    const values = {
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      request: String(data.get('request') || '').trim(),
      website: '', brand: 'apex', source: 'advertentie-tool'
    };
    submit.disabled = true; leadForm.setAttribute('aria-busy', 'true'); status.textContent = 'Aanvraag wordt verzonden…';
    const fallback = `mailto:info@apexclusive.nl?subject=${encodeURIComponent('Advertentie hulp via APEXclusive Garage')}&body=${encodeURIComponent(`Naam: ${values.name}\nE-mail: ${values.email}\nTelefoon: ${values.phone || '-'}\n\nVraag:\n${values.request}`)}`;
    try {
      const response = await fetch('https://apexclusive.nl/api/apex-lead', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(values) });
      if (!response.ok) throw new Error('send failed');
      leadForm.reset(); status.textContent = 'Bedankt. Uw aanvraag is ontvangen. We nemen binnen 24 uur contact op.';
      window.apexTrack?.('lead_form_submit');
    } catch (_) {
      status.textContent = 'Uw e-mailprogramma wordt geopend…';
      window.location.href = fallback;
    } finally { submit.disabled = false; leadForm.removeAttribute('aria-busy'); }
  });

  /* ---------- APEXclusive Concierge (as on the homepage) ---------- */
  const aiLauncher = document.getElementById('ai-launcher');
  const aiPanel = document.getElementById('ai-panel');
  const aiForm = document.getElementById('ai-form');
  const aiInput = document.getElementById('ai-input');
  const aiMessages = document.getElementById('ai-messages');
  let aiHistory = [];
  function addAiMessage(text, role) { const node=document.createElement('div'); node.className=`ai-message ai-${role}`; node.textContent=text; aiMessages.appendChild(node); aiMessages.scrollTop=aiMessages.scrollHeight; }
  if (aiLauncher && aiPanel) {
    const toggleAi = () => { const open=aiPanel.hidden; aiPanel.hidden=!open; aiLauncher.setAttribute('aria-expanded',String(open)); if(open) aiInput?.focus(); };
    aiLauncher.addEventListener('click',toggleAi);
    aiPanel.querySelector('.ai-close').addEventListener('click',toggleAi);
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !aiPanel.hidden) { toggleAi(); aiLauncher.focus(); } });
    aiPanel.querySelectorAll('.ai-quick button').forEach(btn=>btn.addEventListener('click',()=>{aiInput.value=btn.textContent;aiForm.requestSubmit();}));
    aiForm.addEventListener('submit',async event=>{
      event.preventDefault();
      const question=aiInput.value.trim();
      if(!question)return;
      aiInput.value='';
      addAiMessage(question,'user');
      aiHistory.push({role:'user',content:question});
      const submit=aiForm.querySelector('button');
      submit.disabled=true;
      try{
        const response=await fetch('https://apexclusive.nl/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({brand:'apex',messages:aiHistory.slice(-12),toolContext:'advertentie-tips'})});
        const data=await response.json();
        const answer=data.reply||data.error||'Er ging iets mis. Neem gerust rechtstreeks contact op.';
        addAiMessage(answer,'bot');
        aiHistory.push({role:'assistant',content:answer});
      }catch(_){
        addAiMessage('De adviseur is tijdelijk niet bereikbaar. U kunt ons ook direct mailen via info@apexclusive.nl.','bot');
      }finally{submit.disabled=false;}
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
