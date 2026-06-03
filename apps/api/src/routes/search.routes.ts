import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { cacheGet, cacheSet } from '../utils/redis';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, category, city, date, minPrice, maxPrice, sort, page = '1', limit = '20' } = req.query;

    if (!q && !city && !category) {
      res.json({ results: [], suggestions: [] });
      return;
    }

    const searchTerm = (q as string) || '';
    const cityTerm = (city as string) || '';

    const cacheKey = `search:${searchTerm}:${cityTerm}:${category || 'ALL'}:${date || ''}:${page}:${sort || 'default'}:${minPrice || ''}:${maxPrice || ''}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const where: any = { isActive: true };

    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { amenities: { contains: searchTerm } },
      ];
    }

    if (cityTerm) {
      where.OR = where.OR || [];
      where.OR.push(
        { title: { contains: cityTerm } },
        { description: { contains: cityTerm } },
        { amenities: { contains: cityTerm } },
      );
    }

    if (category) where.category = category.toString().toUpperCase();
    if (minPrice) where.basePrice = { ...where.basePrice, gte: parseFloat(minPrice as string) };
    if (maxPrice) where.basePrice = { ...where.basePrice, lte: parseFloat(maxPrice as string) };

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [results, total, suggestions] = await Promise.all([
      prisma.service.findMany({
        where,
        select: {
          id: true, title: true, category: true, basePrice: true,
          images: true, rating: true, reviewCount: true, discountPercent: true,
          vendor: { select: { businessName: true } },
          bus: category === 'BUS' ? { select: { busType: true, boardingPoints: true } } : undefined,
          flight: category === 'FLIGHT' ? { select: { airline: true, flightNumber: true } } : undefined,
          train: category === 'TRAIN' ? { select: { trainType: true, trainNumber: true } } : undefined,
          hotel: category === 'HOTEL' ? { select: { starRating: true, propertyType: true } } : undefined,
          event: category === 'EVENT' ? { select: { eventType: true, startDate: true, venue: true } } : undefined,
        },
        orderBy: sort === 'price_asc' ? { basePrice: 'asc' } :
                 sort === 'price_desc' ? { basePrice: 'desc' } :
                 sort === 'rating' ? { rating: 'desc' } :
                 { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.service.count({ where }),
      prisma.service.findMany({
        where: {
          isActive: true,
          title: { contains: searchTerm },
        },
        select: { title: true, category: true },
        take: 5,
      }),
    ]);

    const response = {
      results,
      suggestions: suggestions.map(s => ({ text: s.title, category: s.category })),
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
      meta: {
        searchTerm,
        city: cityTerm,
        category: category || 'all',
      },
    };

    await cacheSet(cacheKey, response, 120);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/autocomplete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;
    if (!q || (q as string).length < 2) {
      res.json({ suggestions: [] });
      return;
    }

    const term = q as string;
    const cacheKey = `autocomplete:${term}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.json({ suggestions: cached });
      return;
    }

    const [services, cities] = await Promise.all([
      prisma.service.findMany({
        where: {
          isActive: true,
          title: { contains: term },
        },
        select: { title: true, category: true },
        take: 8,
      }),
      prisma.service.findMany({
        where: {
          isActive: true,
          description: { contains: term },
        },
        select: { description: true },
        take: 5,
      }),
    ]);

    const suggestions = [
      ...services.map(s => ({ text: s.title, type: 'service', category: s.category })),
      ...cities.map(s => ({ text: s.description?.split(',').pop()?.trim() || '', type: 'city' })),
    ].filter(s => s.text).slice(0, 10);

    await cacheSet(cacheKey, suggestions, 60);
    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
});

router.get('/voice', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transcript } = req.query;
    if (!transcript) {
      res.json({ query: null, results: [] });
      return;
    }

    const text = (transcript as string).toLowerCase();
    const intents: string[] = [];
    const entities: Record<string, string> = {};

    const categories = ['bus', 'train', 'flight', 'hotel', 'event', 'movie', 'concert'];
    for (const cat of categories) {
      if (text.includes(cat)) entities.category = cat.toUpperCase();
    }

    const cityPattern = /(?:to|from|in|at)\s+(\w+)/gi;
    let match;
    while ((match = cityPattern.exec(text)) !== null) {
      entities.city = match[1];
    }

    if (text.includes('book') || text.includes('ticket') || text.includes('reserve')) intents.push('book');
    if (text.includes('search') || text.includes('find') || text.includes('show')) intents.push('search');
    if (text.includes('cheap') || text.includes('cheapest') || text.includes('lowest')) entities.sort = 'price_asc';
    if (text.includes('top') || text.includes('best') || text.includes('highly')) entities.sort = 'rating';

    const where: any = { isActive: true };
    if (entities.category) where.category = entities.category;
    if (entities.city) {
      where.OR = [
        { title: { contains: entities.city } },
        { description: { contains: entities.city } },
      ];
    }

    const results = await prisma.service.findMany({
      where,
      select: {
        id: true, title: true, category: true, basePrice: true,
        rating: true, images: true,
        vendor: { select: { businessName: true } },
      },
      orderBy: entities.sort === 'price_asc' ? { basePrice: 'asc' } :
               entities.sort === 'rating' ? { rating: 'desc' } :
               { rating: 'desc' },
      take: 10,
    });

    res.json({
      transcript: text,
      intents,
      entities,
      results,
      suggestion: intents.includes('book') && results.length > 0
        ? `I found ${results.length} options. Would you like to book ${results[0].title}?`
        : `Found ${results.length} results for ${entities.city || 'your search'}`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
