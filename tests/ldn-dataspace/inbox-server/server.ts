import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// CORS en JSON-LD body parsing
app.use(cors());
app.use(express.json({ type: 'application/ld+json' }));
app.use(express.json({ type: '*/*' })); // fallback

// Simpele LDN inbox endpoint
app.post('/inbox', (req, res) => {
    console.log('\n📥 [LDN Inbox] Received notification:');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('----------------------------------------\n');

    // Volgens LDN spec: 201 Created of 202 Accepted is voldoende
    res.status(202).json({ status: 'accepted' });
});

// Optioneel: root endpoint met discovery link (goed voor tooling)
app.get('/', (req, res) => {
    res.set('Link', '</inbox>; rel="http://www.w3.org/ns/ldp#inbox"');
    res.status(200).send(`
    <html>
      <head><title>LDN Test Inbox</title></head>
      <body>
        <h1>LDN Inbox</h1>
        <p>POST notifications to <code>/inbox</code>.</p>
        <p>Inbox URL: <a href="/inbox">http://localhost:3001/inbox</a></p>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
    console.log(`LDN Inbox server running at http://localhost:${PORT}`);
    console.log(`Inbox URL: http://localhost:${PORT}/inbox`);
});
