import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, password } = body

  if (action === 'check') {
    const sessionPassword = request.cookies.get('admin_password')?.value
    
    if (sessionPassword === process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ authenticated: true })
    }
    
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (action === 'login') {
    if (password === process.env.ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true })
      response.cookies.set('admin_password', password, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 600, // 1 hour
        path: '/',
      })
      return response
    }
    
    return NextResponse.json({ error: 'INVALID PASSWORD' }, { status: 401 })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
