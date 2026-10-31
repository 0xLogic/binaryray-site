const number = new Intl.NumberFormat('en-US');
const oneDecimal = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const $ = (id) => document.getElementById(id);
const put = (id, value) => { $(id).textContent = String(value); };
const pct = (part, whole) => whole ? `${oneDecimal.format(100 * part / whole)}%` : '0.0%';

function assertSnapshot(data) {
  if (data.schemaVersion !== 3) throw new Error('Unsupported coverage.json schema version.');
  const c = data.coverage;
  const s = data.snapshot;
  const v = data.validation;
  const p = data.porting;
  const values = [c.discovered, c.structured, c.listing, c.idaHeadsDiscovered,
    c.directNativeValidated, c.controlledNativeValidated, c.nativeValidatedDistinct,
    c.structuredWithoutNativeFixture, s.referenceHeads, v.directOriginalCases,
    v.controlledCases, v.ownedLineFunctionsChecked, v.ownedLineBytesChecked,
    v.ownedLineMismatches];
  if (!values.every(x => Number.isSafeInteger(x) && x >= 0)) throw new Error('Coverage counts are missing or invalid.');
  if (c.discovered !== c.structured + c.listing ||
      c.nativeValidatedDistinct !== c.directNativeValidated + c.controlledNativeValidated ||
      c.structured !== c.nativeValidatedDistinct + c.structuredWithoutNativeFixture ||
      c.structured > c.discovered || c.idaHeadsDiscovered > s.referenceHeads ||
      v.ownedLineFunctionsChecked !== c.structured || v.ownedLineMismatches !== 0) {
    throw new Error('Coverage counts are inconsistent.');
  }
  if (![s.buildSha256, s.targetSha256].every(x => /^[a-f0-9]{64}$/i.test(x))) {
    throw new Error('Build or target SHA-256 is missing.');
  }
  if (!p || ![p.manualHelperImplementations, p.nativeValidatedGeneratedExports,
      p.distinctMappedOriginalRvas, p.manualGeneratedOverlap, p.mappedSlices,
      p.compiledGeneratedExports, p.withoutValidatedExportParity]
      .every(x => Number.isSafeInteger(x) && x >= 0) ||
      !p.fullRax || !p.typedAl ||
      ![p.fullRax.compiledExports, p.fullRax.nativeValidatedExports,
        p.fullRax.nativeCases, p.typedAl.compiledExports,
        p.typedAl.nativeValidatedExports, p.typedAl.nativeCases]
        .every(x => Number.isSafeInteger(x) && x >= 0) ||
      p.fullRax.returnBitsCompared !== 64 || p.typedAl.returnBitsCompared !== 8 ||
      p.mappedSlices !== p.manualHelperImplementations + p.nativeValidatedGeneratedExports ||
      p.distinctMappedOriginalRvas !== p.mappedSlices - p.manualGeneratedOverlap ||
      p.compiledGeneratedExports !== p.fullRax.compiledExports + p.typedAl.compiledExports ||
      p.nativeValidatedGeneratedExports !== p.fullRax.nativeValidatedExports + p.typedAl.nativeValidatedExports ||
      p.withoutValidatedExportParity !== p.compiledGeneratedExports - p.nativeValidatedGeneratedExports ||
      p.fullRax.nativeValidatedExports > p.fullRax.compiledExports ||
      p.typedAl.nativeValidatedExports > p.typedAl.compiledExports ||
      ![p.fullRax.artifactSha256, p.typedAl.artifactSha256]
        .every(x => /^[a-f0-9]{64}$/i.test(x)) ||
      p.fullRax.artifactSha256 === p.typedAl.artifactSha256) {
    throw new Error('Porting counts or artifact SHA-256 are inconsistent.');
  }
  if (!Array.isArray(data.sizeBands) || !Array.isArray(data.limitations) || !data.sizeBands.length) {
    throw new Error('Coverage detail is missing.');
  }
}

function render(data) {
  assertSnapshot(data);
  const { coverage: c, snapshot: s, validation: v, porting: p } = data;
  put('snapshot-label', s.name);
  put('snapshot-target', s.target);
  put('discovered-count', number.format(c.discovered));
  put('structured-count', number.format(c.structured));
  put('listing-count', number.format(c.listing));
  put('native-count', number.format(c.nativeValidatedDistinct));
  put('discovered-context', `${number.format(c.idaHeadsDiscovered)} / ${number.format(s.referenceHeads)} reference heads found`);
  put('structured-context', `${pct(c.structured, c.discovered)} of discovered starts`);
  put('native-context', `${pct(c.nativeValidatedDistinct, c.structured)} of structured functions`);
  put('funnel-discovered', number.format(c.discovered));
  put('funnel-structured', number.format(c.structured));
  put('funnel-native', number.format(c.nativeValidatedDistinct));
  put('funnel-description', `${number.format(c.discovered)} starts lead to ${number.format(c.structured)} structured outputs. ${number.format(c.nativeValidatedDistinct)} of those have focused native fixtures.`);
  $('bar-structured').style.width = `${100 * c.structured / c.discovered}%`;
  $('bar-native').style.width = `${100 * c.nativeValidatedDistinct / c.discovered}%`;
  put('direct-count', number.format(c.directNativeValidated));
  put('controlled-count', number.format(c.controlledNativeValidated));
  put('direct-cases', `${number.format(v.directOriginalCases)} cases`);
  put('controlled-cases', `${number.format(v.controlledCases)} cases`);
  put('remaining-native', number.format(c.structuredWithoutNativeFixture));
  put('build-sha', s.buildSha256);
  put('target-sha', s.targetSha256);
  put('interface-count', number.format(v.ownedLineFunctionsChecked));
  put('interface-bytes', number.format(v.ownedLineBytesChecked));
  put('port-manual', number.format(p.manualHelperImplementations));
  put('port-validated', number.format(p.nativeValidatedGeneratedExports));
  put('port-mapped', number.format(p.distinctMappedOriginalRvas));
  put('port-compiled', number.format(p.compiledGeneratedExports));
  put('port-overlap', `${number.format(p.mappedSlices)} mapped slices; ${number.format(p.manualGeneratedOverlap)} overlapping RVAs`);
  put('port-unvalidated', p.withoutValidatedExportParity === 0 ?
      `All ${number.format(p.nativeValidatedGeneratedExports)} exports native-validated` :
      `${number.format(p.withoutValidatedExportParity)} without validated export parity`);
  put('port-full-count', number.format(p.fullRax.nativeValidatedExports));
  put('port-full-cases', number.format(p.fullRax.nativeCases));
  put('port-full-sha', p.fullRax.artifactSha256);
  put('port-typed-count', number.format(p.typedAl.nativeValidatedExports));
  put('port-typed-cases', number.format(p.typedAl.nativeCases));
  put('port-typed-sha', p.typedAl.artifactSha256);

  const tbody = $('size-bands');
  tbody.replaceChildren();
  for (const band of data.sizeBands) {
    if (![band.referenceHeads, band.discovered, band.structured].every(x => Number.isSafeInteger(x) && x >= 0) ||
        band.structured > band.discovered || band.discovered > band.referenceHeads) {
      throw new Error('A size band contains inconsistent counts.');
    }
    const row = document.createElement('tr');
    for (const value of [band.label, number.format(band.referenceHeads), number.format(band.discovered), number.format(band.structured), pct(band.structured, band.referenceHeads)]) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    }
    row.lastElementChild.className = 'rate';
    tbody.append(row);
  }
  const limits = $('limitations');
  limits.replaceChildren();
  for (const sentence of data.limitations) {
    const item = document.createElement('li');
    item.textContent = sentence;
    limits.append(item);
  }
}

for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', async () => {
    const value = $(button.dataset.copy).textContent;
    if (!/^[a-f0-9]{64}$/i.test(value)) return;
    try {
      await navigator.clipboard.writeText(value);
      const old = button.textContent;
      button.textContent = 'Copied';
      setTimeout(() => { button.textContent = old; }, 1800);
    } catch {
      button.textContent = 'Copy failed';
    }
  });
}

fetch('./coverage.json', { cache: 'no-cache' })
  .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
  .then(render)
  .catch(error => {
    const alert = $('load-error');
    alert.hidden = false;
    alert.textContent = `Coverage snapshot could not be loaded: ${error.message}. Serve this directory over HTTP and regenerate coverage.json from matching reports.`;
  });
