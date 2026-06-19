export class BookingPolicy {
  constructor(data = {}) {
    this._id = data._id || null;
    this.cabinId = data.cabinId || null;
    this.breakfastPrice = data.breakfastPrice ?? 15;
    this.miniBookingLength = data.miniBookingLength ?? 1;
    this.maxBookingLength = data.maxBookingLength ?? 30;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  static fromRow(row) {
    if (!row) return null;
    return new BookingPolicy(row);
  }

  isValidBookingLength(numNights) {
    const nights = Number(numNights);
    const min = Number(this.miniBookingLength || 1);
    const max = Number(this.maxBookingLength || 30);

    return Number.isInteger(nights) && nights >= min && nights <= max;
  }

  getBreakfastTotal(numGuests, numNights) {
    const guests = Number(numGuests || 0);
    const nights = Number(numNights || 0);
    const breakfastPrice = Number(this.breakfastPrice || 0);

    return Number((guests * nights * breakfastPrice).toFixed(2));
  }

  toJSON() {
    return {
      _id: this._id,
      cabinId: this.cabinId,
      breakfastPrice: this.breakfastPrice,
      miniBookingLength: this.miniBookingLength,
      maxBookingLength: this.maxBookingLength,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default BookingPolicy;
