/* eslint-disable no-unused-vars */
const mongodb = require('mongodb')

const { ObjectId } = mongodb

const initialUsers = [
  {
    _id: new ObjectId('000000000000000000000000'),
    username: 'pedro',
    email: 'admin@baseapinode.com',
    password: '$2a$10$J3Qa3YiZTxXBX7NsSXMWmeVfrnsK7GXyCQM8sQ0VpSgvULxA/DOgO', // Password1
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0,
  },
  {
    _id: new ObjectId('000000000000000000000001'),
    username: 'jona',
    email: 'jona@baseapinode.com',
    password: '$2a$10$J3Qa3YiZTxXBX7NsSXMWmeVfrnsK7GXyCQM8sQ0VpSgvULxA/DOgO', // Password1
    role: 'user', // Client
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0,
  },

]

module.exports = {
  async up(db, client) {
    await db.collection('users').insertMany(initialUsers)
  },

  async down(db, client) {
    await db.collection('users').deleteMany({
      _id: {
        $in: initialUsers.map((user) => user._id),
      },
    })
  },
}
