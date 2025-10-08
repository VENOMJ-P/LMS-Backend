import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { Book } from '../models/book';
import { Borrowing } from '../models/borrowing';
import { Fine } from '../models/fine';
import { Feedback } from '../models/feedback';
import { User } from '../models/user';
import { Group } from '../models/group';
import { BadRequestError } from '../utils/Error';

export class ReportService {
  async generateReport(type: string, format: string): Promise<any> {
    const validTypes = ['books', 'borrowings', 'fines', 'users', 'groups', 'feedbacks'];
    const validFormats = ['json', 'csv', 'pdf'];
    if (!validTypes.includes(type)) throw new BadRequestError('Invalid report type');
    if (!validFormats.includes(format)) throw new BadRequestError('Invalid format');

    let data: any[] = [];
    switch (type) {
      case 'books':
        data = await Book.find({ isDeleted: false }).lean();
        break;
      case 'borrowings':
        data = await Borrowing.find().populate('book borrower group').lean();
        break;
      case 'fines':
        data = await Fine.find().populate('borrowing user').lean();
        break;
      case 'users':
        data = await User.find().select('-password -refreshToken').lean();
        break;
      case 'groups':
        data = await Group.find().populate('leader members').lean();
        break;
      case 'feedbacks':
        data = await Feedback.find().populate('user book').lean();
        break;
    }

    if (format === 'json') {
      return data;
    } else if (format === 'csv') {
      const parser = new Parser();
      return parser.parse(data);
    } else {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        return Buffer.concat(buffers);
      });

      doc.fontSize(20).text(`${type.toUpperCase()} Report`, { align: 'center' });
      doc.moveDown();

      data.forEach((item, index) => {
        doc.fontSize(12).text(JSON.stringify(item, null, 2));
        if (index < data.length - 1) doc.moveDown();
      });

      doc.end();
      return doc;
    }
  }
}

export default new ReportService();
