import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../__mocks__/nats-wrapper';

it('returns an error if the ticket does not exists', async () => {
  const ticketId = new mongoose.Types.ObjectId();

  // the jhool in this TC suite is that if we provide only ticketId, it gives cast error as it requires _id property
  // and if we only provide _id, validator is failing and we getting 400(bad request), so we are passing both, _id and ticketId
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ _id: ticketId })
    .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: 'waesgwroiknm',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ _id: ticket.id })
    .expect(400);
});

it('reserves a ticket', async () => {
  const ticket = Ticket.build({
    title: 'concwert',
    price: 20,
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ _id: ticket.id })
    .expect(201);
});

it.todo('emits an order created', async () => {
  const ticket = Ticket.build({
    title: 'concwert',
    price: 20,
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ _id: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
