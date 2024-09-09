import { DataTypes,Sequelize } from 'sequelize';
import sequelize from '../db_connect.js';
import User from './User.js';
import Room from './Room.js';
const Message = sequelize.define('Message', {
  id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
  },
  room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
          model: 'rooms',
          key: 'id',
      },
      onDelete: 'CASCADE',
  },
  user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
          model: 'users',
          key: 'id',
      },
      onDelete: 'CASCADE',
  },
  message_text: {
      type: DataTypes.TEXT,
      allowNull: false,
  },
  sent_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
}, {
  tableName: 'messages',
  timestamps: false,
});

Message.belongsTo(Room, { foreignKey: 'room_id' });
Message.belongsTo(User, { foreignKey: 'user_id' });

export default Message
