import { Book, IBook } from '../models/book';
import { NotFoundError, ConflictError } from '../utils/Error';

export class BookService {
  async createBook(data: Partial<IBook>): Promise<IBook> {
    const existing = await Book.findOne({ ISBN: data.ISBN });
    if (existing) throw new ConflictError('Book with this ISBN exists');
    return await Book.create(data);
  }

  async getBooks(
    page: number,
    limit: number,
    category?: string,
    search?: string
  ): Promise<{ books: IBook[]; total: number }> {
    const filter: any = { isDeleted: false };
    if (category) filter.category = category;
    if (search)
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];

    const skip = (page - 1) * limit;
    const [books, total] = await Promise.all([
      Book.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Book.countDocuments(filter)
    ]);
    return { books, total };
  }

  async getBook(id: string): Promise<IBook> {
    const book = await Book.findById(id);
    if (!book || book.isDeleted) throw new NotFoundError('Book not found');
    return book;
  }

  async updateBook(id: string, data: Partial<IBook>): Promise<IBook> {
    const book = await Book.findByIdAndUpdate(id, data, { new: true });
    if (!book) throw new NotFoundError('Book not found');
    return book;
  }

  async deleteBook(id: string): Promise<void> {
    const book = await Book.findById(id);
    if (!book) throw new NotFoundError('Book not found');
    book.isDeleted = true;
    await book.save();
  }

  async bulkCreateBooks(data: any[]): Promise<number> {
    const validData = data.map(item => ({
      title: item.title,
      author: item.author,
      category: item.category,
      ISBN: item.ISBN,
      price: parseFloat(item.price),
      totalCopies: parseInt(item.totalCopies || '3'),
      description: item.description
    }));
    const result = await Book.insertMany(validData, { ordered: false });
    return result.length;
  }
}

export default new BookService();
