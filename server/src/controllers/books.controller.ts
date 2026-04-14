import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const bookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  isbn: z.string().min(1),
  coverUrl: z.string().optional().default(''),
});

const copySchema = z.object({
  barcode: z.string().min(1),
});

export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await prisma.book.findMany({
      include: {
        copies: true,
      },
    });
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching books' });
  }
};

export const createBook = async (req: Request, res: Response) => {
  try {
    const data = bookSchema.parse(req.body);
    const book = await prisma.book.create({
      data,
      include: {
        copies: true,
      },
    });
    res.status(201).json(book);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Error creating book' });
    }
  }
};

export const updateBook = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = bookSchema.parse(req.body);
    const book = await prisma.book.update({
      where: { id },
      data,
      include: {
        copies: true,
      },
    });
    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating book' });
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if copies are borrowed
    const copies = await prisma.bookCopy.findMany({ where: { bookId: id } });
    const hasBorrowed = copies.some(c => !c.available);
    if (hasBorrowed) {
      res.status(400).json({ message: 'Cannot delete — some copies are currently borrowed' });
      return;
    }

    // Delete copies first
    await prisma.bookCopy.deleteMany({ where: { bookId: id } });
    await prisma.book.delete({ where: { id } });
    
    res.json({ message: 'Book deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting book' });
  }
};

export const createCopy = async (req: Request, res: Response) => {
  try {
    const bookId = parseInt(req.params.id);
    const { barcode } = copySchema.parse(req.body);
    
    const existing = await prisma.bookCopy.findUnique({ where: { barcode } });
    if (existing) {
      res.status(400).json({ message: 'Barcode already exists' });
      return;
    }

    const copy = await prisma.bookCopy.create({
      data: {
        bookId,
        barcode,
        available: true,
      },
    });
    res.status(201).json(copy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating copy' });
  }
};

export const deleteCopy = async (req: Request, res: Response) => {
  try {
    const copyId = parseInt(req.params.copyId);
    
    const copy = await prisma.bookCopy.findUnique({ where: { id: copyId } });
    if (!copy) {
      res.status(404).json({ message: 'Copy not found' });
      return;
    }

    if (!copy.available) {
      res.status(400).json({ message: 'Cannot delete — copy is currently borrowed' });
      return;
    }

    // Checking if there are transaction history can be added here
    const hasHistory = await prisma.transaction.findFirst({ where: { bookCopyId: copyId } });
    if (hasHistory) {
      res.status(400).json({ message: 'Cannot remove — copy has transaction history' });
      return;
    }

    await prisma.bookCopy.delete({ where: { id: copyId } });
    res.json({ message: 'Copy deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting copy' });
  }
};
