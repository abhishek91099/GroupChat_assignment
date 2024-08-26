import { pool } from './db_connect.js';
import bcrypt from 'bcrypt';


export async function saveMessage(room_id, user_id, message_text) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO messages (room_id, user_id, message_text) VALUES ($1, $2, $3) RETURNING *',
        [room_id, user_id, message_text]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }
  
  export async function getRoomMessages(room_id) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT messages.*, users.username 
         FROM messages 
         JOIN users ON messages.user_id = users.id 
         WHERE room_id = $1 
         ORDER BY sent_at ASC`,
        [room_id]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }
export async function handle_adduser(username, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
      [username, hashedPassword]
    );
    await client.query('COMMIT');
    return result.rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function handlelogin(username, password) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (await bcrypt.compare(password, user.password)) {
        return { id: user.id, username: user.username };
      }
    }
    return null;
  } finally {
    client.release();
  }
}

export async function handlelogout(userId) {
  // Implement any necessary logout logic (e.g., invalidating sessions)
}

export async function createRoom(room_name, admin_id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'INSERT INTO rooms (room_name, admin_id) VALUES ($1, $2) RETURNING *',
      [room_name, admin_id]
    );
    await client.query(
      'INSERT INTO room_members (room_id, user_id) VALUES ($1, $2)',
      [result.rows[0].id, admin_id]
    );
    await client.query('COMMIT');
    return result.rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function addMemberToRoom(room_id, username, admin_id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const roomResult = await client.query(
      'SELECT * FROM rooms WHERE id = $1 AND admin_id = $2',
      [room_id, admin_id]
    );
    if (roomResult.rows.length === 0) {
      throw new Error('Not authorized or room not found');
    }
    const userResult = await client.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    await client.query(
      'INSERT INTO room_members (room_id, user_id) VALUES ($1, $2)',
      [room_id, userResult.rows[0].id]
    );
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function deleteRoom(room_id, admin_id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'DELETE FROM rooms WHERE id = $1 AND admin_id = $2 RETURNING *',
      [room_id, admin_id]
    );
    if (result.rows.length === 0) {
      throw new Error('Not authorized or room not found');
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function removeMemberFromRoom(room_id, username, admin_id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const roomResult = await client.query(
      'SELECT * FROM rooms WHERE id = $1 AND admin_id = $2',
      [room_id, admin_id]
    );
    if (roomResult.rows.length === 0) {
      throw new Error('Not authorized or room not found');
    }
    const userResult = await client.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    await client.query(
      'DELETE FROM room_members WHERE room_id = $1 AND user_id = $2',
      [room_id, userResult.rows[0].id]
    );
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function changeRoomAdmin(room_id, new_admin_username, current_admin_id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const roomResult = await client.query(
      'SELECT * FROM rooms WHERE id = $1 AND admin_id = $2',
      [room_id, current_admin_id]
    );
    if (roomResult.rows.length === 0) {
      throw new Error('Not authorized or room not found');
    }
    const userResult = await client.query(
      'SELECT id FROM users WHERE username = $1',
      [new_admin_username]
    );
    if (userResult.rows.length === 0) {
      throw new Error('New admin user not found');
    }
    await client.query(
      'UPDATE rooms SET admin_id = $1 WHERE id = $2',
      [userResult.rows[0].id, room_id]
    );
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function getRoomMembers(room_id, user_id) {
  const client = await pool.connect();
  try {
    const memberResult = await client.query(
      'SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2',
      [room_id, user_id]
    );
    if (memberResult.rows.length === 0) {
      throw new Error('Not a member of this room');
    }
    const result = await client.query(
      'SELECT users.username FROM room_members JOIN users ON room_members.user_id = users.id WHERE room_id = $1',
      [room_id]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getRooms(user_id) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT rooms.* FROM rooms JOIN room_members ON rooms.id = room_members.room_id WHERE room_members.user_id = $1',
      [user_id]
    );
    return result.rows;
  } finally {
    client.release();
  }
}
export async function getallusers(){
  const client =await pool.connect()
  try{
    const query='SELECT id,username FROM users'
    const result=await client.query(query)
    return result.rows
  }
  finally{
    client.release()
  }
}