const toEventSummary = (event) =>
  event && typeof event === 'object' && event._id
    ? { id: event._id.toString(), title: event.title, date: event.date, location: event.location, status: event.status }
    : event?.toString() ?? null;

const toAttendee = (user) =>
  user && typeof user === 'object' && user._id
    ? { id: user._id.toString(), first_name: user.first_name, last_name: user.last_name, email: user.email }
    : user?.toString() ?? null;

const baseTicket = (ticket) => ({
  id: ticket._id.toString(),
  reservationCode: ticket.reservationCode,
  status: ticket.status,
  quantity: ticket.quantity,
  createdAt: ticket.createdAt,
  cancelledAt: ticket.cancelledAt ?? null
});

export const toMyTicket = (ticket) => ({
  ...baseTicket(ticket),
  event: toEventSummary(ticket.event)
});

export const toEventAttendeeTicket = (ticket) => ({
  ...baseTicket(ticket),
  user: toAttendee(ticket.user)
});
