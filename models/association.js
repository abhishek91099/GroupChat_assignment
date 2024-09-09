import Room from './Room.js';
import User from './User.js';
import RoomMember from './RoomMember.js';
import Message from './Message.js';

// Define associations here
Room.belongsToMany(User, { through: RoomMember, foreignKey: 'room_id' });
User.belongsToMany(Room, { through: RoomMember, foreignKey: 'user_id' });

Message.belongsTo(Room, { foreignKey: 'room_id' });
Message.belongsTo(User, { foreignKey: 'user_id' });
// Export models with associations defined
export { Room, User, RoomMember,Message };
