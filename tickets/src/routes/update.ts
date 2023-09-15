import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@ritik-development/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';
import { TicketUpdatedPublisher } from '../events/publisher/ticket-updated-publisher';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  [
    body('title').not().isEmpty().withMessage('title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('number should be greater than zero'),
  ],
  validateRequest,
  requireAuth,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    console.log('userId: ', ticket.userId);
    console.log('title: ', ticket.title);
    console.log('price: ', ticket.price);
    console.log('currectUser: ', req.currentUser!.id);
    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });

    await ticket.save();

    const ticketPublishData = {
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      version: ticket.version,
      userId: ticket.userId,
    };
    await new TicketUpdatedPublisher(natsWrapper.client).publish(
      ticketPublishData
    );

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
