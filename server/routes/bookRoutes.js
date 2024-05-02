const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// Setup Multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = file.fieldname === 'epubFile' ? './uploads/epubs' : './uploads/covers';
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);
        const filename = `${Date.now()}${extension}`;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

// Middleware to check if the user is authenticated and an admin
async function checkAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        const user = await prisma.user.findFirst({
            where: { id: req.user.id },
            select: { admin: true }
        });
        
        if (user.admin) return next();
    }
    return res.status(403).json({ message: 'Access denied: You must be an admin.' });
}

// Create or Update a book
router.post('/', checkAdmin, upload.fields([{ name: 'epubFile', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), async (req, res) => {
    const { name, price, description, bookId } = req.body;
    const title = name;
    const newEpubFile = req.files['epubFile'] ? `uploads/epubs/${req.files['epubFile'][0].filename}` : null;
    const newCoverImage = req.files['coverImage'] ? `uploads/covers/${req.files['coverImage'][0].filename}` : null;

    try {
        if (bookId !== "") {
            // Update existing book
            const existingBook = await prisma.book.findUnique({
                where: { id: bookId },
                select: { epubUrl: true, imageUrl: true }
            });

            const updateData = {
                title,
                description,
                price: parseFloat(price),
                ...(newEpubFile && { epubUrl: newEpubFile }),
                ...(newCoverImage && { imageUrl: newCoverImage })
            };

            // Delete old files if new ones are uploaded
            if (newEpubFile && existingBook.epubUrl) {
                fs.unlinkSync(path.resolve(existingBook.epubUrl));
            }
            if (newCoverImage && existingBook.imageUrl) {
                fs.unlinkSync(path.resolve(existingBook.imageUrl));
            }

            const book = await prisma.book.update({
                where: { id: bookId },
                data: updateData
            });
            res.status(201).json(book);
        } else {
            // Create new book
            if (!newEpubFile || !newCoverImage) {
                return res.status(400).json({ error: 'New books must have both an EPUB file and a cover image.' });
            }
            const book = await prisma.book.create({
                data: {
                    title,
                    description,
                    price: parseFloat(price),
                    imageUrl: newCoverImage,
                    epubUrl: newEpubFile
                }
            });
            res.status(201).json(book);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE a book by ID (Admin only)
router.delete('/:bookId', checkAdmin, async (req, res) => {
    const { bookId } = req.params;
    try {
        await prisma.book.delete({
            where: { id: bookId }
        });
        res.status(200).json({ message: 'Book deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/:bookId/purchase', checkAuthenticated, async (req, res) => {
    const { bookId } = req.params;
    const userId = req.user.id;

    try {
        const book = await prisma.book.findUnique({
            where: { id: bookId },
            select: { price: true }
        });

        if (!book) {
            return res.status(404).json({ message: 'Book not found.' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true }
        });

        if (user.credits < book.price) {
            return res.status(403).json({ message: 'Insufficient credits.' });
        }

        // Update user's credits
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: book.price } }
        });

        // Create purchase record
        const purchase = await prisma.purchase.create({
            data: {
                userId: userId,
                bookId: bookId,
                date: new Date(),
                quantity: 1 // Assuming one book per purchase, adjust as necessary
            }
        });

        res.status(201).json({ message: 'Purchase successful', newBalance: updatedUser.credits });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:bookId/details', async (req, res) => {
    const { bookId } = req.params;
    try {
        const book = await prisma.book.findUnique({
            where: { id: bookId },
            select: {
                id: true,
                title: true,
                description: true,
                price: true
            }
        });

        if (!book) {
            return res.status(404).json({ message: 'Book not found.' });
        }

        let owned = false; // Default to false
        if (req.isAuthenticated()) {
            // Check if the user owns the book only if they are authenticated
            const purchase = await prisma.purchase.findFirst({
                where: {
                    userId: req.user.id,
                    bookId: bookId
                }
            });
            owned = !!purchase; // Convert to boolean: true if exists, false otherwise
        }

        res.json({
            ...book,
            owned: owned
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// GET books owned by the user
router.get('/my', checkAuthenticated, async (req, res) => {
    try {
        const purchases = await prisma.purchase.findMany({
            where: { userId: req.user.id },
            include: {
                book: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        price: true
                    }
                }
            }
        });
        const books = purchases.map(purchase => purchase.book);
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Get all books (name, description, price)
router.get('/', async (req, res) => {
    try {
        const books = await prisma.book.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
            }
        });
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve cover image
router.get('/:bookId/cover', async (req, res) => {
    const book = await prisma.book.findUnique({
        where: { id: req.params.bookId },
        select: { imageUrl: true }
    });
    if (book && book.imageUrl) {
        res.sendFile(path.resolve(book.imageUrl));
    } else {
        res.status(404).json({ message: 'Cover image not found.' });
    }
});

// Serve PDF file
router.get('/:bookId/epub', checkAuthenticated, async (req, res) => {
    const book = await prisma.book.findUnique({
        where: { id: req.params.bookId },
        select: { epubUrl: true }
    });
    if (!book) {
        return res.status(404).json({ message: 'Book not found.' });
    }

    const purchase = await prisma.purchase.findFirst({
        where: {
            userId: req.user.id,
            bookId: req.params.bookId
        }
    });

    if (!purchase) {
        return res.status(403).json({ message: 'Access denied: You have not purchased this book.' });
    }

    if (book.epubUrl) {
        res.sendFile(path.resolve(book.epubUrl));
    } else {
        res.status(404).json({ message: 'PDF file not found.' });
    }
});


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else return res.status(403).json({ success: false, message: 'Unauthorised' });
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.status(403).json({ success: false, message: 'Unauthorised' });
    }
    next();
  }

module.exports = router;
