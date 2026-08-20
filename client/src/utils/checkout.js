export const DELIVERY_SLOTS = [
  { id: 'morning', label: 'Morning', time: '8:00 AM – 11:00 AM' },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 PM – 4:00 PM' },
  { id: 'evening', label: 'Evening', time: '4:00 PM – 7:00 PM' },
];

export const tomorrowIso = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

export const formatDeliverySlot = (order) => {
  if (!order?.deliverySlot) return '';
  const slot = DELIVERY_SLOTS.find((item) => item.id === order.deliverySlot);
  const when = order.deliveryDate || '';
  const label = slot ? `${slot.label} · ${slot.time}` : order.deliverySlot;
  return when ? `${when} · ${label}` : label;
};
