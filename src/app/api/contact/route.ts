const requiredFields = ['name', 'phone', 'email'] as const
type FieldName = (typeof requiredFields)[number]

const clean = (value: unknown, maxLength: number) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : ''

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json() as Record<string, unknown>
  } catch {
    return Response.json({ message: '요청 형식이 올바르지 않습니다.' }, { status: 400 })
  }

  if (clean(body.website, 200)) {
    return Response.json({ message: '메시지를 보냈습니다.' })
  }

  const data = {
    name: clean(body.name, 80),
    phone: clean(body.phone, 40),
    email: clean(body.email, 160),
  }
  const missing = requiredFields.filter((field) => !data[field])
  if (missing.length) {
    return Response.json({ message: '모든 항목을 입력해 주세요.', fields: missing }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return Response.json({ message: '올바른 이메일 주소를 입력해 주세요.', fields: ['email'] satisfies FieldName[] }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('Contact form: RESEND_API_KEY is not configured.')
    return Response.json({ message: '메일 전송 설정이 필요합니다. 관리자에게 문의해 주세요.' }, { status: 503 })
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? 'Art City Intelligence <onboarding@resend.dev>',
      to: ['beang66@gmail.com'],
      reply_to: data.email,
      subject: `[Art City Intelligence] ${data.name}님의 새 문의`,
      html: `<h2>새로운 문의가 도착했습니다.</h2><p><strong>이름:</strong> ${escapeHtml(data.name)}</p><p><strong>연락처:</strong> ${escapeHtml(data.phone)}</p><p><strong>이메일:</strong> ${escapeHtml(data.email)}</p>`,
    }),
  })

  if (!response.ok) {
    console.error('Contact form: email provider rejected the request.', response.status, await response.text())
    return Response.json({ message: '메일 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 502 })
  }

  return Response.json({ message: '메시지를 보냈습니다.' })
}
