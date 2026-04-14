import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const memberSchema = z.object({
  fullName: z.string().min(1),
  dateOfBirth: z.string().or(z.date()).transform((val) => new Date(val)),
  gender: z.string().optional().nullable(),
  phone: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  location: z.string().min(1),
  school: z.string().min(1),
  studentId: z.string().optional().nullable(),
  guardianName: z.string().min(1),
  guardianPhone: z.string().min(1),
  guardianRelation: z.string().min(1),
});

export const getMembers = async (req: Request, res: Response) => {
  try {
    const members = await prisma.member.findMany({
      orderBy: { registrationDate: 'desc' },
      include: {
        transactions: true,
      }
    });
    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching members' });
  }
};

export const createMember = async (req: Request, res: Response) => {
  try {
    const data = memberSchema.parse(req.body);
    const member = await prisma.member.create({ data });
    res.status(201).json(member);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Error creating member' });
    }
  }
};

export const updateMember = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = memberSchema.parse(req.body);
    const member = await prisma.member.update({
      where: { id },
      data,
    });
    res.json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating member' });
  }
};

export const deleteMember = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const activeTx = await prisma.transaction.findFirst({
      where: { memberId: id, returnDate: null }
    });
    
    if (activeTx) {
      res.status(400).json({ message: 'Cannot delete member with active loans' });
      return;
    }

    await prisma.transaction.deleteMany({ where: { memberId: id } });
    await prisma.payment.deleteMany({ where: { memberId: id } });
    await prisma.member.delete({ where: { id } });

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting member' });
  }
};
