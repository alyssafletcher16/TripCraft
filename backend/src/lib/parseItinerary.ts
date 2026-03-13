import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export interface ParsedBlock {
  type: 'flight' | 'hotel' | 'activity' | 'food' | 'note'
  title: string
  detail: string
  price: number | null
  status: 'booked' | 'pending'
  confirmationNo: string | null
  time: string | null
}

export interface ParsedDay {
  dayNumber: number
  date: string | null
  name: string
  blocks: ParsedBlock[]
}

export interface ParsedItinerary {
  destination: string
  startDate: string | null
  endDate: string | null
  totalTravelers: number | null
  estimatedBudget: number | null
  currency: string
  theme: string | null
  vibes: string[]
  days: ParsedDay[]
  confidence: number
  parseNotes: string
}

export async function parseItinerary(rawText: string, fileName: string): Promise<ParsedItinerary> {
  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4096,
    system: `You are a travel itinerary parser. Extract structured trip data from any format of itinerary document — Google Docs, Excel sheets, Word docs, plain text, or any other format.

Return ONLY valid JSON. No commentary, no markdown fences, just raw JSON matching this exact schema:
{
  "destination": string,
  "startDate": "YYYY-MM-DD" or null,
  "endDate": "YYYY-MM-DD" or null,
  "totalTravelers": number or null,
  "estimatedBudget": number or null,
  "currency": "USD" or other currency code,
  "theme": string or null,
  "vibes": string[],
  "days": [
    {
      "dayNumber": number,
      "date": "YYYY-MM-DD" or null,
      "name": string,
      "blocks": [
        {
          "type": "flight" or "hotel" or "activity" or "food" or "note",
          "title": string,
          "detail": string,
          "price": number or null,
          "status": "booked" or "pending",
          "confirmationNo": string or null,
          "time": string or null
        }
      ]
    }
  ],
  "confidence": number between 0 and 1,
  "parseNotes": string
}

Rules:
- If a field cannot be determined, use null
- Infer block types: flights and trains map to flight, accommodation maps to hotel, restaurants and cafes map to food, tours and sights map to activity
- If budget is in a foreign currency, convert to USD and note it in parseNotes
- confidence reflects how complete and certain the parse is
- vibes should be inferred from context: Foodie, Hiking, Cultural, Budget, Luxury, Romantic, Adventure, Slow Travel`,
    messages: [
      {
        role: 'user',
        content: `Parse this itinerary from file "${fileName}":\n\n${rawText}`
      }
    ]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(text) as ParsedItinerary
}
