import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES = ['BUS', 'TRAIN', 'FLIGHT', 'HOTEL', 'EVENT'] as const;
const BUS_TYPES = ['AC_SLEEPER', 'AC_SEATER', 'NON_AC_SLEEPER', 'NON_AC_SEATER', 'VOLVO', 'LUXURY', 'MINI', 'ORDINARY'];
const BUS_OPERATORS = ['Premium Travels', 'Royal Express', 'City Link', 'Star Bus', 'GreenLine', 'Orange Travels', 'Blue Bus', 'RedBus Partner', 'Shree Travels', 'National Express', 'KPN Travels', 'VRL Travels', 'SRS Travels', 'Neeta Travels', 'Paras Travels'];
const BUS_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune',
  'Jaipur', 'Lucknow', 'Nagpur', 'Indore', 'Bhopal', 'Surat', 'Vadodara', 'Patna',
  'Chandigarh', 'Amritsar', 'Guwahati', 'Bhubaneswar', 'Coimbatore', 'Mysore', 'Goa',
  'Udaipur', 'Jodhpur', 'Varanasi', 'Agra', 'Haridwar', 'Rishikesh', 'Shimla',
  'Manali', 'Dehradun', 'Nashik', 'Aurangabad', 'Kolhapur', 'Solapur', 'Amaravati',
  'Mangalore', 'Trivandrum', 'Kochi', 'Madurai', 'Tiruchirappalli', 'Salem', 'Vijayawada',
  'Visakhapatnam', 'Guntur', 'Rajahmundry', 'Tirupati', 'Kurnool', 'Loharu', 'Rewari'
];

const AIRLINES = ['IndiGo', 'Air India', 'SpiceJet', 'GoAir', 'Vistara', 'AirAsia', 'Akasa Air', 'Zipa Air', 'Star Air', 'TruJet'];
const AIRCRAFT = ['Airbus A320', 'Airbus A321', 'Boeing 737', 'Boeing 777', 'Boeing 787', 'Airbus A330', 'Airbus A350', 'Bombardier Q400', 'Embraer E190', 'ATR 72'];
const TRAIN_CATEGORIES = ['Rajdhani', 'Shatabdi', 'Duronto', 'Garib Rath', 'Superfast', 'Express', 'Mail', 'Jan Shatabdi', 'Intercity', 'Passenger'];
const FLIGHT_CITIES = ['DEL', 'BOM', 'BLR', 'HYD', 'MAA', 'CCU', 'AMD', 'GOI', 'JAI', 'COK', 'CNN', 'PAT', 'LHU', 'RWR'];
const CITY_MAP: Record<string, string> = {
  DEL: 'Delhi', BOM: 'Mumbai', BLR: 'Bangalore', HYD: 'Hyderabad', MAA: 'Chennai',
  CCU: 'Kolkata', AMD: 'Ahmedabad', GOI: 'Goa', JAI: 'Jaipur', COK: 'Kochi',
  CNN: 'Kannur', PAT: 'Patna', LHU: 'Loharu', RWR: 'Rewari'
};
const TRAIN_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Varanasi', 'Agra', 'Chandigarh', 'Guwahati', 'Bhubaneswar', 'Patna', 'Nagpur', 'Indore', 'Bhopal', 'Thiruvananthapuram', 'Loharu', 'Rewari'];
const HOTEL_NAMES = ['The Grand Palace', 'Taj Luxury', 'Oberoi Excellence', 'Marriott Grand', 'Hyatt Regency', 'ITC Royal', 'Leela Palace', 'JW Marriott', 'Ritz Carlton', 'St Regis', 'Four Seasons', 'Shangri La', 'The Lalit', 'Park Hyatt', 'Westin', 'Sheraton', 'Hilton Garden', 'Radisson Blu', 'Novotel', 'Crown Plaza'];
const HOTEL_TYPES = ['Luxury', 'Boutique', 'Business', 'Resort', 'Budget', 'Heritage', 'Eco', 'Beach'];
const AMENITIES_POOL = ['Pool', 'Spa', 'Restaurant', 'Gym', 'Parking', 'Room Service', 'AC', 'WiFi', 'Bar', 'Laundry', 'Concierge', 'Business Center', 'Airport Shuttle', 'Breakfast', 'Kids Club', 'Casino', 'Beach Access', 'Yoga', 'Tennis Court', 'Garden'];
const FLIGHT_CABIN_CLASSES = [
  [{ name: 'Economy', code: 'Y', seats: 150, price: 5500 }, { name: 'Business', code: 'J', seats: 30, price: 12000 }],
  [{ name: 'Economy', code: 'Y', seats: 120, price: 7000 }, { name: 'Premium Economy', code: 'S', seats: 40, price: 9500 }, { name: 'Business', code: 'J', seats: 20, price: 18000 }],
  [{ name: 'Economy', code: 'Y', seats: 180, price: 4000 }, { name: 'Business', code: 'J', seats: 15, price: 9000 }],
];
const EVENT_TYPES = ['CONCERT', 'FESTIVAL', 'CONFERENCE', 'SPORTS', 'COLLEGE', 'MOVIE', 'THEATRE'];
const EVENT_NAMES = ['Sunburn Festival', 'NH7 Weekender', 'Comic Con', 'Lollapalooza India', 'IIFA Awards', 'IPL Match', 'ISL Final', 'Marathon', 'Food Festival', 'Art Exhibition', 'Tech Summit', 'Startup Meetup', 'Music Concert', 'Dance Show', 'Stand Up Comedy', 'Fashion Week', 'Film Festival', 'Book Fair', 'Wine Tasting', 'Yoga Retreat'];

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]) => arr[rnd(0, arr.length - 1)];
const pickN = <T,>(arr: T[], n: number) => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};
const img = (url: string) => url;

async function main() {
  console.log('Seeding extended data...');

  const password = await bcrypt.hash('User@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@arvisx.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@arvisx.com', password, role: 'SUPER_ADMIN', isVerified: true, profile: { create: {} }, wallet: { create: {} } },
  });
  console.log('Admin ready');

  let vendor = await prisma.vendor.findFirst();
  if (!vendor) {
    const vu = await prisma.user.upsert({
      where: { email: 'vendor@arvisx.com' },
      update: {},
      create: { name: 'Premium Travels', email: 'vendor@arvisx.com', password, role: 'VENDOR', isVerified: true, profile: { create: {} }, wallet: { create: {} }, vendor: { create: { businessName: 'Premium Travels', businessEmail: 'vendor@arvisx.com', businessPhone: '+919876543210', isVerified: true } } },
    });
    vendor = await prisma.vendor.findUnique({ where: { userId: vu.id } })!;
  }
  if (!vendor) throw new Error('No vendor');

  console.log('Cleaning existing database entries for a clean seed...');
  await prisma.seatLock.deleteMany({});
  await prisma.seat.deleteMany({});
  await prisma.walletTransaction.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.aiAssistantSession.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.couponService.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.pricingRule.deleteMany({});
  await prisma.busService.deleteMany({});
  await prisma.trainService.deleteMany({});
  await prisma.flightService.deleteMany({});
  await prisma.hotelService.deleteMany({});
  await prisma.eventService.deleteMany({});
  await prisma.service.deleteMany({});

  const busImages = [
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80',
    'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&q=80',
    'https://images.unsplash.com/photo-1562601579-579bc89ff715?w=800&q=80',
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80'
  ];
  const trainImages = [
    'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80',
    'https://images.unsplash.com/photo-1532103054090-334e6e60b733?w=800&q=80',
    'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
    'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&q=80'
  ];
  const flightImages = [
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
    'https://images.unsplash.com/photo-1490430657723-4d607c1503fc?w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    'https://images.unsplash.com/photo-1556381613-15563815022c?w=800&q=80',
    'https://images.unsplash.com/photo-1569154948-014b9c86a5d7?w=800&q=80'
  ];
  const hotelImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80'
  ];
  const eventImages = [
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80'
  ];



  const mainRoutes = [
    { from: 'Loharu', to: 'Rewari' },
    { from: 'Rewari', to: 'Loharu' },
    { from: 'Delhi', to: 'Mumbai' },
    { from: 'Mumbai', to: 'Delhi' },
    { from: 'Mumbai', to: 'Goa' },
    { from: 'Goa', to: 'Mumbai' },
    { from: 'Bangalore', to: 'Chennai' },
    { from: 'Chennai', to: 'Bangalore' },
    { from: 'Pune', to: 'Mumbai' },
    { from: 'Mumbai', to: 'Pune' },
    { from: 'Delhi', to: 'Jaipur' },
    { from: 'Jaipur', to: 'Delhi' },
    { from: 'Hyderabad', to: 'Bangalore' },
    { from: 'Bangalore', to: 'Hyderabad' }
  ];

  const mainFlightRoutes = [
    { from: 'LHU', to: 'RWR' },
    { from: 'RWR', to: 'LHU' },
    { from: 'DEL', to: 'BOM' },
    { from: 'BOM', to: 'DEL' },
    { from: 'BOM', to: 'GOI' },
    { from: 'GOI', to: 'BOM' },
    { from: 'BLR', to: 'MAA' },
    { from: 'MAA', to: 'BLR' },
    { from: 'DEL', to: 'JAI' },
    { from: 'JAI', to: 'DEL' },
    { from: 'HYD', to: 'BLR' },
    { from: 'BLR', to: 'HYD' }
  ];

  console.log('Creating buses...');
  for (let i = 0; i < 120; i++) {
    let from = '';
    let to = '';
    if (i < mainRoutes.length) {
      from = mainRoutes[i].from;
      to = mainRoutes[i].to;
    } else {
      from = pick(BUS_CITIES);
      to = pick(BUS_CITIES);
      while (to === from) to = pick(BUS_CITIES);
    }
    const operator = pick(BUS_OPERATORS);
    const busType = pick(BUS_TYPES);
    const basePrice = busType === 'VOLVO' ? rnd(1500, 3500) : busType === 'LUXURY' ? rnd(1200, 2800) : busType === 'AC_SLEEPER' ? rnd(800, 2000) : rnd(400, 1200);
    const hours = rnd(4, 14);
    const departHour = rnd(6, 23);
    const departMin = pick([0, 15, 30, 45]);

    const svc = await prisma.service.create({
      data: {
        vendorId: vendor.id,
        category: 'BUS',
        title: `${operator} - ${from} to ${to}`,
        description: `Premium ${busType.replace(/_/g, ' ').toLowerCase()} bus service from ${from} to ${to} with comfortable seating and onboard amenities.`,
        amenities: pickN(AMENITIES_POOL, rnd(3, 8)),
        images: pickN(busImages, rnd(2, 4)),
        basePrice,
        discountPercent: Math.random() > 0.5 ? rnd(5, 25) : 0,
        taxPercent: 18,
        isFeatured: Math.random() > 0.85,
        rating: Math.round((rnd(35, 50) / 10) * 10) / 10,
        reviewCount: rnd(10, 500),
        bus: {
          create: {
            busNumber: `${pick(['MH', 'KA', 'DL', 'GJ', 'TN', 'WB', 'UP', 'RJ'])}-${String(rnd(1, 99)).padStart(2, '0')}-${String.fromCharCode(65 + rnd(0, 25))}${String.fromCharCode(65 + rnd(0, 25))}-${rnd(1000, 9999)}`,
            busType,
            totalSeats: rnd(30, 50),
            deckCount: busType.includes('SLEEPER') ? rnd(1, 2) : 1,
            amenities: pickN(AMENITIES_POOL, rnd(2, 6)),
            boardingPoints: [{ city: from, location: 'Bus Stand', time: `${String(departHour).padStart(2, '0')}:${String(departMin).padStart(2, '0')}` }],
            droppingPoints: [{ city: to, location: 'Bus Stand', time: `${String((departHour + hours) % 24).padStart(2, '0')}:${String(departMin).padStart(2, '0')}` }],
          },
        },
      },
    });

    const daysToSeed = [3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 28]; // June 2026
    for (const day of daysToSeed) {
      await prisma.schedule.create({
        data: {
          serviceId: svc.id,
          departureTime: new Date(`2026-06-${String(day).padStart(2, '0')}T${String(departHour).padStart(2, '0')}:${String(departMin).padStart(2, '0')}:00`),
          arrivalTime: new Date(`2026-06-${String(day).padStart(2, '0')}T${String((departHour + hours) % 24).padStart(2, '0')}:${String(departMin).padStart(2, '0')}:00`),
          duration: hours * 60,
          basePrice,
          availableSeats: rnd(10, 40),
          isActive: true,
          recurring: 'DAILY',
        },
      });
    }

    if (i % 20 === 0) console.log(`  ${i} buses created with schedules...`);
  }

  console.log('Creating trains...');
  for (let i = 0; i < 120; i++) {
    let from = '';
    let to = '';
    if (i < mainRoutes.length) {
      from = mainRoutes[i].from;
      to = mainRoutes[i].to;
    } else {
      from = pick(TRAIN_CITIES);
      to = pick(TRAIN_CITIES);
      while (to === from) to = pick(TRAIN_CITIES);
    }
    const category = pick(TRAIN_CATEGORIES);
    const basePrice = category === 'Rajdhani' ? rnd(2000, 5000) : category === 'Shatabdi' ? rnd(1500, 3500) : category === 'Duronto' ? rnd(1200, 3000) : rnd(300, 1500);
    const trainNum = rnd(10000, 99999);
    const hours = rnd(3, 16);
    const departHour = rnd(5, 22);
    const departMin = pick([0, 15, 30, 45]);

    const svc = await prisma.service.create({
      data: {
        vendorId: vendor.id,
        category: 'TRAIN',
        title: `${trainNum} ${category} Express - ${from} to ${to}`,
        description: `${category} train connecting ${from} to ${to}. Clean coaches, pantry service, and punctual departure.`,
        amenities: pickN(AMENITIES_POOL, rnd(3, 7)),
        images: pickN(trainImages, rnd(1, 3)),
        basePrice,
        discountPercent: Math.random() > 0.6 ? rnd(5, 15) : 0,
        taxPercent: 12,
        isFeatured: Math.random() > 0.9,
        rating: Math.round((rnd(35, 48) / 10) * 10) / 10,
        reviewCount: rnd(20, 800),
        train: {
          create: {
            trainNumber: String(trainNum),
            trainType: category.toUpperCase(),
            totalSeats: rnd(500, 1500),
            classes: [
              { name: 'Sleeper', code: 'SL', seats: rnd(200, 500), price: basePrice },
              { name: 'AC 3 Tier', code: '3A', seats: rnd(100, 200), price: Math.round(basePrice * 1.5) },
              { name: 'AC 2 Tier', code: '2A', seats: rnd(50, 100), price: Math.round(basePrice * 2.2) },
              { name: 'AC 1st Class', code: '1A', seats: rnd(10, 30), price: Math.round(basePrice * 3.5) },
            ],
          },
        },
      },
    });

    const daysToSeed = [3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 28]; // June 2026
    for (const day of daysToSeed) {
      await prisma.schedule.create({
        data: {
          serviceId: svc.id,
          departureTime: new Date(`2026-06-${String(day).padStart(2, '0')}T${String(departHour).padStart(2, '0')}:${String(departMin).padStart(2, '0')}:00`),
          arrivalTime: new Date(`2026-06-${String(day).padStart(2, '0')}T${String((departHour + hours) % 24).padStart(2, '0')}:${String(departMin).padStart(2, '0')}:00`),
          duration: hours * 60,
          basePrice,
          availableSeats: rnd(100, 800),
          isActive: true,
          recurring: 'DAILY',
        },
      });
    }

    if (i % 20 === 0) console.log(`  ${i} trains created with schedules...`);
  }

  console.log('Creating flights...');
  const airportCodes = ['DEL', 'BOM', 'BLR', 'HYD', 'MAA', 'CCU', 'AMD', 'GOI', 'JAI', 'COK', 'CNN', 'PAT', 'LHU', 'RWR'];
  for (let i = 0; i < 80; i++) {
    let from = '';
    let to = '';
    if (i < mainFlightRoutes.length) {
      from = mainFlightRoutes[i].from;
      to = mainFlightRoutes[i].to;
    } else {
      from = pick(airportCodes);
      to = pick(airportCodes);
      while (to === from) to = pick(airportCodes);
    }
    const airline = pick(AIRLINES);
    const aircraft = pick(AIRCRAFT);
    const classes = pick(FLIGHT_CABIN_CLASSES);
    const basePrice = classes[0].price;
    const hours = rnd(1, 5);
    const departHour = rnd(4, 23);
    const departMin = pick([0, 15, 30, 45]);

    const svc = await prisma.service.create({
      data: {
        vendorId: vendor.id,
        category: 'FLIGHT',
        title: `${airline} ${from}-${to} - ${pick(['6E', 'AI', 'SG', 'G8', 'UK', 'I5'])}${rnd(100, 999)}`,
        description: `Direct flight from ${CITY_MAP[from] || from} to ${CITY_MAP[to] || to} with ${airline}.`,
        amenities: pickN(['Meals', 'Entertainment', 'WiFi', 'Extra Legroom', 'Priority Boarding', 'Lounge Access'], rnd(2, 5)),
        images: pickN(flightImages, rnd(1, 3)),
        basePrice,
        discountPercent: Math.random() > 0.5 ? rnd(10, 35) : 0,
        taxPercent: 12,
        isFeatured: i < 10,
        rating: Math.round((rnd(35, 48) / 10) * 10) / 10,
        reviewCount: rnd(50, 2000),
        flight: {
          create: {
            flightNumber: `${pick(['6E', 'AI', 'SG', 'G8', 'UK', 'QP', 'I5', '9I'])}${rnd(100, 999)}`,
            airline,
            aircraftType: aircraft,
            totalSeats: classes.reduce((s: number, c: any) => s + c.seats, 0),
            classes,
            baggageAllowance: { cabin: '7kg', checkin: i < 50 ? '15kg' : '30kg' },
            mealOptions: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Kids Meal'],
          },
        },
      },
    });

    const daysToSeed = [3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 28]; // June 2026
    for (const day of daysToSeed) {
      await prisma.schedule.create({
        data: {
          serviceId: svc.id,
          departureTime: new Date(`2026-06-${String(day).padStart(2, '0')}T${String(departHour).padStart(2, '0')}:${String(departMin).padStart(2, '0')}:00`),
          arrivalTime: new Date(`2026-06-${String(day).padStart(2, '0')}T${String((departHour + hours) % 24).padStart(2, '0')}:${String(departMin).padStart(2, '0')}:00`),
          duration: hours * 60,
          basePrice,
          availableSeats: rnd(10, 100),
          isActive: true,
          recurring: 'DAILY',
        },
      });
    }
    if (i % 15 === 0) console.log(`  ${i} flights created...`);
  }

  console.log('Creating hotels...');
  for (let i = 0; i < 60; i++) {
    const city = pick(BUS_CITIES);
    const hotelName = pick(HOTEL_NAMES);
    const hotelType = pick(HOTEL_TYPES);
    const starRating = hotelType === 'Luxury' ? rnd(4, 5) : hotelType === 'Budget' ? rnd(2, 3) : rnd(3, 5);
    const basePrice = hotelType === 'Luxury' ? rnd(8000, 35000) : hotelType === 'Resort' ? rnd(6000, 25000) : hotelType === 'Budget' ? rnd(1500, 4000) : rnd(3000, 12000);

    await prisma.service.create({
      data: {
        vendorId: vendor.id,
        category: 'HOTEL',
        title: `${hotelName} ${city}`,
        description: `${hotelType} hotel in the heart of ${city}. Experience world-class hospitality with premium amenities and comfortable rooms.`,
        amenities: pickN(AMENITIES_POOL, rnd(5, 12)),
        images: pickN(hotelImages, rnd(3, 6)),
        basePrice,
        discountPercent: Math.random() > 0.4 ? rnd(10, 35) : 0,
        taxPercent: 12,
        isFeatured: starRating === 5,
        rating: Math.round((rnd(35, 50) / 10) * 10) / 10,
        reviewCount: rnd(30, 1500),
        hotel: {
          create: {
            starRating,
            propertyType: hotelType.toUpperCase(),
            checkInTime: '14:00',
            checkOutTime: '11:00',
            totalRooms: rnd(20, 300),
            roomTypes: [
              { name: 'Standard Room', maxGuests: 2, price: basePrice, totalRooms: rnd(10, 100) },
              { name: 'Deluxe Room', maxGuests: 2, price: Math.round(basePrice * 1.5), totalRooms: rnd(5, 50) },
              { name: 'Suite', maxGuests: 4, price: Math.round(basePrice * 2.5), totalRooms: rnd(2, 20) },
            ],
          },
        },
      },
    });
    if (i % 15 === 0) console.log(`  ${i} hotels created...`);
  }

  console.log('Creating events...');
  for (let i = 0; i < 40; i++) {
    const eventType = pick(EVENT_TYPES);
    const eventName = pick(EVENT_NAMES);
    const city = pick(BUS_CITIES);
    const basePrice = eventType === 'CONCERT' ? rnd(2000, 15000) : eventType === 'SPORTS' ? rnd(500, 8000) : eventType === 'CONFERENCE' ? rnd(3000, 20000) : rnd(500, 5000);
    const startDay = rnd(1, 28);
    const endDay = Math.min(startDay + rnd(1, 3), 30);

    await prisma.service.create({
      data: {
        vendorId: vendor.id,
        category: 'EVENT',
        title: `${eventName} ${city}`,
        description: `Experience the best ${eventType.toLowerCase()} event in ${city}. Unforgettable moments with top artists and performers.`,
        amenities: pickN(['VIP Access', 'Parking', 'Food Court', 'Medical', 'ATM', 'Security', 'Washroom', 'Green Room'], rnd(3, 6)),
        images: pickN(eventImages, rnd(2, 5)),
        basePrice,
        discountPercent: Math.random() > 0.6 ? rnd(5, 20) : 0,
        taxPercent: 18,
        isFeatured: Math.random() > 0.85,
        rating: Math.round((rnd(35, 48) / 10) * 10) / 10,
        reviewCount: rnd(10, 500),
        event: {
          create: {
            eventType,
            venue: pick(['Stadium', 'Arena', 'Convention Center', 'Open Ground', 'Beach', 'Club', 'Hotel Ballroom', 'College Auditorium']),
            venueAddress: `${city}, India`,
            startDate: new Date(`2026-07-${String(startDay).padStart(2, '0')}`),
            endDate: new Date(`2026-07-${String(endDay).padStart(2, '0')}`),
            totalTickets: rnd(500, 50000),
            ticketTypes: [
              { name: 'General Admission', price: basePrice, total: rnd(500, 30000) },
              { name: 'VIP', price: Math.round(basePrice * 2), total: rnd(100, 5000) },
              { name: 'Super VIP', price: Math.round(basePrice * 4), total: rnd(50, 1000) },
            ],
            organizer: pick(['Live Nation', 'BookMyShow', 'District', 'Insider', 'Explara', 'Events High']),
            ageRestriction: eventType === 'MOVIE' ? 0 : rnd(0, 21),
          },
        },
      },
    });
    if (i % 10 === 0) console.log(`  ${i} events created...`);
  }

  await prisma.coupon.createMany({
    data: [
      { code: 'WELCOME50', description: '50% off on your first booking', discountType: 'PERCENTAGE', discountValue: 50, maxDiscount: 2000, validFrom: new Date(), validUntil: new Date('2027-12-31'), maxUses: 10000 },
      { code: 'FLAT500', description: 'Flat 500 off on bookings above 5000', discountType: 'FIXED', discountValue: 500, minOrderAmount: 5000, validFrom: new Date(), validUntil: new Date('2027-12-31'), maxUses: 5000 },
      { code: 'BUS200', description: '200 off on bus bookings', discountType: 'FIXED', discountValue: 200, minOrderAmount: 1000, category: 'BUS', validFrom: new Date(), validUntil: new Date('2027-12-31'), maxUses: 2000 },
      { code: 'FLIGHT10', description: '10% off on flight bookings', discountType: 'PERCENTAGE', discountValue: 10, maxDiscount: 3000, category: 'FLIGHT', validFrom: new Date(), validUntil: new Date('2027-12-31'), maxUses: 3000 },
      { code: 'HOTEL20', description: '20% off on hotel bookings', discountType: 'PERCENTAGE', discountValue: 20, maxDiscount: 5000, category: 'HOTEL', validFrom: new Date(), validUntil: new Date('2027-12-31'), maxUses: 2000 },
      { code: 'EVENT15', description: '15% off on event tickets', discountType: 'PERCENTAGE', discountValue: 15, maxDiscount: 2000, category: 'EVENT', validFrom: new Date(), validUntil: new Date('2027-12-31'), maxUses: 3000 },
    ],
  });

  console.log(`Seed complete! Total services: ${await prisma.service.count()}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
