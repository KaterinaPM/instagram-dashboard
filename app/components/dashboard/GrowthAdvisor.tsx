'use client'

import { useMemo } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface IGMedia {
  id: string; caption: string; media_type: string
  timestamp: string; like_count: number; comments_count: number
  insights: { name: string; values: { value: number }[] }[]
}
interface IGInsights {
  data: { name: string; values: { value: number; end_time: string }[] }[]
}
interface AudienceData {
  data: { name: string; period: string; values: { value: Record<string, number> }[] }[]
}
interface IGProfile {
  followers_count: number; username: string; media_count: number; biography: string
}

interface Props {
  media: IGMedia[]
  insights: IGInsights | null
  audience: AudienceData | null
  profile: IGProfile | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getIns(insights: { name: string; values: { value: number }[] }[], name: string) {
  return insights.find(i => i.name === name)?.values?.[0]?.value ?? 0
}
function getAud(data: AudienceData['data'], name: string): Record<string, number> {
  const found = data.find(d => d.name === name)
  return (found?.values?.[0]?.value as Record<string, number>) ?? {}
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// ─── Brand collaboration engine ───────────────────────────────────────────────
interface Brand {
  name: string
  category: string
  why: string
  how: string
  program: string
  minFollowers: number
  emoji: string
}

const BRAND_DB: Record<string, Brand[]> = {
  femtech: [
    { emoji: '🌸', name: 'Flo Health', category: 'Women\'s Health App', minFollowers: 1000,
      why: 'Flo actively partners with creators who talk about women\'s health, hormones, and reproductive wellness.',
      how: 'Apply via their ambassador page or DM @flohealth on Instagram with your media kit.',
      program: 'flo.health/ambassador' },
    { emoji: '🔵', name: 'Clue', category: 'Period Tracking App', minFollowers: 2000,
      why: 'Clue works with health-focused creators to spread science-based reproductive health education.',
      how: 'Email partnerships@helloclue.com with your audience stats and content examples.',
      program: 'helloclue.com' },
    { emoji: '💍', name: 'Oura Ring', category: 'Health Wearable', minFollowers: 5000,
      why: 'Oura partners with wellness and health creators for reviews, unboxings, and lifestyle content.',
      how: 'Apply through their influencer portal or DM @ouraring with your health content.',
      program: 'ouraring.com/partnerships' },
    { emoji: '🏃', name: 'Elvie', category: 'FemTech Hardware', minFollowers: 2000,
      why: 'Elvie specifically seeks creators in the femtech and women\'s health space for ambassador content.',
      how: 'Email hello@elvie.com or DM @elvie — they respond well to creators with engaged audiences.',
      program: 'elvie.com' },
    { emoji: '🌿', name: 'Natural Cycles', category: 'Fertility Awareness App', minFollowers: 3000,
      why: 'As the only FDA-cleared contraception app, Natural Cycles partners with health and wellness creators.',
      how: 'Apply at naturalcycles.com/ambassador or reach out via @naturalcycles on Instagram.',
      program: 'naturalcycles.com/ambassador' },
  ],
  tech: [
    { emoji: '🎨', name: 'Canva', category: 'Design Tool', minFollowers: 500,
      why: 'Canva\'s Creator program is one of the most accessible — they work with creators of all sizes who make content about design, productivity, or social media.',
      how: 'Apply at canva.com/creators — one of the easiest programs to get into as a smaller creator.',
      program: 'canva.com/creators' },
    { emoji: '📝', name: 'Notion', category: 'Productivity Tool', minFollowers: 1000,
      why: 'Notion\'s ambassador program seeks creators who make productivity, organisation, or tech content.',
      how: 'Apply at notion.so/ambassadors — they accept applications regularly and review monthly.',
      program: 'notion.so/ambassadors' },
    { emoji: '🤖', name: 'Manychat', category: 'Marketing Automation', minFollowers: 1000,
      why: 'As someone who works in marketing automation, authentic creator content about Manychat would be a natural fit — and you have insider knowledge.',
      how: 'Talk to your marketing team directly — internal creators often get priority partnership status.',
      program: 'manychat.com' },
    { emoji: '✦', name: 'Adobe Express', category: 'Creative Tool', minFollowers: 2000,
      why: 'Adobe\'s creator programs cover Express, Lightroom and Premiere — ideal for content creators who show their workflow.',
      how: 'Apply at adobe.com/express/learn/creators or search #AdobePartner for the application link.',
      program: 'adobe.com/creators' },
  ],
  wellness: [
    { emoji: '🌱', name: 'AG1 (Athletic Greens)', category: 'Nutrition', minFollowers: 3000,
      why: 'AG1 is one of the most active influencer programs in the wellness space — they work with creators across health, fitness, and lifestyle niches.',
      how: 'Apply at drinkag1.com/partnerships or DM @drinkag1 — they typically offer free product + commission.',
      program: 'drinkag1.com/partnerships' },
    { emoji: '🧘', name: 'Headspace', category: 'Mental Wellness App', minFollowers: 2000,
      why: 'Headspace partners with creators who talk about stress, mental health, productivity, and self-care.',
      how: 'Email creators@headspace.com with a short pitch about your audience and content style.',
      program: 'headspace.com' },
    { emoji: '💊', name: 'Seed', category: 'Probiotic / Gut Health', minFollowers: 2000,
      why: 'Seed works with science-curious health creators and has an active ambassador program with commission structure.',
      how: 'Apply at seed.com/creators — they review applications and respond within 2 weeks.',
      program: 'seed.com/creators' },
    { emoji: '😴', name: 'Calm', category: 'Meditation App', minFollowers: 3000,
      why: 'Calm partners with creators in the wellness, mental health, and productivity space for sponsored content.',
      how: 'DM @calm on Instagram or email partnerships@calm.com with audience demographics.',
      program: 'calm.com' },
  ],
  fitness: [
    { emoji: '🦈', name: 'Gymshark', category: 'Activewear', minFollowers: 5000,
      why: 'Gymshark\'s athlete and ambassador program is tiered — smaller creators can join their affiliate program first.',
      how: 'Start with their affiliate program at gymshark.com/affiliates, then grow toward the ambassador tier.',
      program: 'gymshark.com/ambassadors' },
    { emoji: '🍋', name: 'Lululemon', category: 'Activewear', minFollowers: 3000,
      why: 'Lululemon runs a local ambassador program specifically designed for community-level creators and fitness professionals.',
      how: 'Find your nearest Lululemon store and apply to their local ambassador program in person or online.',
      program: 'lululemon.com/en-ca/ambassadors' },
    { emoji: '💪', name: 'Myprotein', category: 'Sports Nutrition', minFollowers: 2000,
      why: 'Myprotein actively recruits micro-influencers in the fitness and health space with competitive commission rates.',
      how: 'Apply at myprotein.com/sports-nutrition.list — one of the most accessible fitness brand programs.',
      program: 'myprotein.com/influencer' },
  ],
  beauty: [
    { emoji: '✨', name: 'Glossier', category: 'Skincare & Beauty', minFollowers: 1000,
      why: 'Glossier\'s Rep program was built for everyday creators — they prioritise authentic content over follower count.',
      how: 'Apply at glossier.com/rep — one of the most creator-friendly programs in beauty.',
      program: 'glossier.com/rep' },
    { emoji: '🧴', name: 'The Ordinary', category: 'Skincare', minFollowers: 1000,
      why: 'The Ordinary works with science-curious skincare creators through their affiliate and gifting program.',
      how: 'Apply through their affiliate portal or email influencers@deciem.com.',
      program: 'theordinary.com' },
    { emoji: '💋', name: 'Charlotte Tilbury', category: 'Luxury Beauty', minFollowers: 5000,
      why: 'Charlotte Tilbury has a growing creator program for beauty, lifestyle, and glamour content creators.',
      how: 'Apply at charlottetilbury.com/creator or DM @charlottetilbury with your media kit.',
      program: 'charlottetilbury.com' },
  ],
  business: [
    { emoji: '🛍️', name: 'Shopify', category: 'E-Commerce Platform', minFollowers: 1000,
      why: 'Shopify\'s affiliate and creator program is open to creators who talk about business, e-commerce, or entrepreneurship.',
      how: 'Apply at shopify.com/affiliates — they offer generous commission on referrals.',
      program: 'shopify.com/affiliates' },
    { emoji: '🟠', name: 'HubSpot', category: 'Marketing & CRM', minFollowers: 2000,
      why: 'HubSpot actively partners with B2B and marketing creators through their Solutions Partner and creator programs.',
      how: 'Apply at hubspot.com/creator-program or reach out to their creator partnerships team.',
      program: 'hubspot.com/creator-program' },
  ],
  lifestyle: [
    { emoji: '🎨', name: 'Canva', category: 'Design Tool', minFollowers: 500,
      why: 'Canva\'s Creator program is the most accessible brand program available — open to creators of all sizes.',
      how: 'Apply at canva.com/creators — they review applications monthly.',
      program: 'canva.com/creators' },
    { emoji: '✈️', name: 'Airbnb', category: 'Travel & Lifestyle', minFollowers: 5000,
      why: 'Airbnb works with lifestyle creators for destination and experience content.',
      how: 'Apply through their Experiences host program or email creators@airbnb.com.',
      program: 'airbnb.com/ambassadors' },
    { emoji: '📦', name: 'Amazon Associates', category: 'Affiliate Program', minFollowers: 500,
      why: 'Amazon\'s affiliate program lets you earn on any product you recommend — a good starting point for any creator.',
      how: 'Sign up at affiliate-program.amazon.com — no minimum follower count required.',
      program: 'affiliate-program.amazon.com' },
  ],
}

function detectNiches(bio: string, captions: string[]): string[] {
  const text = [bio, ...captions].join(' ').toLowerCase()
  const scores: Record<string, number> = {}

  const patterns: Record<string, RegExp> = {
    femtech:   /femtech|fem.?tech|women.?s.?health|period|fertility|hormone|pcos|menstrual|ovulation|reproductive|gynae|gynaecology|pregnancy|menopause/,
    tech:      /tech|software|app|startup|product|saas|ai\b|digital|developer|engineer|code|coding|manychat|automation|chatbot|api|tools/,
    wellness:  /wellness|mental.?health|mindfulness|meditation|self.?care|stress|anxiety|burnout|sleep|gut.?health|nutrition|supplement/,
    fitness:   /fitness|workout|gym|training|exercise|yoga|pilates|running|lifting|crossfit|hiit|athletic|sport/,
    beauty:    /beauty|makeup|skincare|cosmetics|glam|foundation|lipstick|serum|moisturis|glow|routine|spf/,
    business:  /business|entrepreneur|startup|founder|marketing|brand|strategy|growth|b2b|ecommerce|sales|leadership/,
  }

  for (const [niche, regex] of Object.entries(patterns)) {
    const matches = text.match(new RegExp(regex.source, 'gi'))
    if (matches) scores[niche] = matches.length
  }

  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .filter(([, count]) => count > 0)
    .map(([niche]) => niche)

  return sorted.length > 0 ? sorted.slice(0, 3) : ['lifestyle']
}

function getBrandRecommendations(niches: string[], followers: number): Brand[] {
  const seen = new Set<string>()
  const brands: Brand[] = []

  for (const niche of niches) {
    const nicheBrands = BRAND_DB[niche] ?? []
    for (const brand of nicheBrands) {
      if (!seen.has(brand.name) && brands.length < 6) {
        seen.add(brand.name)
        brands.push(brand)
      }
    }
  }

  // Sort: accessible brands first (min followers ≤ current), then aspirational
  return brands.sort((a, b) => {
    const aReachable = a.minFollowers <= followers ? 0 : 1
    const bReachable = b.minFollowers <= followers ? 0 : 1
    if (aReachable !== bReachable) return aReachable - bReachable
    return a.minFollowers - b.minFollowers
  })
}

// ─── Recommendation engine ────────────────────────────────────────────────────
interface Rec {
  icon: string
  title: string
  priority: 'high' | 'medium' | 'low'
  summary: string
  actions: string[]
  dataPoint?: string
}

function buildRecommendations(
  media: IGMedia[],
  insights: IGInsights | null,
  audience: AudienceData | null,
  profile: IGProfile | null,
): Rec[] {
  const recs: Rec[] = []
  const followers = profile?.followers_count ?? 0
  const reels = media.filter(m => m.media_type === 'VIDEO' || m.media_type === 'REEL')
  const reelsWithInsights = reels.map(r => ({
    ...r,
    reach:        getIns(r.insights, 'reach'),
    saved:        getIns(r.insights, 'saved'),
    interactions: getIns(r.insights, 'total_interactions'),
    avgWatchMs:   getIns(r.insights, 'ig_reels_avg_watch_time'),
    follows:      getIns(r.insights, 'follows'),
    profileVisits:getIns(r.insights, 'profile_visits'),
  }))

  // ── 1. Posting frequency ──────────────────────────────────────────────────
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  const recentPosts = media.filter(m => new Date(m.timestamp).getTime() > thirtyDaysAgo).length
  const recentReels = reels.filter(m => new Date(m.timestamp).getTime() > thirtyDaysAgo).length
  const perWeek = +(recentReels / 4.3).toFixed(1)

  if (perWeek < 3) {
    recs.push({
      icon: '📅',
      priority: 'high',
      title: 'Post reels more consistently',
      summary: `You're averaging ${perWeek} reels/week over the last 30 days. Creators who grow fastest post 4–7 reels/week — the algorithm rewards regularity far more than perfection.`,
      dataPoint: `${recentReels} reels in last 30 days`,
      actions: [
        'Aim for at least 1 reel every 2 days',
        'Batch-film 3–4 videos in one session to build a content buffer',
        'Repurpose your best-performing content into new formats or updates',
      ],
    })
  } else if (perWeek >= 5) {
    recs.push({
      icon: '📅',
      priority: 'low',
      title: 'Great posting cadence — keep it up',
      summary: `${perWeek} reels/week is excellent. Focus now on improving quality over quantity — one extra high-effort reel a week beats three average ones.`,
      dataPoint: `${recentReels} reels in last 30 days`,
      actions: [
        'Spend extra time on your hook (first 1–2 seconds) for each reel',
        'A/B test different caption styles on similar content',
      ],
    })
  }

  // ── 2. Best time to post ──────────────────────────────────────────────────
  if (audience) {
    const onlineRaw = getAud(audience.data, 'online_followers') as unknown as Record<string, Record<string, number>>
    const dayTotals = Array(7).fill(0)
    const hourTotals = Array(24).fill(0)
    let hasData = false

    Object.entries(onlineRaw).forEach(([day, hours]) => {
      if (typeof hours !== 'object') return
      Object.entries(hours).forEach(([hour, count]) => {
        dayTotals[Number(day)] += count
        hourTotals[Number(hour)] += count
        hasData = true
      })
    })

    if (hasData) {
      const bestDay = dayTotals.indexOf(Math.max(...dayTotals))
      const bestHour = hourTotals.indexOf(Math.max(...hourTotals))
      const secondBestDay = [...dayTotals]
        .map((v, i) => ({ v, i }))
        .sort((a, b) => b.v - a.v)[1].i
      const fmt = (h: number) => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`

      recs.push({
        icon: '🕐',
        priority: 'high',
        title: `Post on ${DAYS[bestDay]}s at ${fmt(bestHour)}`,
        summary: `Your audience is most active on ${DAYS[bestDay]}s and ${DAYS[secondBestDay]}s, peaking at ${fmt(bestHour)}. Posting 30–60 minutes before peak activity gives the algorithm time to start distributing your content before the rush.`,
        dataPoint: `Peak: ${DAYS[bestDay]} ${fmt(bestHour)}`,
        actions: [
          `Schedule your best reels on ${DAYS[bestDay]} around ${fmt(Math.max(0, bestHour - 1))}`,
          `${DAYS[secondBestDay]} is your second-best day — use it for testing new formats`,
          "Use Instagram's scheduler or a tool like Later to queue content in advance",
        ],
      })
    }
  }

  // ── 3. Hook & watch time ──────────────────────────────────────────────────
  const reelsWithWatch = reelsWithInsights.filter(r => r.avgWatchMs > 0)
  if (reelsWithWatch.length > 0) {
    const avgWatchMs = reelsWithWatch.reduce((s, r) => s + r.avgWatchMs, 0) / reelsWithWatch.length
    const avgWatchSec = avgWatchMs / 1000
    const topByWatch = [...reelsWithWatch].sort((a, b) => b.avgWatchMs - a.avgWatchMs)[0]
    const topWatchSec = topByWatch.avgWatchMs / 1000

    if (avgWatchSec < 5) {
      recs.push({
        icon: '⏱️',
        priority: 'high',
        title: 'Your hooks need to be stronger',
        summary: `Your average watch time is ${avgWatchSec.toFixed(1)}s — most viewers are dropping off in the first few seconds. Instagram's algorithm ranks reels heavily on watch-through rate. Your best reel holds attention for ${topWatchSec.toFixed(1)}s — study what makes it different.`,
        dataPoint: `Avg watch time: ${avgWatchSec.toFixed(1)}s`,
        actions: [
          'Open your reel with a bold statement, question, or visual surprise — no slow intros',
          'Put the most interesting moment in the first 1–2 seconds (even if out of order)',
          'Add on-screen text immediately so viewers know what they\'ll get',
          `Analyze your top reel (${topWatchSec.toFixed(1)}s avg) — replicate its opening style`,
        ],
      })
    } else if (avgWatchSec < 10) {
      recs.push({
        icon: '⏱️',
        priority: 'medium',
        title: 'Good retention — push it past 10 seconds',
        summary: `${avgWatchSec.toFixed(1)}s average watch time is solid but there's room to improve. Reels that keep people watching past 10 seconds get significantly more distribution.`,
        dataPoint: `Avg watch time: ${avgWatchSec.toFixed(1)}s`,
        actions: [
          'Use pattern interrupts (cut, zoom, sound change) every 3–4 seconds to reset attention',
          'Tease the payoff early: "by the end of this you\'ll know..."',
          'Keep reels under 30 seconds — shorter loops boost replay rate',
        ],
      })
    } else {
      recs.push({
        icon: '⏱️',
        priority: 'low',
        title: 'Excellent watch time — your content holds attention well',
        summary: `${avgWatchSec.toFixed(1)}s average is strong. Focus on turning those viewers into followers — add a clear verbal or on-screen CTA at the end of each reel.`,
        dataPoint: `Avg watch time: ${avgWatchSec.toFixed(1)}s`,
        actions: [
          'End every reel with "Follow for more [specific topic]"',
          'Add a comment prompt: ask a question viewers will want to answer',
        ],
      })
    }
  }

  // ── 4. Engagement & follow conversion ─────────────────────────────────────
  if (reelsWithInsights.length > 0 && followers > 0) {
    const totalFollows = reelsWithInsights.reduce((s, r) => s + r.follows, 0)
    const totalReach = reelsWithInsights.reduce((s, r) => s + r.reach, 0)
    const avgEngRate = reelsWithInsights.reduce((s, r) => {
      const eng = followers > 0 ? ((r.like_count + r.comments_count) / followers) * 100 : 0
      return s + eng
    }, 0) / reelsWithInsights.length

    if (totalReach > 0) {
      const followRate = (totalFollows / totalReach) * 100

      if (followRate < 1) {
        recs.push({
          icon: '🎯',
          priority: 'high',
          title: 'Add a stronger follow CTA to every reel',
          summary: `Only ${followRate.toFixed(2)}% of people who see your reels follow you. That means most of your reach isn't converting to an audience. A simple verbal CTA at the end of each video can double this.`,
          dataPoint: `${followRate.toFixed(2)}% follow conversion rate`,
          actions: [
            'Say "Follow me for [specific value]" on camera in the last 2 seconds',
            'Use on-screen text: "Follow for daily [your niche] tips"',
            'Make your profile bio ultra-clear about what you post — people check it before following',
            'Pin your 3 best-performing reels to your profile grid',
          ],
        })
      }
    }

    if (avgEngRate < 3 && followers > 50) {
      recs.push({
        icon: '💬',
        priority: 'medium',
        title: 'Boost comments to signal quality to the algorithm',
        summary: `Your average engagement rate is ${avgEngRate.toFixed(1)}%. Comments are the highest-value engagement signal — they tell Instagram your content sparked real conversation. Even 5 extra comments per reel makes a measurable difference.`,
        dataPoint: `Avg engagement: ${avgEngRate.toFixed(1)}%`,
        actions: [
          'End every reel with a specific question ("Which do you prefer — A or B?")',
          'Reply to every comment in the first hour after posting — it counts as double engagement',
          'Use controversial or surprising opinions in your niche to spark debate',
        ],
      })
    }
  }

  // ── 5. Audience geography & language ─────────────────────────────────────
  if (audience) {
    const countries = getAud(audience.data, 'audience_country')
    const sortedCountries = Object.entries(countries).sort((a, b) => b[1] - a[1])
    const topCountry = sortedCountries[0]
    const total = Object.values(countries).reduce((s, v) => s + v, 0)

    if (topCountry && total > 0) {
      const topPct = Math.round((topCountry[1] / total) * 100)

      if (topPct < 50 && sortedCountries.length >= 3) {
        // Fragmented audience
        recs.push({
          icon: '🌍',
          priority: 'medium',
          title: 'Your audience is international — lean into it',
          summary: `Your followers come from ${sortedCountries.length} countries, with no single country over 50%. This is great for reach but means your content needs to work cross-culturally — less slang, more visual storytelling.`,
          dataPoint: `Top country: ${topCountry[0]} (${topPct}%)`,
          actions: [
            'Add subtitles to your reels — they dramatically increase retention for non-native speakers',
            'Use text overlays instead of relying on audio alone',
            'Avoid country-specific references that won\'t land internationally',
          ],
        })
      } else if (topPct >= 60) {
        // Concentrated audience
        recs.push({
          icon: '🌍',
          priority: 'low',
          title: `Your audience is mostly from ${topCountry[0]} — use it to your advantage`,
          summary: `${topPct}% of your followers are from ${topCountry[0]}. Align your posting schedule to their timezone and reference local culture, trends, and events to boost relevance.`,
          dataPoint: `${topCountry[0]}: ${topPct}% of audience`,
          actions: [
            `Check peak hours for ${topCountry[0]} timezone and align your posting schedule`,
            `Reference local trends, seasons, or events relevant to ${topCountry[0]} audiences`,
            'Engage with local creators for collaboration opportunities',
          ],
        })
      }
    }
  }

  // ── 6. Content diversity ──────────────────────────────────────────────────
  const imageCount = media.filter(m => m.media_type === 'IMAGE').length
  const carouselCount = media.filter(m => m.media_type === 'CAROUSEL_ALBUM').length
  const reelCount = reels.length
  const totalContent = media.length

  if (totalContent > 5 && reelCount / totalContent > 0.85) {
    recs.push({
      icon: '🖼️',
      priority: 'low',
      title: 'Mix in carousels to boost saves and profile visits',
      summary: `Almost all your content is reels. Carousels (multi-image posts) consistently get 3× more saves than single images and generate profile visits long after posting — they act as evergreen content.`,
      dataPoint: `${Math.round((reelCount / totalContent) * 100)}% of posts are reels`,
      actions: [
        'Create 1 carousel per week with educational or listicle content ("5 things about...")',
        'Repurpose your best reel\'s key points into a carousel slide deck',
        'Use carousels for "before/after", step-by-step, or comparison content',
      ],
    })
  } else if (totalContent > 5 && reelCount / totalContent < 0.4) {
    recs.push({
      icon: '🎬',
      priority: 'high',
      title: 'Shift more of your content to reels',
      summary: `Only ${Math.round((reelCount / totalContent) * 100)}% of your posts are reels. Instagram's algorithm currently gives reels 5–10× more organic reach than static posts — reels are your main growth lever.`,
      dataPoint: `${reelCount} reels out of ${totalContent} total posts`,
      actions: [
        'Convert your best-performing static posts into short reels (talking head, slideshow video)',
        'Aim for at least 70% reels in your content mix',
        'Even a 15-second reel of a carousel topic outperforms the carousel in reach',
      ],
    })
  }

  // ── 7. Top content learnings ──────────────────────────────────────────────
  if (reelsWithInsights.length >= 3) {
    const sorted = [...reelsWithInsights].sort((a, b) => b.reach - a.reach)
    const top = sorted.slice(0, Math.min(3, sorted.length))
    const bottom = sorted.slice(-Math.min(3, sorted.length))
    const topAvgReach = top.reduce((s, r) => s + r.reach, 0) / top.length
    const bottomAvgReach = bottom.reduce((s, r) => s + r.reach, 0) / bottom.length
    const ratio = bottomAvgReach > 0 ? topAvgReach / bottomAvgReach : 0

    if (ratio > 3) {
      // Top content massively outperforms bottom
      const topCaptions = top.map(r => r.caption?.slice(0, 60) ?? '').filter(Boolean)
      recs.push({
        icon: '🔍',
        priority: 'high',
        title: 'Double down on what already works',
        summary: `Your top reels get ${ratio.toFixed(0)}× more reach than your weakest ones. There's a clear pattern in what resonates with your audience — reverse-engineer your best content and create more of it.`,
        dataPoint: `Top reels avg: ${Math.round(topAvgReach).toLocaleString()} reach`,
        actions: [
          'Look at your top 3 reels: what topic, format, or style do they share?',
          'Create 2–3 variations of each top performer (different angle, update, or sequel)',
          'Avoid spending equal time on formats that consistently underperform',
          topCaptions[0] ? `Your best reel starts with: "${topCaptions[0]}..."` : 'Study the opening seconds of your top reels',
        ].filter(Boolean) as string[],
      })
    }
  }

  // Sort by priority
  const order = { high: 0, medium: 1, low: 2 }
  return recs.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 6)
}

// ─── Component ────────────────────────────────────────────────────────────────
const PRIORITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  high:   { bg: '#fef2f2', text: '#dc2626', label: 'High priority' },
  medium: { bg: '#fffbeb', text: '#d97706', label: 'Medium priority' },
  low:    { bg: '#f0fdf4', text: '#16a34a', label: 'Quick win' },
}

export function GrowthAdvisor({ media, insights, audience, profile }: Props) {
  const recs = useMemo(
    () => buildRecommendations(media, insights, audience, profile),
    [media, insights, audience, profile],
  )

  const { niches, brands } = useMemo(() => {
    const bio = profile?.biography ?? ''
    const captions = media.map(m => m.caption ?? '').filter(Boolean).slice(0, 20)
    const detected = detectNiches(bio, captions)
    return {
      niches: detected,
      brands: getBrandRecommendations(detected, profile?.followers_count ?? 0),
    }
  }, [media, profile])

  if (media.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: '#9ca3af' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
        <p>No data yet — connect your Instagram account to get personalised advice.</p>
      </div>
    )
  }

  const followers = profile?.followers_count ?? 0
  const reels = media.filter(m => m.media_type === 'VIDEO' || m.media_type === 'REEL')
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  const recentReels = reels.filter(m => new Date(m.timestamp).getTime() > thirtyDaysAgo).length

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
          Growth Strategy
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          Personalised recommendations based on your last {media.length} posts, {followers.toLocaleString()} followers,
          and {recentReels} reels published in the last 30 days.
        </p>
      </div>

      {/* Recommendations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {recs.map((rec, i) => {
          const colors = PRIORITY_COLORS[rec.priority]
          return (
            <div key={i} style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: '20px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 26, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{rec.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>{rec.title}</h3>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                      background: colors.bg, color: colors.text,
                    }}>{colors.label}</span>
                    {rec.dataPoint && (
                      <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>
                        {rec.dataPoint}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6, margin: 0 }}>{rec.summary}</p>
                </div>
              </div>

              {/* Action items */}
              <div style={{
                marginLeft: 40,
                background: '#f9fafb',
                borderRadius: 8,
                padding: '12px 16px',
              }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  What to do
                </p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {rec.actions.map((action, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#374151' }}>
                      <span style={{ color: '#8b5cf6', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>→</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>

      {/* Brand Collaborations */}
      {brands.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
              🤝 Brand Collaboration Opportunities
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280' }}>
              Real brands with active creator programs that match your niche
              ({niches.join(', ')}). Sorted by how reachable they are at your current follower count.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
            {brands.map((brand, i) => {
              const reachable = (profile?.followers_count ?? 0) >= brand.minFollowers
              return (
                <div key={i} style={{
                  background: '#fff',
                  border: `1px solid ${reachable ? '#d1fae5' : '#e5e7eb'}`,
                  borderRadius: 12,
                  padding: '18px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {reachable && (
                    <div style={{
                      position: 'absolute', top: 0, right: 0,
                      background: '#10b981', color: '#fff',
                      fontSize: 10, fontWeight: 700, padding: '3px 10px',
                      borderBottomLeftRadius: 8,
                    }}>REACHABLE NOW</div>
                  )}

                  {/* Brand header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 24 }}>{brand.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{brand.name}</div>
                      <div style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 600 }}>{brand.category}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: reachable ? '#10b981' : '#9ca3af', fontWeight: 600 }}>
                        {brand.minFollowers >= 1000
                          ? `${brand.minFollowers / 1000}K+`
                          : `${brand.minFollowers}+`} followers
                      </div>
                    </div>
                  </div>

                  {/* Why */}
                  <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.55, marginBottom: 12 }}>
                    {brand.why}
                  </p>

                  {/* How to reach out */}
                  <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                      How to apply
                    </p>
                    <p style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>{brand.how}</p>
                    <span style={{ fontSize: 11, color: '#8b5cf6', fontFamily: 'monospace' }}>
                      {brand.program}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Footer note */}
      <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 24 }}>
        Recommendations are generated from your real Instagram data · Refresh the page to recalculate
      </p>
    </div>
  )
}
