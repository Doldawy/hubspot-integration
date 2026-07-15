const fetch = require('node-fetch');

const HUBSPOT_TOKEN = 'YOUR_ACCESS_TOKEN';

async function getContacts() {
  const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` }
  });
  const data = await res.json();
  console.log(data);
}

getContacts();
