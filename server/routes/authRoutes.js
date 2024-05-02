const { PrismaClient } = require('@prisma/client');
const express = require('express');
const passport = require('passport');
const router = express.Router();
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

router.get('/user', (req, res) => {
  if (req.user) {
    return res.status(200).json({ authenticated: true, user: req.user })
  } else {
    return res.status(200).json({ authenticated: false })
  }
});

router.post("/login", (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    res.sendStatus(400);
    return;
  }

  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) return res.status(400).send("NO_CREDENTIAL_COMBO_FOUND");
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.status(200).json({ success: true, message: 'Logged In' });
      });
    }
  })(req, res, next);
});

router.delete("/logout", (req, res) => {
  if (req.isAuthenticated()) {
    req.logout(function (err) {
      if (err) {
        console.error(err)
        return res.status(500).send('Internal Server Error')
      }
      res.status(200).json({ success: true, message: 'Logged Out' })
    });
  }
});

router.post('/signup', checkNotAuthenticated, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  if (username.length > 30) return res.status(400).send('USERNAME_TOO_LONG')
  if (password.length < 4) return res.status(400).send('PASSWORD_TOO_SHORT')
  if (password.length > 300) return res.status(400).send('PASSWORD_TOO_LONG')

  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).send('ALREADY_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        passwordHash: hashedPassword,
      }
    });

    req.logIn(newUser, (err) => {
      if (err) throw err;
      res.status(201).send('User created and logged in.');
    });

  } catch (error) {
    console.log(error)
    res.status(500).send('SERVER_ERROR');
  }
});

router.get('/', (req, res) => {
  res.send('Welcome!');
});

router.get('/adminstatus', checkAuthenticated, async (req, res) => {
  const userObj = await prisma.user.findFirst({
    where: {
      id: req.user.id
    },
    select: {
      admin: true
    }
  })

  res.status(200).json({ isAdmin: userObj.admin });
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
