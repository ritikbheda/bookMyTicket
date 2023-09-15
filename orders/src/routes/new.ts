import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@ritik-development/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post(
  '/api/orders/',
  requireAuth,
  [
    body('_id')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // if getting (CastError: Cast to ObjectId failed for value "XXX" at path "_id" for
    // model "XXX"), we did a jhol, check new.test.ts for more idea
    const ticketId = req.body._id;

    // find the ticket user is trying to order in the database
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    //make sure that the ticket is not already reserved
    const isReserved = await ticket.isReserved();

    if (isReserved) {
      throw new BadRequestError('ticket is reserved');
    }

    // calcualte expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // build the order and save it to database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });
    await order.save();

    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      version: order.version,
      ticket: { id: ticket.id, price: ticket.price },
    });

    //publish an event saying an order was created
    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
