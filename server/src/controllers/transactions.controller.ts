import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        bookCopy: { include: { book: true } },
        member: true,
      },
      orderBy: { issueDate: 'desc' },
    });
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching transactions' });
  }
};

export const lookupBarcode = async (req: Request, res: Response) => {
  try {
    const { barcode } = req.params;
    const copy = await prisma.bookCopy.findUnique({
      where: { barcode },
      include: {
        book: true,
      },
    });

    if (!copy) {
      res.status(404).json({ message: 'Barcode not found' });
      return;
    }

    let activeTransaction = null;
    if (!copy.available) {
      activeTransaction = await prisma.transaction.findFirst({
        where: {
          bookCopyId: copy.id,
          returnDate: null,
        },
        include: {
          member: true,
        },
      });
    }

    res.json({
      copy,
      activeTransaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error performing lookup' });
  }
};

const borrowSchema = z.object({
  barcode: z.string().min(1),
  memberId: z.number(),
});

export const borrowBook = async (req: Request, res: Response) => {
  try {
    const { barcode, memberId } = borrowSchema.parse(req.body);

    const copy = await prisma.bookCopy.findUnique({ where: { barcode } });
    if (!copy) {
      res.status(404).json({ message: 'Barcode not found' });
      return;
    }

    if (!copy.available) {
      res.status(400).json({ message: 'This copy is currently borrowed.' });
      return;
    }

    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }

    // Get loan duration
    const settings = await prisma.systemSetting.findFirst();
    const loanDays = settings?.loanDurationDays || 14;

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + loanDays);

    const result = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          bookCopyId: copy.id,
          memberId: member.id,
          issueDate,
          dueDate,
        },
        include: { bookCopy: { include: { book: true } }, member: true },
      }),
      prisma.bookCopy.update({
        where: { id: copy.id },
        data: { available: false },
      }),
    ]);

    res.status(201).json(result[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Error borrowing book' });
    }
  }
};

export const returnBook = async (req: Request, res: Response) => {
  try {
    const { barcode } = req.body;
    if (!barcode) {
      res.status(400).json({ message: 'Barcode is required' });
      return;
    }

    const copy = await prisma.bookCopy.findUnique({ where: { barcode } });
    if (!copy) {
      res.status(404).json({ message: 'Barcode not found' });
      return;
    }

    const tx = await prisma.transaction.findFirst({
      where: {
        bookCopyId: copy.id,
        returnDate: null,
      },
      include: { member: true },
    });

    if (!tx) {
      res.status(400).json({ message: 'No active transaction found for this copy.' });
      return;
    }

    // Calculation of Fines!
    const returnDate = new Date();
    let fineAmount = 0;

    if (returnDate > tx.dueDate) {
      const settings = await prisma.systemSetting.findFirst();
      const fineRate = settings?.fineRatePerDay || 500;

      const diffTime = Math.abs(returnDate.getTime() - tx.dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmount = diffDays * fineRate;
    }

    const result = await prisma.$transaction(async (p) => {
      const updatedTx = await p.transaction.update({
        where: { id: tx.id },
        data: { returnDate, fineAmount },
      });

      if (fineAmount > 0) {
        await p.member.update({
          where: { id: tx.memberId },
          data: { fineBalance: { increment: fineAmount } },
        });
      }

      await p.bookCopy.update({
        where: { id: copy.id },
        data: { available: true },
      });

      return updatedTx;
    });

    res.json({ message: 'Book returned successfully', transaction: result, fineAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error returning book' });
  }
};
