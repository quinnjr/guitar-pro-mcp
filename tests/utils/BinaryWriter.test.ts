import { describe, it, expect } from 'vitest';
import { BinaryWriter } from '../../src/utils/BinaryWriter';

describe('BinaryWriter', () => {
  describe('writeByte', () => {
    it('should write a single byte', () => {
      const writer = new BinaryWriter();
      writer.writeByte(42);

      const buffer = writer.toBuffer();
      expect(buffer.length).toBe(1);
      expect(buffer[0]).toBe(42);
    });

    it('should write multiple bytes', () => {
      const writer = new BinaryWriter();
      writer.writeByte(10);
      writer.writeByte(20);
      writer.writeByte(30);

      const buffer = writer.toBuffer();
      expect(buffer.length).toBe(3);
      expect(buffer[0]).toBe(10);
      expect(buffer[1]).toBe(20);
      expect(buffer[2]).toBe(30);
    });

    it('should handle byte value 0', () => {
      const writer = new BinaryWriter();
      writer.writeByte(0);

      const buffer = writer.toBuffer();
      expect(buffer[0]).toBe(0);
    });

    it('should handle max byte value 255', () => {
      const writer = new BinaryWriter();
      writer.writeByte(255);

      const buffer = writer.toBuffer();
      expect(buffer[0]).toBe(255);
    });
  });

  describe('writeSignedByte', () => {
    it('should write a positive signed byte', () => {
      const writer = new BinaryWriter();
      writer.writeSignedByte(42);

      const buffer = writer.toBuffer();
      expect(buffer.readInt8(0)).toBe(42);
    });

    it('should write a negative signed byte', () => {
      const writer = new BinaryWriter();
      writer.writeSignedByte(-42);

      const buffer = writer.toBuffer();
      expect(buffer.readInt8(0)).toBe(-42);
    });
  });

  describe('writeInt', () => {
    it('should write a 32-bit integer', () => {
      const writer = new BinaryWriter();
      writer.writeInt(1234567);

      const buffer = writer.toBuffer();
      expect(buffer.length).toBe(4);
      expect(buffer.readInt32LE(0)).toBe(1234567);
    });

    it('should write negative integers', () => {
      const writer = new BinaryWriter();
      writer.writeInt(-1234567);

      const buffer = writer.toBuffer();
      expect(buffer.readInt32LE(0)).toBe(-1234567);
    });

    it('should write zero', () => {
      const writer = new BinaryWriter();
      writer.writeInt(0);

      const buffer = writer.toBuffer();
      expect(buffer.readInt32LE(0)).toBe(0);
    });
  });

  describe('writeBoolean', () => {
    it('should write true as 1', () => {
      const writer = new BinaryWriter();
      writer.writeBoolean(true);

      const buffer = writer.toBuffer();
      expect(buffer[0]).toBe(1);
    });

    it('should write false as 0', () => {
      const writer = new BinaryWriter();
      writer.writeBoolean(false);

      const buffer = writer.toBuffer();
      expect(buffer[0]).toBe(0);
    });
  });

  describe('writeString', () => {
    it('should write a string with length prefix', () => {
      const writer = new BinaryWriter();
      writer.writeString('hello');

      const buffer = writer.toBuffer();
      const length = buffer.readInt32LE(0);
      const text = buffer.subarray(4, 4 + length).toString('utf8');

      expect(length).toBe(5);
      expect(text).toBe('hello');
    });

    it('should write an empty string', () => {
      const writer = new BinaryWriter();
      writer.writeString('');

      const buffer = writer.toBuffer();
      const length = buffer.readInt32LE(0);

      expect(length).toBe(0);
      expect(buffer.length).toBe(4);
    });

    it('should handle UTF-8 characters', () => {
      const writer = new BinaryWriter();
      writer.writeString('café');

      const buffer = writer.toBuffer();
      const length = buffer.readInt32LE(0);
      const text = buffer.subarray(4, 4 + length).toString('utf8');

      expect(text).toBe('café');
    });
  });

  describe('writeByteString', () => {
    it('should write a string with byte length prefix', () => {
      const writer = new BinaryWriter();
      writer.writeByteString('test');

      const buffer = writer.toBuffer();
      const length = buffer[0];
      const text = buffer.subarray(1, 1 + length).toString('utf8');

      expect(length).toBe(4);
      expect(text).toBe('test');
    });
  });

  describe('writeFixedString', () => {
    it('should write a fixed-length string with padding', () => {
      const writer = new BinaryWriter();
      writer.writeFixedString('hi', 10);

      const buffer = writer.toBuffer();
      expect(buffer.length).toBe(10);
      expect(buffer[0]).toBe('h'.charCodeAt(0));
      expect(buffer[1]).toBe('i'.charCodeAt(0));
      expect(buffer[2]).toBe(0);
      expect(buffer[9]).toBe(0);
    });

    it('should truncate strings longer than fixed length', () => {
      const writer = new BinaryWriter();
      writer.writeFixedString('hello world', 5);

      const buffer = writer.toBuffer();
      expect(buffer.length).toBe(5);
      const text = buffer.toString('utf8', 0, 5);
      expect(text).toBe('hello');
    });

    it('should handle empty string with fixed length', () => {
      const writer = new BinaryWriter();
      writer.writeFixedString('', 5);

      const buffer = writer.toBuffer();
      expect(buffer.length).toBe(5);
      for (let i = 0; i < 5; i++) {
        expect(buffer[i]).toBe(0);
      }
    });
  });

  describe('writeBytes', () => {
    it('should write raw bytes', () => {
      const writer = new BinaryWriter();
      const data = Buffer.from([1, 2, 3, 4, 5]);
      writer.writeBytes(data);

      const buffer = writer.toBuffer();
      expect(buffer.length).toBe(5);
      expect(buffer).toEqual(data);
    });
  });

  describe('writeColor', () => {
    it('should write RGB color', () => {
      const writer = new BinaryWriter();
      writer.writeColor(255, 128, 64);

      const buffer = writer.toBuffer();
      expect(buffer.length).toBe(4);
      expect(buffer[0]).toBe(255); // R
      expect(buffer[1]).toBe(128); // G
      expect(buffer[2]).toBe(64); // B
      expect(buffer[3]).toBe(0); // Alpha/padding
    });
  });

  describe('skip', () => {
    it('should skip bytes with zeros', () => {
      const writer = new BinaryWriter();
      writer.writeByte(1);
      writer.skip(3);
      writer.writeByte(2);

      const buffer = writer.toBuffer();
      expect(buffer.length).toBe(5);
      expect(buffer[0]).toBe(1);
      expect(buffer[1]).toBe(0);
      expect(buffer[2]).toBe(0);
      expect(buffer[3]).toBe(0);
      expect(buffer[4]).toBe(2);
    });
  });

  describe('getPosition', () => {
    it('should return current write position', () => {
      const writer = new BinaryWriter();
      expect(writer.getPosition()).toBe(0);

      writer.writeByte(1);
      expect(writer.getPosition()).toBe(1);

      writer.writeInt(100);
      expect(writer.getPosition()).toBe(5);

      writer.writeString('test');
      expect(writer.getPosition()).toBe(5 + 4 + 4); // 4 bytes length + 4 bytes text
    });
  });

  describe('buffer expansion', () => {
    it('should automatically expand buffer when needed', () => {
      const writer = new BinaryWriter(10); // Start with small buffer

      for (let i = 0; i < 100; i++) {
        writer.writeByte(i % 256);
      }

      const buffer = writer.toBuffer();
      expect(buffer.length).toBe(100);
    });

    it('should preserve data when expanding', () => {
      const writer = new BinaryWriter(5);
      writer.writeByte(1);
      writer.writeByte(2);
      writer.writeByte(3);
      writer.writeByte(4);
      writer.writeByte(5);
      writer.writeByte(6); // Should trigger expansion
      writer.writeByte(7);

      const buffer = writer.toBuffer();
      expect(buffer[0]).toBe(1);
      expect(buffer[4]).toBe(5);
      expect(buffer[5]).toBe(6);
      expect(buffer[6]).toBe(7);
    });
  });

  describe('complex write sequences', () => {
    it('should handle mixed data types', () => {
      const writer = new BinaryWriter();
      writer.writeByte(1);
      writer.writeInt(1000);
      writer.writeBoolean(true);
      writer.writeString('test');
      writer.writeColor(255, 0, 0);

      const buffer = writer.toBuffer();
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer[0]).toBe(1);
      expect(buffer.readInt32LE(1)).toBe(1000);
    });
  });
});
