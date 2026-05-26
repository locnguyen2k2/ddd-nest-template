import { BusinessException } from "@/common/http/business-exception";

export class UuidV7 {
  private constructor(public readonly value: string) {
    this.value = this.format();
  }

  static create(value: string): UuidV7 {
    if (!value || value.trim().length === 0) {
      throw new BusinessException
        ('400|UuidV7 value cannot be empty');
    }
    if (value.length > 36) {
      throw new BusinessException
        ('400|UuidV7 value cannot exceed 36 characters');
    }
    return new UuidV7(value);
  }

  format() {
    return this.value.toLowerCase().replace(/\s+/g, '-');
  }

  equals(other: UuidV7): boolean {
    return this.value === other.value;
  }
}
