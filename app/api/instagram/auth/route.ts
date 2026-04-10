import { getAuthUrl } from '@/lib/instagram'
import { redirect } from 'next/navigation'

export async function GET() {
  redirect(getAuthUrl())
}
