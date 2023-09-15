import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  // create an instance of ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: '444',
  });

  // save the ticket to database
  await ticket.save();

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two separate changes to the ticket
  firstInstance!.set({ price: 90 });
  secondInstance!.set({ price: 30 });

  // save the first fetched ticket
  await firstInstance!.save();
  // second should give an error

  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  throw new Error('Should not reach this  point');
});

it('increaments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: '123',
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
