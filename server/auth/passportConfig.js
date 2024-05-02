const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = (passport) => {
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
          return done(null, false, { message: 'Details provided don\'t match out records.' });
        }
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return done(null, false, { message: 'Details provided don\'t match out records.' });
        }
        return done(null, {id: user.id, name: user.name, username: user.username});
      } catch (err) {
        return done(err);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, {id: user.id, username: user.username});
    } catch (err) {
      done(err);
    }
  });
};
