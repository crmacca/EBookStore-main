const { PrismaClient } = require('@prisma/client');

const router = require('express').Router()
const prisma = new PrismaClient();

router.get('/', checkAuthenticated, async (req, res) => {
    const userObj = await prisma.user.findFirst({
        where: {
            id: req.user.id
        },
        select: {
            credits: true
        }
    })

    res.status(200).json({ balance: userObj.credits });
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