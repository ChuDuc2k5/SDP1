export class Rate {
  constructor(data = {}) {
    this._id = data._id || null;
    this.userId = data.userId || null;
    this.cabinId = data.cabinId || null;
    this.bookingId = data.bookingId || null;
    this.rating = data.rating ?? 0;
    this.comment = data.comment || null;
    this.userFullName = data.userFullName || data.fullName || null;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  static fromRow(row) {
    if (!row) return null;
    return new Rate(row);
  }

  isPositive() {
    return Number(this.rating || 0) >= 4;
  }

  getRatingLabel() {
    const rating = Number(this.rating || 0);

    if (rating >= 5) return "Excellent";
    if (rating >= 4) return "Good";
    if (rating >= 3) return "Average";
    if (rating >= 2) return "Poor";
    if (rating >= 1) return "Very poor";
    return "Unrated";
  }

  toJSON() {
    return {
      _id: this._id,
      userId: this.userId,
      cabinId: this.cabinId,
      bookingId: this.bookingId,
      rating: this.rating,
      comment: this.comment,
      userFullName: this.userFullName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default Rate;
