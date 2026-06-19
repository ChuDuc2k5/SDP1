export class CabinImage {
  constructor(data = {}) {
    this._id = data._id || null;
    this.cabinId = data.cabinId || null;
    this.imageUrl = data.imageUrl || "";
    this.name = data.name || "";
    this.isCover = Boolean(data.isCover);
    this.createdAt = data.createdAt || null;
  }

  static fromRow(row) {
    if (!row) return null;
    return new CabinImage(row);
  }

  isCoverImage() {
    return Boolean(this.isCover);
  }

  toJSON() {
    return {
      _id: this._id,
      cabinId: this.cabinId,
      imageUrl: this.imageUrl,
      name: this.name,
      isCover: this.isCover,
      createdAt: this.createdAt,
    };
  }
}

export { CabinImage as Image, CabinImage as ImageModel };

export default CabinImage;
