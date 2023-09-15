import express, { Request, Response } from 'express';
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from '@ritik-development/common';
import { param } from 'express-validator';
import mongoose from 'mongoose';
import { Order } from '../models/order';

const router = express.Router();

router.get(
  '/api/orders/:orderId',
  [
    param('orderId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided'),
  ],
  requireAuth,
  async (req: Request, res: Response) => {
    const orderId = req.params.orderId;

    const responseOrder = await Order.findOne({ id: orderId }).populate(
      'ticket'
    );

    if (!responseOrder) {
      throw new NotFoundError();
    }

    if (responseOrder.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    // console.log(orderId);
    // console.log(responseOrder);
    res.status(200).send(responseOrder);
  }
);

export { router as showOrderRouter };
