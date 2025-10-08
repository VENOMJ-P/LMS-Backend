import { Request, Response } from 'express';
import bookService from '../services/book.service';
import { ApiResponse } from '../utils/api_response';
import asyncHandler from '../utils/async_handler';
import fs from 'fs';
import csvParser from 'csv-parser';
import { BadRequestError } from '../utils/Error';

export class BookController {
  createBook = asyncHandler(async (req: Request, res: Response) => {
    const book = await bookService.createBook(req.body);
    return ApiResponse.success(res, { book }, 'Book created successfully', 201);
  });

  getBooks = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 20, category, search } = req.query;
    const result = await bookService.getBooks(
      parseInt(page as string),
      parseInt(limit as string),
      category as string,
      search as string
    );
    return ApiResponse.paginated(
      res,
      result.books,
      parseInt(page as string),
      parseInt(limit as string),
      result.total,
      'Books retrieved successfully'
    );
  });

  getBook = asyncHandler(async (req: Request, res: Response) => {
    const book = await bookService.getBook(req.params.id);
    return ApiResponse.success(res, { book }, 'Book retrieved successfully');
  });

  updateBook = asyncHandler(async (req: Request, res: Response) => {
    const book = await bookService.updateBook(req.params.id, req.body);
    return ApiResponse.success(res, { book }, 'Book updated successfully');
  });

  deleteBook = asyncHandler(async (req: Request, res: Response) => {
    await bookService.deleteBook(req.params.id);
    return ApiResponse.success(res, null, 'Book deleted successfully');
  });

  bulkUpload = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new BadRequestError('CSV file required');

    const books: any = [];
    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on('data', row => {
        books.push(row);
      })
      .on('end', async () => {
        const result = await bookService.bulkCreateBooks(books);
        fs.unlinkSync(req.file!.path);
        return ApiResponse.success(res, { count: result }, 'Bulk upload successful', 201);
      });
  });
}

export default new BookController();
