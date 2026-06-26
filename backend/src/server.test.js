import request from 'supertest'
import app from './server.js'

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
})
