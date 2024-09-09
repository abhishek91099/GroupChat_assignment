
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); 


const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl:false
  },
  define: {
    schema: 'chat'
  },
});
console.log(sequelize)

export default sequelize;