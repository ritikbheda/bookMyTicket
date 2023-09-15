import {
  Subjects,
  Publisher,
  TicketUpdatedEvent,
} from '@ritik-development/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
