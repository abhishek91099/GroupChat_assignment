
import { Sequelize } from 'sequelize';

const connectionString = "postgresql://postgres:root%40123@localhost:5432/Group_chat";


const sequelize = new Sequelize(connectionString, {
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