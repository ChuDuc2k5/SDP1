import knex from 'knex';

const db=knex({
    client:'mysql',
    connection:{
        host:'aws-1-ap-northeast-2.pooler.supabase.com',
        port:6543,
        user:'postgres.sofhbcvvnkoexbyopeai',
        password:'minhquan1112',
        database:'postgres'
    },
    pool: { min: 0, max: 7 }

})