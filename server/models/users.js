/* commented out to appease ESLint */
const { ObjectId } = require('mongodb')
const bcrypt = require('bcryptjs')

const { extractValidFields } = require('../lib/validation')
const { getDbReference } = require('../lib/mongo')

const UserSchema = {
    name: { required: true },
    email: { required: true },
    password: { required: true },
    admin: { default: false },
    phone: { required: false },
    phone_carrier: { required: false },
    preferences: { required: false },
    homes: { default: [] }
}
exports.UserSchema = UserSchema

async function insertNewUser(user) {
    const userToInsert = extractValidFields(user, UserSchema)
    userToInsert.password = await bcrypt.hash(userToInsert.password, 8)

    const db = getDbReference()
    const collection = db.collection('users')
    const result = await collection.insertOne(userToInsert)
    return result.insertedId
}
exports.insertNewUser = insertNewUser

async function getAllUsers(includePassword = false) {
    const db = getDbReference()
    const collection = db.collection('users')
    const users = await collection.find({})
        .project(includePassword ? {} : { password: 0 })
        .toArray()
    console.log("==== users: ", users)
    return users
}
exports.getAllUsers = getAllUsers

async function getUserByEmail(email, includePassword = false) {
    const db = getDbReference()
    const collection = db.collection('users')
    const results = await collection
        .find({ email: email })
        .project(includePassword ? {} : { password: 0 })
        .toArray()
    return results[0]
}
exports.getUserByEmail = getUserByEmail

async function getUserById(id, includePassword = false) {
    const db = getDbReference()
    const collection = db.collection('users')
    if (!ObjectId.isValid(id)) {
        return null
    } else {
        const results = await collection
            .find({ _id: new ObjectId(id) })
            .project(includePassword ? {} : { password: 0 })
            .toArray()
        return results[0]
    }
}
exports.getUserById = getUserById

async function updateUserById(id, user) {
    user = extractValidFields(user, UserSchema)
    user.password = await bcrypt.hash(user.password, 8)
    const db = getDbReference()
    const collection = db.collection('users')
    const result = await collection.replaceOne(
        { _id: new ObjectId(id) },
        user
    )
    console.log("==== result: ", result)
    return result.matchedCount > 0;
}
exports.updateUserById = updateUserById

async function deleteUserById(id) {
    console.log("here")
    const db = getDbReference()
    const collection = db.collection('users')
    console.log("got the db stuff")
    const result = await collection.deleteOne({
        _id: new ObjectId(id)
    })
    console.log("==== result: ", result)
    return result.deletedCount > 0;
}
exports.deleteUserById = deleteUserById