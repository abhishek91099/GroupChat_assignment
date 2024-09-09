import { DataTypes,Sequelize } from 'sequelize';
import sequelize from '../db_connect.js';
import User from './User.js';
import RoomMember from './RoomMember.js';

const Room = sequelize.define('Room', {
  id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
  },
  room_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
  },
  admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
          model: 'users',
          key: 'id',
      },
  },
  created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
}, {
  tableName: 'rooms',
  timestamps: false,
});

Room.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });
Room.belongsToMany(User, { through: RoomMember, foreignKey: 'room_id' });
User.belongsToMany(Room, { through: RoomMember, foreignKey: 'user_id' });


export default Room
