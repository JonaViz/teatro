/* eslint-disable no-undef */
const env_path = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'
require('dotenv').config({ path: env_path })

const db_url = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/'
const db_name = process.env.MONGO_DB || 'test'

module.exports = {
  mongodb: {
    url: db_url + db_name,
    options: {},
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
}
