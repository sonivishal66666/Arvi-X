import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { BadRequestError } from '../middleware/errorHandler';
import { config } from '../config';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wallet) {
      const newWallet = await prisma.wallet.create({
        data: { userId: req.user!.userId },
      });
      res.json({ wallet: newWallet, transactions: [] });
      return;
    }

    const transactions = await prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ wallet, transactions });
  } catch (error) {
    next(error);
  }
});

router.post('/add', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) throw new BadRequestError('Invalid amount');
    if (amount > 100000) throw new BadRequestError('Maximum ₹1,00,000 per transaction');

    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!wallet) throw new BadRequestError('Wallet not found');

    const orderId = `WALLET_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const orderData = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: req.user!.userId,
        customer_email: req.user!.email,
        customer_name: req.user!.name,
      },
    };

    const response = await fetch(`${config.CASHFREE_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': config.CASHFREE_APP_ID,
        'x-client-secret': config.CASHFREE_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) throw new BadRequestError('Failed to create payment order');
    const cashfreeOrder = await response.json() as any;

    res.json({
      success: true,
      data: {
        paymentSessionId: cashfreeOrder.payment_session_id,
        orderId,
        amount,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-payment', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.body;

    const response = await fetch(`${config.CASHFREE_API_URL}/orders/${orderId}/payments`, {
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': config.CASHFREE_APP_ID,
        'x-client-secret': config.CASHFREE_SECRET_KEY,
      },
    });

    if (!response.ok) throw new BadRequestError('Payment verification failed');
    const payments = await response.json() as any;
    const paymentStatus = payments[0]?.payment_status;

    if (paymentStatus === 'SUCCESS') {
      const amount = parseFloat(payments[0]?.order_amount || '0');
      const wallet = await prisma.wallet.findUnique({ where: { userId: req.user!.userId } });
      if (!wallet) throw new BadRequestError('Wallet not found');

      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId: req.user!.userId },
          data: { balance: { increment: amount } },
        }),
        prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'CREDIT',
            amount,
            balanceBefore: wallet.balance,
            balanceAfter: wallet.balance + amount,
            description: 'Wallet top-up',
            referenceId: orderId,
          },
        }),
      ]);

      res.json({ success: true, message: 'Wallet credited', amount });
    } else {
      res.json({ success: false, message: 'Payment not completed' });
    }
  } catch (error) {
    next(error);
  }
});

router.get('/transactions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user!.userId } });
    if (!wallet) {
      res.json({ transactions: [], pagination: { total: 0, page, limit, totalPages: 0 } });
      return;
    }

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
    ]);

    res.json({
      transactions,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/topup-dev', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) throw new BadRequestError('Invalid amount');

    let wallet = await prisma.wallet.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: req.user!.userId },
      });
    }

    const orderId = `DEV_${Date.now()}`;

    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: req.user!.userId },
        data: { balance: { increment: amount } },
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT',
          amount,
          balanceBefore: wallet.balance,
          balanceAfter: wallet.balance + amount,
          description: 'Dev Wallet Top-up (Simulation)',
          referenceId: orderId,
        },
      }),
    ]);

    res.json({ success: true, message: 'Simulated top-up successful', amount });
  } catch (error) {
    next(error);
  }
});

export default router;
