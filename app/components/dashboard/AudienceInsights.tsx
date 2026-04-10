'use client'

interface AudienceMetric {
  name: string
  period: string
  values: { value: Record<string, number> }[]
}

interface AudienceData {
  data: AudienceMetric[]
}

function getMetric(data: AudienceMetric[], name: string): Record<string, number> {
  return data.find(d => d.name === name)?.values?.[0]?.value ?? {}
}

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return Math.round(n).toString()
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOUR_LABELS = ['12am','1am','2am','3am','4am','5am','6am','7am','8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm','10pm','11pm']

export function AudienceInsights({ audience }: { audience: AudienceData | null }) {
  if (!audience?.data?.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '48px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
        <div>Audience data not available yet.</div>
        <div style={{ fontSize: 11, color: '#d1d5db', marginTop: 6 }}>You need at least 100 followers and a few days of activity for Instagram to unlock demographics.</div>
      </div>
    )
  }

  const genderAge   = getMetric(audience.data, 'audience_gender_age')
  const countries   = getMetric(audience.data, 'audience_country')
  const cities      = getMetric(audience.data, 'audience_city')
  const onlineRaw   = getMetric(audience.data, 'online_followers') as unknown as Record<string, Record<string, number>>

  // ── Gender/Age breakdown ──
  const genderTotals: Record<string, number> = {}
  const ageTotals: Record<string, number> = {}
  let totalGenderAge = 0
  Object.entries(genderAge).forEach(([key, val]) => {
    const [gender, age] = key.split('.')
    genderTotals[gender] = (genderTotals[gender] || 0) + val
    ageTotals[age] = (ageTotals[age] || 0) + val
    totalGenderAge += val
  })
  const genderLabels: Record<string, string> = { F: 'Women', M: 'Men', U: 'Unknown' }
  const genderColors: Record<string, string> = { F: '#ec4899', M: '#3b82f6', U: '#9ca3af' }

  const ageGroups = Object.entries(ageTotals).sort((a, b) => {
    const parseAge = (s: string) => parseInt(s.split('-')[0].replace('+', ''))
    return parseAge(a[0]) - parseAge(b[0])
  })
  const maxAge = Math.max(...ageGroups.map(([, v]) => v), 1)

  // ── Countries ──
  const topCountries = Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxCountry = topCountries[0]?.[1] ?? 1

  // ── Cities ──
  const topCities = Object.entries(cities).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxCity = topCities[0]?.[1] ?? 1

  // ── Online followers heatmap ──
  // Structure: { "0": { "0": n, "1": n, ... }, "1": {...}, ... } (day → hour → count)
  const hasOnline = Object.keys(onlineRaw || {}).length > 0
  const onlineByHour: number[] = Array(24).fill(0)
  const onlineByDay: number[] = Array(7).fill(0)
  if (hasOnline) {
    Object.entries(onlineRaw).forEach(([dayIdx, hours]) => {
      const d = parseInt(dayIdx)
      if (typeof hours === 'object') {
        Object.entries(hours).forEach(([hourIdx, count]) => {
          const h = parseInt(hourIdx)
          onlineByHour[h] = (onlineByHour[h] || 0) + (count as number)
          onlineByDay[d] = (onlineByDay[d] || 0) + (count as number)
        })
      }
    })
  }
  const maxHour = Math.max(...onlineByHour, 1)
  const maxDay = Math.max(...onlineByDay, 1)
  const bestHourIdx = onlineByHour.indexOf(Math.max(...onlineByHour))
  const bestDayIdx = onlineByDay.indexOf(Math.max(...onlineByDay))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* ── Gender breakdown ── */}
        {Object.keys(genderTotals).length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Gender breakdown</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>Who's in your audience</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {Object.entries(genderTotals).filter(([k]) => k !== 'U').map(([gender, count]) => {
                const pct = totalGenderAge ? Math.round((count / totalGenderAge) * 100) : 0
                return (
                  <div key={gender} style={{ flex: pct, background: genderColors[gender] || '#e5e7eb', borderRadius: 8, height: 12, minWidth: 4 }} title={`${genderLabels[gender]}: ${pct}%`} />
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              {Object.entries(genderTotals).filter(([k]) => k !== 'U').map(([gender, count]) => {
                const pct = totalGenderAge ? Math.round((count / totalGenderAge) * 100) : 0
                return (
                  <div key={gender} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: genderColors[gender] || '#e5e7eb', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{pct}%</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{genderLabels[gender] || gender}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Age breakdown ── */}
        {ageGroups.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Age breakdown</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>Age range of your audience</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ageGroups.map(([age, count]) => {
                const pct = Math.round((count / totalGenderAge) * 100)
                const barW = (count / maxAge) * 100
                return (
                  <div key={age} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 48, fontSize: 11, color: '#6b7280', flexShrink: 0 }}>{age}</div>
                    <div style={{ flex: 1, height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${barW}%`, background: 'linear-gradient(90deg, #8b5cf6, #ec4899)', borderRadius: 4 }} />
                    </div>
                    <div style={{ width: 36, fontSize: 11, color: '#6b7280', textAlign: 'right' }}>{pct}%</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Top countries ── */}
        {topCountries.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Top countries</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>Where your audience is from</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topCountries.map(([country, count], i) => (
                <div key={country} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 20, fontSize: 11, fontWeight: 700, color: i === 0 ? '#8b5cf6' : '#d1d5db', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ width: 36, fontSize: 16 }}>
                    {country === 'US' ? '🇺🇸' : country === 'RU' ? '🇷🇺' : country === 'GB' ? '🇬🇧' : country === 'DE' ? '🇩🇪' : country === 'FR' ? '🇫🇷' : country === 'IN' ? '🇮🇳' : country === 'BR' ? '🇧🇷' : country === 'AU' ? '🇦🇺' : country === 'CA' ? '🇨🇦' : country === 'ES' ? '🇪🇸' : country === 'IT' ? '🇮🇹' : country === 'MX' ? '🇲🇽' : country === 'NL' ? '🇳🇱' : country === 'PL' ? '🇵🇱' : country === 'UA' ? '🇺🇦' : '🌍'}
                  </div>
                  <div style={{ flex: 1, fontSize: 12, color: '#374151', fontWeight: 500 }}>{country}</div>
                  <div style={{ flex: 2, height: 6, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / maxCountry) * 100}%`, background: i === 0 ? '#8b5cf6' : '#c4b5fd', borderRadius: 4 }} />
                  </div>
                  <div style={{ width: 40, fontSize: 11, color: '#6b7280', textAlign: 'right' }}>{fmt(count)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Top cities ── */}
        {topCities.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Top cities</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>Your most concentrated audience</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topCities.map(([city, count], i) => (
                <div key={city} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 20, fontSize: 11, fontWeight: 700, color: i === 0 ? '#ec4899' : '#d1d5db', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, fontSize: 12, color: '#374151', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{city}</div>
                  <div style={{ flex: 2, height: 6, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / maxCity) * 100}%`, background: i === 0 ? '#ec4899' : '#fbcfe8', borderRadius: 4 }} />
                  </div>
                  <div style={{ width: 40, fontSize: 11, color: '#6b7280', textAlign: 'right' }}>{fmt(count)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── When followers are online ── */}
      {hasOnline && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>When your followers are online</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>Best times to post for maximum visibility</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            {/* By hour */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 12 }}>By hour of day</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80 }}>
                {onlineByHour.map((count, h) => {
                  const barH = count > 0 ? Math.max((count / maxHour) * 72, 4) : 2
                  const isBest = h === bestHourIdx
                  return (
                    <div key={h} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <div style={{ width: '100%', height: barH, borderRadius: 3, background: isBest ? '#8b5cf6' : '#e0e7ff' }} title={`${HOUR_LABELS[h]}: ${count} avg online`} />
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 9, color: '#9ca3af' }}>12am</span>
                <span style={{ fontSize: 9, color: '#9ca3af' }}>6am</span>
                <span style={{ fontSize: 9, color: '#9ca3af' }}>12pm</span>
                <span style={{ fontSize: 9, color: '#9ca3af' }}>6pm</span>
                <span style={{ fontSize: 9, color: '#9ca3af' }}>11pm</span>
              </div>
              <div style={{ marginTop: 12, padding: '8px 12px', background: '#f5f3ff', borderRadius: 8, fontSize: 12 }}>
                🕐 Best hour: <strong style={{ color: '#7c3aed' }}>{HOUR_LABELS[bestHourIdx]}</strong>
              </div>
            </div>

            {/* By day */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 12 }}>By day of week</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {DAY_NAMES.map((day, d) => {
                  const count = onlineByDay[d]
                  const pct = maxDay > 0 ? (count / maxDay) * 100 : 0
                  const isBest = d === bestDayIdx
                  return (
                    <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, fontSize: 11, color: isBest ? '#8b5cf6' : '#9ca3af', fontWeight: isBest ? 700 : 400, flexShrink: 0 }}>{day}</div>
                      <div style={{ flex: 1, height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: isBest ? '#8b5cf6' : '#c4b5fd', borderRadius: 4 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ marginTop: 12, padding: '8px 12px', background: '#f5f3ff', borderRadius: 8, fontSize: 12 }}>
                📅 Best day: <strong style={{ color: '#7c3aed' }}>{DAY_NAMES[bestDayIdx]}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
