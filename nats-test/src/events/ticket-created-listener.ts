import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';
import { TicketCreatedEvent } from './ticket-created-event';
import { Subjects } from './subjects';

export class TicketCreatedListner extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  /**
   * readonly subject = Subjects.TicketCreated;
   *
   * the above would work as in this case, ts would understand that the value is not going to change as it is a reaonly.
   *
   * ******************
   *
   * subject: Subjects.TicketCreated = Subjects.TicketCreated;
   *
   * here we have to write ": Subject.TicketCreated" to tell ts that subject is of type "": Subjects.TicketCreated" and it can change its value but not type(in our case the value is not going to change)
   *
   */
  //

  queueGroupName = 'payments-service';

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log('Event data!', data);

    msg.ack();
  }
}
