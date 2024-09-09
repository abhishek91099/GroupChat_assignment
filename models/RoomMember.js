import { DataTypes, Sequelize } from 'sequelize';
import sequelize from '../db_connect.js';


const RoomMember = sequelize.define('RoomMember', {
    room_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'rooms',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    joined_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
}, {
    tableName: 'room_members',
    timestamps: false,
});

// Define associations after model imports
// Room.belongsToMany(User, { through: RoomMember, foreignKey: 'room_id' });
// User.belongsToMany(Room, { through: RoomMember, foreignKey: 'user_id' });

export default RoomMember;
