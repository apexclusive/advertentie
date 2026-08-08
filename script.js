document.addEventListener('DOMContentLoaded', () => {
  const progress = document.getElementById('progress');

  const updateProgress = () => {
    const root = document.documentElement;
    const body = document.body;
    const scrollable = body.scrollHeight - window.innerHeight;
    const progressValue = scrollable > 0 ? (window.scrollY / scrollable) : 0;
    if (progress) {
      progress.style.transform = `scaleX(${Math.min(Math.max(progressValue, 0), 1)})`;
    }

    const header = document.querySelector('header');
    if (header && window.scrollY > 20) {
      header.classList.add('scrolled');
    } else if (header) {
      header.classList.remove('scrolled');
    }
  };

  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });

  const tips = Array.from(document.querySelectorAll('.tip-card'));
  tips.forEach((tip, index) => {
    tip.animate([
      { opacity: 0, transform: 'translateY(12px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], {
      delay: 150 * index,
      duration: 640,
      fill: 'forwards',
      easing: 'cubic-bezier(.2,.8,.2,1)'
    });
  });

  const form = document.getElementById('ad-form');
  const resultWrap = document.getElementById('result-wrap');
  const emptyState = document.getElementById('empty-state');
  const adCopyTitle = document.getElementById('ad-copy-title');
  const adCopyDesc = document.getElementById('ad-copy-desc');
  const adCopyMeta = document.getElementById('ad-copy-meta');
  const adCopyPrice = document.getElementById('ad-copy-price');
  const adCopyMileage = document.getElementById('ad-copy-mileage');
  const adCopyFocus = document.getElementById('ad-copy-focus');
  const copyTextBtn = document.getElementById('copy-text-btn');
  const copyStatus = document.getElementById('copy-status');
  const marktplaatsBtn = document.getElementById('marktplaats-btn');
  let generatedText = '';

  const normalizeNumber = (value) => new Intl.NumberFormat('nl-NL').format(value);

  const buildAdvertText = (values) => {
    const summaryDescription = values.summaryRaw.includes('Goed onderhouden')
      ? 'systeematisch onderhouden, volledig gedocumenteerd en klaar voor verkoop'
      : values.summaryRaw.includes('prijs/kwaliteit') || values.summaryRaw.includes('prijs-kwaliteit')
      ? 'uitstekende prijs-kwaliteitverhouding met betrouwbare technische staat'
      : values.summaryRaw.includes('comfortabele uitvoering')
      ? 'comfortabele uitvoering met luxe extra’s en een verzorgde staat'
      : values.summaryRaw;

    const opening = `Te koop: ${values.title} voor ${values.price}, ${values.mileage}.`;
    const details = `Deze auto is ${summaryDescription}.`;
    const photoLine = `De advertentie bevat ${values.photos} foto’s die duidelijk de staat, het interieur en de belangrijkste opties laten zien.`;
    const benefits = `De prijs is marktconform en de beschrijving spreekt vooral serieuze Marktplaats-kopers aan.`;
    const cta = `Reageer snel op serieuze interesse en vermeld dat bezichtiging op afspraak mogelijk is. Plak deze tekst direct in uw Marktplaats advertentie.`;

    return `${opening}\n\n${details}\n\n${photoLine}\n\n${benefits}\n\n${cta}`;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = document.getElementById('ad-title').value.trim() || 'Auto te koop';
    const price = normalizeNumber(Number(document.getElementById('price').value) || 0);
    const mileage = normalizeNumber(Number(document.getElementById('mileage').value) || 0);
    const photos = document.getElementById('photos').selectedOptions[0].textContent;
    const condition = document.getElementById('condition').selectedOptions[0].textContent.toLowerCase();
    const summaryRaw = document.getElementById('ad-summary').selectedOptions[0].textContent;
    const summary = summaryRaw.toLowerCase();

    generatedText = buildAdvertText({ title, price: `€ ${price}`, mileage: `${mileage} km`, condition, photos, summary, summaryRaw });
    adCopyTitle.textContent = `Advertentietekst voor ${title}`;
    adCopyDesc.textContent = generatedText;
    adCopyPrice.textContent = `Vraagprijs: € ${price}`;
    adCopyMileage.textContent = `Kilometerstand: ${mileage} km`;
    adCopyFocus.textContent = `Focus: ${summary}`;

    if (resultWrap) {
      resultWrap.hidden = false;
    }
    if (emptyState) {
      emptyState.style.display = 'none';
    }

    copyStatus.textContent = 'Uw advertentietekst is klaar. Kopieer en plak in Marktplaats.';
  });

  copyTextBtn.addEventListener('click', async () => {
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

  marktplaatsBtn.addEventListener('click', (event) => {
    if (!generatedText) {
      event.preventDefault();
      copyStatus.textContent = 'Genereer eerst de advertentietekst voordat u naar Marktplaats gaat.';
    }
  });
});
