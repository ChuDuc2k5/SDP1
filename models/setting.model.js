export class Setting {
  constructor(data = {}) {
    this._id = data._id || null;
    this.miniBookingLength = data.miniBookingLength ?? 1;
    this.maxBookingLength = data.maxBookingLength ?? 30;
    this.maxNumberOfGuests = data.maxNumberOfGuests ?? 10;
    this.breakfastPrice = data.breakfastPrice ?? 15;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  static fromRow(row) {
    if (!row) return null;
    return new Setting(row);
  }

  isValidGuestNumber(numGuests) {
    const guests = Number(numGuests);
    return (
      Number.isInteger(guests) &&
      guests > 0 &&
      guests <= Number(this.maxNumberOfGuests || 0)
    );
  }

  isValidBookingLength(numNights) {
    const nights = Number(numNights);
    const min = Number(this.miniBookingLength || 1);
    const max = Number(this.maxBookingLength || 30);

    return Number.isInteger(nights) && nights >= min && nights <= max;
  }

  toJSON() {
    return {
      _id: this._id,
      miniBookingLength: this.miniBookingLength,
      maxBookingLength: this.maxBookingLength,
      maxNumberOfGuests: this.maxNumberOfGuests,
      breakfastPrice: this.breakfastPrice,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default Setting;
