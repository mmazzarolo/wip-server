import Config from 'parse-server/lib/Config'
import { chunk, flatten, range } from 'lodash'
import { APP_ID, PARSE_MOUNT } from '../config/keys'
import logger from './logger'

const Role = Parse.Object.extend('_Role')

export const createRole = async (roleName) => {
  const doesRoleExists = await new Parse.Query(Role)
    .equalTo('name', roleName)
    .first()
  if (doesRoleExists) {
    logger.log(`[createRole] ${roleName} already exists`)
  } else {
    const acl = new Parse.ACL()
    acl.setPublicReadAccess(true)
    acl.setPublicWriteAccess(false)
    const role = new Role()
    role.set('name', roleName)
    role.setACL(acl)
    await role.save({}, { useMasterKey: true })
  }
}

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

export const findAll = async (query, options) => {
  const PAGE_SIZE = 500
  const count = await query.count()
  const pagesCount = Math.ceil(count / PAGE_SIZE)
  const pages = range(0, pagesCount)
  return flatten(await Promise.all(
    pages.map((page) => {
      return query
        .skip(page * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .find(options)
    })
  ))
}

export const createAll = async (objects, options) => {
  const objectsChunks = chunk(objects, 200)
  return await Promise.all(objectsChunks.map((obj) => Parse.Object.saveAll(obj, options)))
}

export const getPointerFromId = (className, id) => {
  const objClass = Parse.Object.extend(className)
  const obj = new objClass()
  obj.id = id
  return obj
}

export const getRole = async (roleName) => {
  return await new Parse.Query(Role)
    .equalTo('name', roleName)
    .first()
}
