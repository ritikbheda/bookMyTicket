import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

const buildTicket = async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
  });
  await ticket.save();
  return ticket;
};

it('fetches orders for an particular user', async () => {
  // create three tickets
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  const userOne = global.signin();
  const userTwo = global.signin();

  // create one order as user #1

  await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ _id: ticketOne.id })
    .expect(201);
  // create two orders as user #2

  const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ _id: ticketTwo.id })
    .expect(201);

  const { body: orderThree } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ _id: ticketThree.id })
    .expect(201);

  // make request to get orders for user #2
  const userTwoOrders = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .expect(200);

  // make sure we only get the orders for User #2
  expect(userTwoOrders.body.length).toEqual(2);

  // verify everything for order 2 matches
  expect(orderTwo.id).toEqual(userTwoOrders.body[0].id);
  expect(orderTwo.userId).toEqual(userTwoOrders.body[0].userId);
  expect(orderTwo.ticket.id).toEqual(userTwoOrders.body[0].ticket.id);

  // verify everything for order 3 matches
  expect(orderThree.id).toEqual(userTwoOrders.body[1].id);
  expect(orderThree.userId).toEqual(userTwoOrders.body[1].userId);
  expect(orderThree.ticket.id).toEqual(userTwoOrders.body[1].ticket.id);
});
