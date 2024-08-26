
import pg from 'pg';

export const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Group_chat',
  password: 'root@123',
  port: 5432,
});



