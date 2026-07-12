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

  it('GET /api/admin/stats should return stats for admins', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set(adminAuthHeader)

    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('success', true)
    expect(res.body).toHaveProperty('stats')
    expect(res.body.stats).toHaveProperty('totalBalance')
    expect(res.body.stats).toHaveProperty('totalIncome')
    expect(res.body.stats).toHaveProperty('totalExpenses')
    expect(res.body.stats).toHaveProperty('pendingCount')
    expect(res.body.stats).toHaveProperty('memberCount')
    expect(Array.isArray(res.body.stats.recentActivity)).toBe(true)
  })

  it('POST /api/admin/expenses should create and delete an expense record', async () => {
    const createRes = await request(app)
      .post('/api/admin/expenses')
      .set(adminAuthHeader)
      .send({
        item: 'Test Expense Item',
        amount: 350,
        date: '2026-07-09',
        category: 'Food',
        spentBy: 'Test Admin User',
        desc: 'Testing create and delete'
      })

    expect(createRes.statusCode).toEqual(201)
    expect(createRes.body).toHaveProperty('success', true)
    expect(createRes.body.expense).toMatchObject({
      item: 'Test Expense Item',
      amount: 350,
      date: '2026-07-09',
      category: 'Food',
      spentBy: 'Test Admin User',
      desc: 'Testing create and delete'
    })

    const expenseId = createRes.body.expense.id
    expect(expenseId).toBeDefined()

    // Cleanup: delete the created expense record
    const deleteRes = await request(app)
      .delete(`/api/admin/expenses/${expenseId}`)
      .set(adminAuthHeader)

    expect(deleteRes.statusCode).toEqual(200)
    expect(deleteRes.body).toHaveProperty('success', true)
  })
})