import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { config } from '../config';
import { BadRequestError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, sessionId, context } = req.body;
    if (!message) throw new BadRequestError('Message is required');

    let session;
    if (sessionId) {
      session = await prisma.aiAssistantSession.findFirst({
        where: { id: sessionId, userId: req.user!.userId, isActive: true },
        include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } },
      });
    }

    if (!session) {
      session = await prisma.aiAssistantSession.create({
        data: {
          userId: req.user!.userId,
          title: message.slice(0, 100),
          context: context || [],
        },
        include: { messages: true },
      });
    }

    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        userId: req.user!.userId,
        role: 'USER',
        content: message,
      },
    });

    let aiResponse: string;
    const systemPrompt = `You are Arvis AI, a premium travel assistant for Arvis X platform. Help users with:
- Booking buses, trains, flights, hotels, and events
- Travel recommendations and itinerary planning
- Answering travel-related questions
- Providing booking status and support
Be concise, helpful, and luxurious in tone.`;

    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            ...(session?.messages || []).map(m => ({
              role: m.role.toLowerCase() as any,
              content: m.content,
            })),
            { role: 'user', content: message },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (openaiResponse.ok) {
        const data = await openaiResponse.json() as any;
        aiResponse = data.choices[0]?.message?.content || 'I apologize, but I encountered an issue. Please try again.';
      } else {
        aiResponse = getFallbackResponse(message);
      }
    } catch {
      aiResponse = getFallbackResponse(message);
    }

    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'ASSISTANT',
        content: aiResponse,
      },
    });

    await prisma.aiAssistantSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    });

    res.json({
      message: assistantMessage,
      sessionId: session.id,
      suggestions: extractSuggestions(aiResponse),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/sessions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await prisma.aiAssistantSession.findMany({
      where: { userId: req.user!.userId },
      include: { _count: { select: { messages: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

router.get('/sessions/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await prisma.aiAssistantSession.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session) throw new BadRequestError('Session not found');
    res.json({ session });
  } catch (error) {
    next(error);
  }
});

router.delete('/sessions/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.aiAssistantSession.updateMany({
      where: { id: req.params.id, userId: req.user!.userId },
      data: { isActive: false },
    });
    res.json({ message: 'Session deleted' });
  } catch (error) {
    next(error);
  }
});

function getFallbackItinerary(destination: string, duration: string, budget: string): string {
  const dest = destination.toLowerCase();
  const days = parseInt(duration) || 3;
  const cost = (days * 12500).toLocaleString('en-IN');

  const spots: Record<string, { hotel: string; spots: string[]; eats: string[] }> = {
    goa: {
      hotel: 'Taj Exotica Resort & Spa / W Goa',
      spots: ['Baga Beach', 'Vagator Beach & Chapora Fort', 'Basilica of Bom Jesus', 'Dudhsagar Waterfalls', 'Aguada Fort', 'Anjuna Flea Market', 'Arambol beach sunset session'],
      eats: ['Thalassa (Vagator)', 'Gunpowder (Assagao)', 'Mum\'s Kitchen (Panaji)', 'Martin\'s Corner (Betalbatim)'],
    },
    mumbai: {
      hotel: 'The Taj Mahal Palace / The Oberoi Mumbai',
      spots: ['Gateway of India', 'Marine Drive Queen\'s Necklace', 'Elephanta Caves ferry tour', 'Siddhivinayak Temple', 'Colaba Causeway street walk', 'Juhu Beach', 'Haji Ali Dargah'],
      eats: ['Wasabi by Morimoto (Colaba)', 'Britannia & Co. (Fort)', 'Leopold Cafe', 'The Table (Colaba)'],
    },
    delhi: {
      hotel: 'The Leela Palace New Delhi / Taj Palace',
      spots: ['Red Fort & Old Delhi rickshaw tour', 'Qutub Minar complex', 'India Gate', 'Lotus Temple', 'Humayun\'s Tomb heritage walk', 'Lodi Gardens', 'Chandni Chowk market'],
      eats: ['Bukhara (ITC Maurya)', 'Indian Accent (Lodhi)', 'Karim\'s (Jama Masjid)', 'Dum Pukht'],
    },
    jaipur: {
      hotel: 'Rambagh Palace / The Oberoi Rajvilas',
      spots: ['Hawa Mahal Palace of Winds', 'Amer Fort elephant tour', 'City Palace museum', 'Jantar Mantar observatory', 'Jal Mahal lake view', 'Nahargarh Fort sunset view', 'Chokhi Dhani ethnic resort'],
      eats: ['1135 AD (Amer Fort)', 'Suvarna Mahal (Rambagh)', 'LMB Laxmi Mishthan Bhandar', 'Baradari'],
    },
    pune: {
      hotel: 'JW Marriott Hotel Pune / Conrad Pune',
      spots: ['Shaniwar Wada palace ruins', 'Aga Khan Palace', 'Sinhagad Fort hill trek', 'Dagdusheth Halwai Ganpati Temple', 'Koregaon Park lanes', 'Osho Teerth Park', 'Vetal Tekdi'],
      eats: ['Vaishali (FC Road)', 'German Bakery (Koregaon Park)', 'Shabree', 'Blue Nile'],
    },
    bangalore: {
      hotel: 'The Leela Palace Bengaluru / Taj West End',
      spots: ['Bangalore Palace tour', 'Lalbagh Botanical Gardens glass house', 'Cubbon Park walking trail', 'Nandi Hills sunrise trip', 'Bannerghatta National Park safari', 'Visvesvaraya Museum'],
      eats: ['Toit Brewpub (Indiranagar)', 'Vidyarthi Bhavan (Gandhi Bazaar)', 'MTR Mavalli Tiffin Room', 'Karavalli'],
    },
    hyderabad: {
      hotel: 'Taj Falaknuma Palace / ITC Kohenur',
      spots: ['Charminar & Laad Bazaar walk', 'Golconda Fort light show', 'Hussain Sagar Lake boating', 'Salar Jung Museum', 'Qutb Shahi Tombs', 'Ramoji Film City tour'],
      eats: ['Paradise Biryani (Secunderabad)', 'Jewel of Nizams (Gandipet)', 'Shadab Hotel', 'Chutneys'],
    },
    kolkata: {
      hotel: 'The Oberoi Grand / Taj Bengal',
      spots: ['Victoria Memorial museum', 'Howrah Bridge view', 'Dakshineswar Kali Temple', 'Science City', 'Indian Museum', 'Mother House', 'Kumortuli clay artisan village'],
      eats: ['Peter Cat (Chelos & Kebabs, Park Street)', 'Flurys tea room', 'Arsalan Biryani', 'Kewpie\'s Kitchen'],
    }
  };

  // Find matching city
  let matchedCity = 'default';
  for (const city of Object.keys(spots)) {
    if (dest.includes(city)) {
      matchedCity = city;
      break;
    }
  }

  if (matchedCity !== 'default') {
    const data = spots[matchedCity];
    let md = `## Luxury ${days}-Day Itinerary for ${destination.toUpperCase()}\n\n`;
    md += `> [!IMPORTANT]\n`;
    md += `> **Curated by Arvis AI** • Flexible Budget: ₹${budget || '1,25,000'} • Premium Class Accommodation: **${data.hotel}**\n\n`;

    for (let i = 1; i <= days; i++) {
      const spot1 = data.spots[(i * 2 - 2) % data.spots.length];
      const spot2 = data.spots[(i * 2 - 1) % data.spots.length];
      const eat = data.eats[(i - 1) % data.eats.length];
      md += `### Day ${i}: Explore & Experience\n`;
      md += `- **09:00 AM**: Private transfer to visit **${spot1}** for guided exploration.\n`;
      md += `- **01:00 PM**: Curated lunch at the award-winning **${eat}**.\n`;
      md += `- **03:00 PM**: Afternoon tour of the legendary **${spot2}**.\n`;
      md += `- **07:30 PM**: Fine-dining dinner reservation at **${data.eats[i % data.eats.length]}**.\n\n`;
    }
    md += `### Luxury Accommodation Recommendations\n`;
    md += `- Stay at the award-winning 5-star **${data.hotel}**.\n\n`;
    md += `*Estimated package cost: ₹${cost} (Incl. private guides, premium entry passes, and taxes)*`;
    return md;
  }

  // Fallback for general cities
  return `## Luxury ${days}-Day Itinerary for ${destination}\n\n` +
    `> [!TIP]\n` +
    `> **Curated by Arvis AI** • Target Budget: ₹${budget || 'Flexible'} • Private Transfers Included\n\n` +
    `### Day 1: Arrival & Welcome\n` +
    `- **02:00 PM**: Check into your premium resort\n` +
    `- **04:30 PM**: Guided orientation tour of the central heritage district\n` +
    `- **07:30 PM**: Welcome dinner at a top-rated local dining spot\n\n` +
    `### Day 2: Cultural Heritage & Sightseeing\n` +
    `- **09:00 AM**: Full day sightseeing of the most iconic landmarks and local craft centers\n` +
    `- **01:30 PM**: Lunch at a traditional heritage bistro\n` +
    `- **03:30 PM**: Visit to the leading local museum or natural park\n\n` +
    `### Day 3: Leisure & Departure\n` +
    `- **10:00 AM**: Leisure morning, shopping at premium local designer boutiques\n` +
    `- **12:00 PM**: Checkout and transfer to terminal\n\n` +
    `*Estimated package cost: ₹${cost}*`;
}

router.post('/itinerary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { destination, duration, budget, interests, startDate } = req.body;

    if (!destination || !duration) {
      throw new BadRequestError('Destination and duration are required');
    }

    const prompt = `Create a luxury travel itinerary for ${destination} for ${duration} days with a budget of ₹${budget || 'flexible'}. Interests: ${interests || 'sightseeing, dining, culture'}. Start date: ${startDate || 'flexible'}. You MUST include actual real-life, famous tourist spots, landmarks, popular local luxury restaurants, and precise activities for each day in ${destination}. Day-wise plan, recommended hotels, estimated costs. Make it extremely premium, professional, and detailed.`;

    let itinerary: string;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a luxury travel planner. Create detailed, premium itineraries featuring real landmarks and restaurants.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (response.ok) {
        const data = await response.json() as any;
        itinerary = data.choices[0]?.message?.content || getFallbackItinerary(destination, duration, budget);
      } else {
        itinerary = getFallbackItinerary(destination, duration, budget);
      }
    } catch {
      itinerary = getFallbackItinerary(destination, duration, budget);
    }

    res.json({
      itinerary,
      destination,
      duration,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/recommendations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { preferences } = req.body;

    const recentBookings = await prisma.booking.findMany({
      where: { userId: req.user!.userId },
      include: { service: { select: { id: true, title: true, category: true, basePrice: true, images: true, rating: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const categories = recentBookings.map(b => b.service.category);
    const topCategory = categories.length > 0
      ? categories.sort((a, b) => categories.filter(v => v === a).length - categories.filter(v => v === b).length).pop()
      : null;

    const recommendations = await prisma.service.findMany({
      where: {
        isActive: true,
        ...(topCategory ? { category: topCategory } : {}),
        id: { notIn: recentBookings.map(b => b.serviceId) },
      },
      orderBy: { rating: 'desc' },
      take: 10,
      select: {
        id: true, title: true, category: true, basePrice: true,
        images: true, rating: true, discountPercent: true,
        vendor: { select: { businessName: true } },
      },
    });

    res.json({
      recommendations,
      basedOn: topCategory || 'popular',
      userHistory: recentBookings.map(b => b.service.title),
    });
  } catch (error) {
    next(error);
  }
});

function getFallbackResponse(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes('book') || msg.includes('ticket')) {
    return 'I can help you book tickets! Please let me know your destination, date, and preferred mode of travel.';
  }
  if (msg.includes('cancel') || msg.includes('refund')) {
    return 'For cancellations and refunds, please visit your bookings page or provide your booking reference number.';
  }
  if (msg.includes('payment') || msg.includes('pay')) {
    return 'We accept various payment methods including cards, UPI, and wallet. All payments are securely processed through Cashfree.';
  }
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return 'Welcome to Arvis X! I\'m your AI travel assistant. How can I help you plan your journey today?';
  }
  return 'I understand you need assistance. Could you please provide more details so I can help you better?';
}

function extractSuggestions(response: string): string[] {
  const suggestions: string[] = [];
  if (response.toLowerCase().includes('book')) suggestions.push('Book a ticket');
  if (response.toLowerCase().includes('dest')) suggestions.push('Explore destinations');
  if (response.toLowerCase().includes('pay')) suggestions.push('Payment help');
  if (suggestions.length === 0) suggestions.push('Search services', 'View my bookings', 'Get help');
  return suggestions.slice(0, 3);
}

export default router;
