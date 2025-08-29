import { test, expect, afterAll } from 'vitest'
import  request from 'supertest'
import { server } from '../app.ts'
import { faker } from '@faker-js/faker'
import { makeUser } from '../tests/factories/make-user.ts'
import { beforeEach } from 'node:test'
import { users } from '../database/schema.ts'
import { db } from '../database/client.ts'

//clear the user table before each test
beforeEach(async () => {
    await db.delete(users)
})

afterAll(async () => {
    await server.close()
})

/** ✅ Login existe (happy path)*/
test('login', async () => {
    await server.ready()

    const { user, passwordBeforeHash } = await makeUser()

    const response = await request(server.server)
    .post('/sessions')
    .set('Content-Type', 'application/json')
    .send({
        email: user.email,
        password: passwordBeforeHash,
    })

    expect(response.status).toEqual(200)
    expect(response.body).toEqual({
        message: 'ok',
    })
})

/** ❌ user not exists */
test('login failed user not found', async() => {
    await server.ready()

    const res = await request(server.server)
    .post('/sessions')
    .set('Content-type', 'application/json')
    .send({
        email: 'ghost@example.com',
        password: 'whatever'
    })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({message: 'Invalid Credentials'})
})

/** ❌ Senha incorreta */
test('login invalid password test', async() => {
    await server.ready()

    const { user } = await makeUser()

    const res = await request(server.server)
    .post('/sessions')
    .set('Content-type', 'application/json')
    .send({
        email: user.email,
        password: 'wrong-password'
    })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({
        token: expect.any(String)
    })
})