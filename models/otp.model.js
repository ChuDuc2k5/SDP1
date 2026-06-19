export class Otp {
  constructor(data = {}) {
    this._id = data._id || null;
    this.email = data.email || "";
    this.otp = data.otp || "";
    this.expiresAt = data.expiresAt || null;
    this.userId = data.userId || null;
    this.createdAt = data.createdAt || null;
  }

  static fromRow(row) {
    if (!row) return null;
    return new Otp(row);
  }

  isExpired() {
    if (!this.expiresAt) return true;

    const expiresAt = new Date(this.expiresAt);
    return Number.isNaN(expiresAt.getTime()) || expiresAt < new Date();
  }

  isMatch(inputOtp) {
    return String(this.otp || "").trim() === String(inputOtp || "").trim();
  }

  toJSON() {
    return {
      _id: this._id,
      email: this.email,
      otp: this.otp,
      expiresAt: this.expiresAt,
      userId: this.userId,
      createdAt: this.createdAt,
    };
  }
}

export default Otp;
