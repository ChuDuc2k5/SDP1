import knex from 'knex';

const db = knex({
  client: 'pg', 
  connection: {
    host: 'aws-1-ap-northeast-2.pooler.supabase.com',
    port: 6543,
    user: 'postgres.sofhbcvvnkoexbyopeai',
    password: 'minhquan1112',
    database: 'postgres',
    ssl: { rejectUnauthorized: false } 
  },
  pool: { min: 0, max: 7 }
});

export default db; 