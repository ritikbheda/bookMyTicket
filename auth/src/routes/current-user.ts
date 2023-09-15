import express from 'express';
import { currentUser } from '@ritik-development/common';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
  res.send({ currentUser: req.currentUser });
});

export { router as currentuserRouter };
