/**
 * This file is just a silly example to show everything working in the browser.
 * When you're ready to start on your site, clear the file. Happy hacking!
 **/

import { envelopes } from './controllers/envelopes-controller';

const envelopeDiv =
  (document.getElementById('envelopeGrid') as HTMLDivElement) || undefined;

const showEnvelopesButton = document.getElementById('showEnvelopes');

showEnvelopesButton?.addEventListener('click', (event) => {
  event.preventDefault();
  for (const envelope of envelopes) {
    const envelopeItem = document.createElement('div');
    const envelopeTitle = document.createElement('h2');
    envelopeTitle.innerText = envelope.title;
    const envelopeBudget = document.createElement('p');
    envelopeBudget.innerText = envelope.budget.toString();
    envelopeItem.appendChild(envelopeTitle);
    envelopeItem.appendChild(envelopeBudget);
    envelopeDiv.append(envelopeItem);
  }
});
