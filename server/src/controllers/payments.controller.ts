import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        member: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
};

const paymentSchema = z.object({
  memberId: z.number(),
  amount: z.number().positive(),
  note: z.string().optional(),
});

export const recordPayment = async (req: Request, res: Response) => {
  try {
    const { memberId, amount, note } = paymentSchema.parse(req.body);

    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }

    if (amount > member.fineBalance) {
      res.status(400).json({ message: `Amount exceeds outstanding balance of MK${member.fineBalance}` });
      return;
    }

    const result = await prisma.$transaction([
      prisma.payment.create({
        data: {
          memberId,
          amount,
          note,
        },
        include: { member: true }
      }),
      prisma.member.update({
        where: { id: memberId },
        data: { fineBalance: { decrement: amount } }
      })
    ]);

    res.status(201).json(result[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Error recording payment' });
    }
  }
};
