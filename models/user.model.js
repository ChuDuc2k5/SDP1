export class User {
  constructor(data = {}) {
    this._id = data._id || null;
    this.fullName = data.fullName || "";
    this.email = data.email || "";
    this.password = data.password || "";
    this.phone = data.phone || null;
    this.nationalId = data.nationalId || null;
    this.dateOfBirth = data.dateOfBirth || null;
    this.gender = data.gender || null;
    this.address = data.address || null;
    this.nationality = data.nationality || null;
    this.role = data.role || "customer";
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  static fromRow(row) {
    if (!row) return null;
    return new User(row);
  }

  isCustomer() {
    return this.role === "customer";
  }

  isCabinOwner() {
    return this.role === "cabinOwner";
  }

  getDisplayName() {
    return this.fullName || this.email || "User";
  }

  toSafeJSON() {
    return {
      _id: this._id,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      nationalId: this.nationalId,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      address: this.address,
      nationality: this.nationality,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toJSON() {
    return {
      _id: this._id,
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      phone: this.phone,
      nationalId: this.nationalId,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      address: this.address,
      nationality: this.nationality,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default User;
