export class Cabin {
  constructor(data = {}) {
    this._id = data._id || null;
    this.name = data.name || "";
    this.maxCapacity = data.maxCapacity ?? 0;
    this.regularPrice = data.regularPrice ?? 0;
    this.discount = data.discount ?? 0;
    this.image = data.image || "";
    this.description = data.description || "";
    this.location = data.location || null;
    this.amenities = data.amenities || null;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  static fromRow(row) {
    if (!row) return null;
    return new Cabin(row);
  }

  hasDiscount() {
    return Number(this.discount || 0) > 0;
  }

  getFinalPrice() {
    const regularPrice = Number(this.regularPrice || 0);
    const discount = Number(this.discount || 0);

    if (!regularPrice) return 0;
    if (!this.hasDiscount()) return regularPrice;

    return Number((regularPrice * (1 - discount / 100)).toFixed(2));
  }

  canFitGuests(numGuests) {
    const guests = Number(numGuests);
    return Number.isInteger(guests) && guests > 0 && guests <= Number(this.maxCapacity);
  }

  getAmenitiesList() {
    if (Array.isArray(this.amenities)) {
      return this.amenities.filter(Boolean);
    }

    if (typeof this.amenities !== "string") {
      return [];
    }

    return this.amenities
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  toJSON() {
    return {
      _id: this._id,
      name: this.name,
      maxCapacity: this.maxCapacity,
      regularPrice: this.regularPrice,
      discount: this.discount,
      image: this.image,
      description: this.description,
      location: this.location,
      amenities: this.amenities,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default Cabin;
