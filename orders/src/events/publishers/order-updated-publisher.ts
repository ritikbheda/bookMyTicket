import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from '@ritik-development/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
