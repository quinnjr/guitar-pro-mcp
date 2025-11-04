/**
 * Utility class for writing binary data in Guitar Pro format
 */
export class BinaryWriter {
  private buffer: Buffer;
  private position: number;

  constructor(size: number = 1024 * 1024) {
    this.buffer = Buffer.alloc(size);
    this.position = 0;
  }

  /**
   * Write a single byte
   */
  writeByte(value: number): void {
    this.ensureCapacity(1);
    this.buffer.writeUInt8(value, this.position);
    this.position += 1;
  }

  /**
   * Write a signed byte
   */
  writeSignedByte(value: number): void {
    this.ensureCapacity(1);
    this.buffer.writeInt8(value, this.position);
    this.position += 1;
  }

  /**
   * Write a 32-bit integer (little-endian)
   */
  writeInt(value: number): void {
    this.ensureCapacity(4);
    this.buffer.writeInt32LE(value, this.position);
    this.position += 4;
  }

  /**
   * Write a boolean as a byte
   */
  writeBoolean(value: boolean): void {
    this.writeByte(value ? 1 : 0);
  }

  /**
   * Write a string with length prefix
   */
  writeString(value: string): void {
    const bytes = Buffer.from(value, 'utf8');
    this.writeInt(bytes.length);
    this.ensureCapacity(bytes.length);
    bytes.copy(this.buffer, this.position);
    this.position += bytes.length;
  }

  /**
   * Write a string with byte length prefix
   */
  writeByteString(value: string): void {
    const bytes = Buffer.from(value, 'utf8');
    this.writeByte(bytes.length);
    this.ensureCapacity(bytes.length);
    bytes.copy(this.buffer, this.position);
    this.position += bytes.length;
  }

  /**
   * Write a fixed-length string with padding
   */
  writeFixedString(value: string, length: number): void {
    const bytes = Buffer.from(value, 'utf8');
    const written = Math.min(bytes.length, length);

    this.ensureCapacity(length);
    bytes.copy(this.buffer, this.position, 0, written);

    // Pad with zeros
    for (let i = written; i < length; i++) {
      this.buffer[this.position + i] = 0;
    }

    this.position += length;
  }

  /**
   * Write raw bytes
   */
  writeBytes(bytes: Buffer): void {
    this.ensureCapacity(bytes.length);
    bytes.copy(this.buffer, this.position);
    this.position += bytes.length;
  }

  /**
   * Write a color (RGB)
   */
  writeColor(r: number, g: number, b: number): void {
    this.writeByte(r);
    this.writeByte(g);
    this.writeByte(b);
    this.writeByte(0); // Alpha or padding
  }

  /**
   * Skip bytes (write zeros)
   */
  skip(count: number): void {
    this.ensureCapacity(count);
    for (let i = 0; i < count; i++) {
      this.buffer[this.position + i] = 0;
    }
    this.position += count;
  }

  /**
   * Get the current position
   */
  getPosition(): number {
    return this.position;
  }

  /**
   * Get the written data as a buffer
   */
  toBuffer(): Buffer {
    return this.buffer.subarray(0, this.position);
  }

  /**
   * Ensure the buffer has enough capacity
   */
  private ensureCapacity(additional: number): void {
    const required = this.position + additional;
    if (required > this.buffer.length) {
      const newSize = Math.max(required, this.buffer.length * 2);
      const newBuffer = Buffer.alloc(newSize);
      this.buffer.copy(newBuffer);
      this.buffer = newBuffer;
    }
  }
}
