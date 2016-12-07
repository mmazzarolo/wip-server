/* @flow */
import Config from 'parse-server/lib/Config'
import { APP_ID, PARSE_MOUNT } from 'src/config/keys'
import logger from 'src/utils/logger'

export const loadClassesFromSchemas = async (schemas = []) => {
  const parseConfig = new Config(APP_ID, PARSE_MOUNT)
  const dbSchema = await parseConfig.database.loadSchema()
  await Promise.all(schemas.map((s) => {
    return loadClass(dbSchema, s.name, s.schema, s.permissions)
  }))
}

export const loadClass = async (dbSchema, className, classSchema, classPermissions) => {
  try {
    await dbSchema.addClassIfNotExists(className, classSchema)
    await dbSchema.updateClass(className, {}, classPermissions)
  } catch (err) {
    if (err.code === 103) {
      logger.log(err.message)
    } else {
      throw err
    }
  }
}
