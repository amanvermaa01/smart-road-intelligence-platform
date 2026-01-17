const { Client } = require('pg');

async function test() {
  const configs = [
    { user: 'rip_user', host: 'localhost', database: 'postgres', password: 'rip_pass', port: 5432 },
    { user: 'postgres', host: 'localhost', database: 'postgres', password: 'postgres', port: 5432 },
  ];

  for (const config of configs) {
    const client = new Client(config);
    try {
      await client.connect();
      console.log(`Connected with ${config.user}`);
      const res = await client.query('SELECT datname FROM pg_database');
      console.log('Databases:', res.rows.map(r => r.datname).join(', '));
      await client.end();
      return;
    } catch (err) {
      console.log(`Failed with ${config.user}: ${err.message}`);
    }
  }
}

test();
