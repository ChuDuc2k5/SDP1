const HISTORY_STATUSES = ["cancelled", "checked-out"];

const toDateOnly = (value) => {
  if (!value) return null;

  const date =
    value instanceof Date
      ? new Date(value)
      : new Date(String(value).includes("T") ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  date.setHours(0, 0, 0, 0);
  return date;
};

const formatDateLabel = (value) => {
  const date = toDateOnly(value);
  if (!date) return "";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

export class Booking {
  constructor(data = {}) {
    this._id = data._id || null;
    this.userId = data.userId || null;
    this.cabinId = data.cabinId || null;
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    this.numNights = data.numNights ?? 0;
    this.numGuests = data.numGuests ?? 0;
    this.cabinPrice = data.cabinPrice ?? 0;
    this.extrasPrice = data.extrasPrice ?? 0;
    this.totalPrice = data.totalPrice ?? null;
    this.status = data.status || "unconfirmed";
    this.hasBreakfast = Boolean(data.hasBreakfast);
    this.isPaid = Boolean(data.isPaid);
    this.observations = data.observations || null;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
    this.cabin = data.cabin || null;
    this.user = data.user || data.guest || null;
    this.guest = data.guest || data.user || null;
  }

  static fromRow(row) {
    if (!row) return null;
    return new Booking(row);
  }

  isCancelled() {
    return this.status === "cancelled";
  }

  isCheckedOut() {
    return this.status === "checked-out";
  }

  isUpcoming() {
    const endDate = toDateOnly(this.endDate);
    const today = toDateOnly(new Date());

    return Boolean(
      endDate &&
        today &&
        !HISTORY_STATUSES.includes(this.status) &&
        endDate >= today,
    );
  }

  isHistory() {
    const endDate = toDateOnly(this.endDate);
    const today = toDateOnly(new Date());

    return Boolean(
      HISTORY_STATUSES.includes(this.status) || (endDate && today && endDate < today),
    );
  }

  isPaidBooking() {
    return Boolean(this.isPaid);
  }

  getDateRangeLabel() {
    const startLabel = formatDateLabel(this.startDate);
    const endLabel = formatDateLabel(this.endDate);

    if (!startLabel && !endLabel) return "";
    if (!startLabel) return endLabel;
    if (!endLabel) return startLabel;
    return `${startLabel} - ${endLabel}`;
  }

  getGuestLabel() {
    const guests = Number(this.numGuests || 0);
    if (!guests) return "No guests";
    return `${guests} ${guests === 1 ? "guest" : "guests"}`;
  }

  calculateTotalPrice() {
    if (this.totalPrice != null) {
      return Number(this.totalPrice);
    }

    return Number(this.cabinPrice || 0) + Number(this.extrasPrice || 0);
  }

  toJSON() {
    return {
      _id: this._id,
      userId: this.userId,
      cabinId: this.cabinId,
      startDate: this.startDate,
      endDate: this.endDate,
      numNights: this.numNights,
      numGuests: this.numGuests,
      cabinPrice: this.cabinPrice,
      extrasPrice: this.extrasPrice,
      totalPrice: this.calculateTotalPrice(),
      status: this.status,
      hasBreakfast: this.hasBreakfast,
      isPaid: this.isPaid,
      observations: this.observations,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      cabin: this.cabin,
      user: this.user,
      guest: this.guest,
    };
  }
}

export default Booking;
