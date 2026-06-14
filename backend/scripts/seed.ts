import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Arvis X database...');

  // Clean data
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

  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const userPassword = await bcrypt.hash('User@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@arvisx.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@arvisx.com',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      isVerified: true,
      profile: { create: {} },
      wallet: { create: {} },
      image: null,
    },
  });
  console.log(`Admin: ${admin.email}`);

  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@arvisx.com' },
    update: {},
    create: {
      name: 'Premium Travels',
      email: 'vendor@arvisx.com',
      password: userPassword,
      role: 'VENDOR',
      isVerified: true,
      profile: { create: {} },
      wallet: { create: {} },
      image: null,
      vendor: {
        create: {
          businessName: 'Premium Travels',
          businessEmail: 'vendor@arvisx.com',
          businessPhone: '+919876543210',
          isVerified: true,
          commissionRate: 5.0,
        },
      },
    },
  });
  console.log(`Vendor: ${vendorUser.email}`);

  await prisma.user.upsert({
    where: { email: 'user@arvisx.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'user@arvisx.com',
      password: userPassword,
      role: 'USER',
      isVerified: true,
      profile: { create: { city: 'Mumbai', country: 'India' } },
      wallet: { create: { balance: 10000 } },
      image: null,
    },
  });
  console.log(`User: user@arvisx.com`);

  const vendorRecord = await prisma.vendor.findUnique({ where: { userId: vendorUser.id } });
  if (!vendorRecord) throw new Error('Vendor not found');

  const busService = await prisma.service.create({
    data: {
      vendorId: vendorRecord.id,
      category: 'BUS',
      title: 'Premium AC Sleeper - Loharu to Rewari',
      description: 'Luxury AC sleeper bus with reclining seats, WiFi, and refreshments.',
      amenities: ['AC', 'Sleeper', 'WiFi', 'Charging Point', 'Blanket', 'Water Bottle'],
      images: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80'],
      basePrice: 1200,
      discountPercent: 10,
      taxPercent: 18,
      isFeatured: true,
      rating: 4.5,
      reviewCount: 128,
      bus: {
        create: {
          busNumber: 'MH-01-AB-1234',
          busType: 'AC_SLEEPER',
          totalSeats: 30,
          deckCount: 1,
          amenities: [],
          boardingPoints: [
            { city: 'Mumbai', location: 'Dadar TT', time: '22:00' },
            { city: 'Mumbai', location: 'Andheri East', time: '22:30' },
          ],
          droppingPoints: [
            { city: 'Pune', location: 'Shivajinagar', time: '05:30' },
            { city: 'Pune', location: 'Swargate', time: '06:00' },
          ],
        },
      },
    },
  });

  const busSchedule = await prisma.schedule.create({
    data: {
      serviceId: busService.id,
      departureTime: new Date('2026-07-04T22:00:00'),
      arrivalTime: new Date('2026-07-05T06:00:00'),
      duration: 480,
      basePrice: 1200,
      availableSeats: 30,
      isActive: true,
      recurring: 'DAILY',
    },
  });

  const seatRows = ['A', 'B', 'C', 'D', 'E'];
  const seatCols = ['1', '2'];
  for (const row of seatRows) {
    for (const col of seatCols) {
      await prisma.seat.create({
        data: {
          scheduleId: busSchedule.id,
          seatNumber: `${row}${col}`,
          deck: 1,
          row: seatRows.indexOf(row),
          column: col,
          price: 1200,
          status: 'AVAILABLE',
        },
      });
    }
  }

  const hotelService = await prisma.service.create({
    data: {
      vendorId: vendorRecord.id,
      category: 'HOTEL',
      title: 'The Grand Palace Hotel - Jaipur',
      description: 'Experience royal luxury at our 5-star heritage hotel.',
      amenities: ['Pool', 'Spa', 'Restaurant', 'Gym', 'Parking', 'Room Service', 'AC', 'WiFi'],
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'],
      basePrice: 8500,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 256,
      hotel: {
        create: {
          starRating: 5,
          propertyType: 'HOTEL',
          checkInTime: '14:00',
          checkOutTime: '11:00',
          totalRooms: 120,
          roomTypes: [
            { name: 'Deluxe Room', maxGuests: 2, price: 8500, totalRooms: 50 },
            { name: 'Suite', maxGuests: 4, price: 15000, totalRooms: 20 },
            { name: 'Presidential Suite', maxGuests: 6, price: 35000, totalRooms: 5 },
          ],
        },
      },
    },
  });

  const flightService = await prisma.service.create({
    data: {
      vendorId: vendorRecord.id,
      category: 'FLIGHT',
      title: 'IndiGo 6E-123 - Mumbai to Delhi',
      description: 'Direct flight with complimentary meals and entertainment.',
      amenities: ['Meals', 'Entertainment', 'WiFi', 'Extra Legroom'],
      images: ['https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80'],
      basePrice: 5500,
      discountPercent: 15,
      isFeatured: true,
      rating: 4.3,
      reviewCount: 89,
      flight: {
        create: {
          flightNumber: '6E-123',
          airline: 'IndiGo',
          aircraftType: 'Airbus A320',
          totalSeats: 180,
          classes: [
            { name: 'Economy', code: 'Y', seats: 150, price: 5500 },
            { name: 'Business', code: 'J', seats: 30, price: 12000 },
          ],
          baggageAllowance: { cabin: '7kg', checkin: '15kg' },
          mealOptions: ['Vegetarian', 'Non-Vegetarian', 'Vegan'],
        },
      },
    },
  });

  // Flight schedule
  await prisma.schedule.create({
    data: {
      serviceId: flightService.id,
      departureTime: new Date('2026-07-04T10:00:00'),
      arrivalTime: new Date('2026-07-04T12:30:00'),
      duration: 150,
      basePrice: 5500,
      availableSeats: 180,
      isActive: true,
      recurring: 'DAILY',
    },
  });

  await prisma.service.create({
    data: {
      vendorId: vendorRecord.id,
      category: 'EVENT',
      title: 'Sunburn Festival 2026 - Goa',
      description: "Asia's largest electronic dance music festival at Vagator Beach.",
      amenities: ['VIP Access', 'Parking', 'Food Court', 'Medical', 'ATM'],
      images: ['https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80'],
      basePrice: 5000,
      taxPercent: 18,
      isFeatured: true,
      rating: 4.6,
      reviewCount: 342,
      event: {
        create: {
          eventType: 'CONCERT',
          venue: 'Vagator Beach',
          venueAddress: 'Vagator, North Goa',
          startDate: new Date('2026-12-25'),
          endDate: new Date('2026-12-27'),
          totalTickets: 50000,
          ticketTypes: [
            { name: 'General Admission', price: 5000, total: 30000 },
            { name: 'VIP', price: 15000, total: 15000 },
            { name: 'Super VIP', price: 35000, total: 5000 },
          ],
          organizer: 'Sunburn Entertainment',
          ageRestriction: 18,
        },
      },
    },
  });

  await prisma.coupon.createMany({
    data: [
      { code: 'WELCOME50', description: '50% off on your first booking', discountType: 'PERCENTAGE', discountValue: 50, maxDiscount: 2000, validFrom: new Date(), validUntil: new Date('2027-12-31'), maxUses: 10000 },
      { code: 'FLAT500', description: 'Flat 500 off on bookings above 5000', discountType: 'FIXED', discountValue: 500, minOrderAmount: 5000, validFrom: new Date(), validUntil: new Date('2027-12-31'), maxUses: 5000 },
      { code: 'BUS200', description: '200 off on bus bookings', discountType: 'FIXED', discountValue: 200, minOrderAmount: 1000, category: 'BUS', validFrom: new Date(), validUntil: new Date('2027-12-31'), maxUses: 2000 },
      { code: 'SUMMER25', description: '25% off on summer travel', discountType: 'PERCENTAGE', discountValue: 25, maxDiscount: 3000, validFrom: new Date(), validUntil: new Date('2026-09-30'), maxUses: 3000 },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { userId: admin.id, title: 'Welcome to Arvis X!', body: 'Thank you for joining. Start your premium travel experience today!', channel: 'IN_APP' },
      { userId: vendorUser.id, title: 'Vendor Account Approved', body: 'Your vendor account has been verified.', channel: 'IN_APP' },
    ],
  });

  console.log('Seed data created successfully!');
  console.log('');
  console.log('Test Accounts:');
  console.log('   Admin:  admin@arvisx.com / Admin@123');
  console.log('   Vendor: vendor@arvisx.com / User@123');
  console.log('   User:   user@arvisx.com / User@123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
