import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@ritik-development/common';

import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publisher/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .not()
      .isEmpty()
      .isFloat({ gt: 0 })
      .withMessage('Title is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });

    await ticket.save();

    const ticketPublishData = {
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      version: ticket.version,
      userId: ticket.userId,
    };
    await new TicketCreatedPublisher(natsWrapper.client).publish(
      ticketPublishData
    );

    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
