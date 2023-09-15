import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../__mocks__/nats-wrapper';

it('chnages the status of order to cancelled', async () => {
  const ticket = await Ticket.build({
    title: 'concert',
    price: 30,
  });
  await ticket.save();

  const user = global.signin();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ _id: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  const checkOrder = await Order.findOne({ id: order.id });

  expect(checkOrder?.status).toBe(OrderStatus.Cancelled);
});

it.todo('emits a order cancelled events', async () => {
  const ticket = await Ticket.build({
    title: 'concert',
    price: 30,
  });
  await ticket.save();

  const user = global.signin();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ _id: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
