import request from 'supertest'
import app from './server.js'

process.env.NODE_ENV = 'test'

const adminAuthHeader = {
  Authorization: 'Bearer test-admin'
}

describe('Server Endpoints', () => {
  it('GET /health should return 200 and status ok', async () => {
    const res = await request(app).get('/health')
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('status', 'ok')
  })

  it('GET /non-existent-route should return 404', async () => {
    const res = await request(app).get('/non-existent-route')
    expect(res.statusCode).toEqual(404)
    expect(res.body).toEqual({ error: 'Route not found' })
  })

  it('GET /api/admin/dashboard should return a dashboard snapshot for admins', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set(adminAuthHeader)

    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('success', true)
    expect(res.body).toHaveProperty('summary')
    expect(res.body).toHaveProperty('students')
    expect(Array.isArray(res.body.students)).toBe(true)
  })

  it('POST /api/admin/students/payments should create a new student payment', async () => {
    const res = await request(app)
      .post('/api/admin/students/payments')
      .set(adminAuthHeader)
      .send({
        studentName: 'Test Student',
        rollNo: '22BCS999',
        amount: 500,
        date: '2026-07-09',
        purpose: 'Monthly Contribution',
        paymentMode: 'UPI'
      })

    expect(res.statusCode).toEqual(201)
    expect(res.body).toHaveProperty('success', true)
    expect(res.body.student).toMatchObject({
      name: 'Test Student',
      roll: '22BCS999',
      amountPaid: 500
    })
  })
})
