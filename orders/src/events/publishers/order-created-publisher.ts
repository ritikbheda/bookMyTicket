import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from '@ritik-development/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
