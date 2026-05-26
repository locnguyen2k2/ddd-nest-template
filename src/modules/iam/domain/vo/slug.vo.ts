import { BusinessException } from "@/common/http/business-exception";

export class Slug {
  private constructor(public readonly value: string) {
    this.value = this.format();
  }

  static create(value: string): Slug {
    if (!value || value.trim().length === 0) {
      throw new BusinessException('400|Slug value cannot be empty');
    }
    if (value.length > 100) {
      throw new BusinessException('400|Slug value cannot exceed 100 characters');
    }
    return new Slug(value);
  }

  format() {
    return this.value.toLowerCase().replace(/\s+/g, '-');
  }

  equals(other: Slug): boolean {
    return this.value === other.value;
  }
}
