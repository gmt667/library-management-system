import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Run every day at 12:00 AM
export const startNotificationJob = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Running daily notification sweep...');

    try {
      const activeLoans = await prisma.transaction.findMany({
        where: { returnDate: null },
        include: {
          member: true,
          bookCopy: { include: { book: true } }
        }
      });

      const today = new Date();
      let sentCount = 0;

      for (const loan of activeLoans) {
        const dueDate = new Date(loan.dueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let type = null;
        let smsMessageTemplate = null;
        let emailMessageTemplate = null;

        if (diffDays === 3) {
          type = 'reminder';
          smsMessageTemplate = `Reminder: Your borrowed book "${loan.bookCopy.book.title}" is due on ${dueDate.toLocaleDateString()}. Please return it on time to avoid fines. - Library Hub`;
          emailMessageTemplate = `Dear ${loan.member.fullName},\n\nThis is a reminder that the book "${loan.bookCopy.book.title}" is due on ${dueDate.toLocaleDateString()}.\n\nKindly return it before the due date to avoid fines.\n\nThank you,\nLibrary Hub`;
        } else if (diffDays === 0) {
          type = 'due_today';
          smsMessageTemplate = `Alert: Your book "${loan.bookCopy.book.title}" is due TODAY. - Library Hub`;
          emailMessageTemplate = `Dear ${loan.member.fullName},\n\nYour book "${loan.bookCopy.book.title}" is due TODAY.\n\nThank you,\nLibrary Hub`;
        } else if (diffDays < 0 && Math.abs(diffDays) % 3 === 0) {
          // Remind every 3 days if overdue
          type = 'overdue';
          smsMessageTemplate = `URGENT: Your book "${loan.bookCopy.book.title}" is OVERDUE by ${Math.abs(diffDays)} days. Fines are accumulating. - Library Hub`;
          emailMessageTemplate = `Dear ${loan.member.fullName},\n\nYour book "${loan.bookCopy.book.title}" is OVERDUE.\n\nFines are accumulating daily. Please return it immediately.\n\nThank you,\nLibrary Hub`;
        }

        if (!type) continue;

        // Cascade Priority Logic
        const memberAge = new Date().getFullYear() - new Date(loan.member.dateOfBirth).getFullYear();
        let targetPhone = loan.member.phone;
        let targetName = loan.member.fullName;

        // Fallback to guardian if member is under 18 or has no phone
        if (!targetPhone || memberAge < 18) {
          targetPhone = loan.member.guardianPhone;
          targetName = loan.member.guardianName;
        }

        // 1. Send SMS
        console.log(`[SMS to ${targetPhone}]: Hello ${targetName}, ${smsMessageTemplate}`);
        await prisma.notificationLog.create({
          data: {
            recipient: targetPhone,
            type,
            channel: 'sms',
            status: 'success',
            message: smsMessageTemplate
          }
        });

        // 2. Send Email
        console.log(`[Email to ${loan.member.email}]: Subject: Book Notification\n${emailMessageTemplate}`);
        await prisma.notificationLog.create({
          data: {
            recipient: loan.member.email,
            type,
            channel: 'email',
            status: 'success',
            message: emailMessageTemplate
          }
        });

        sentCount += 2;
      }

      console.log(`✅ Notification sweep complete. Dispatched ${sentCount} messages.`);
    } catch (error) {
      console.error('❌ Error in notification sweep:', error);
    }
  });
  
  console.log('✅ Cron scheduler activated for notifications.');
};
