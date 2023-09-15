import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from '@ritik-development/common';
import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import mongoose from 'mongoose';
import { OrderCancelledPublisher } from '../events/publishers/order-updated-publisher';
import { Order, OrderStatus } from '../models/order';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete(
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

    const order = await Order.findOne({ id: orderId }).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: 1,
      ticket: {
        id: order.ticket.id,
      },
    });

    // console.log('the order is', order);
    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
