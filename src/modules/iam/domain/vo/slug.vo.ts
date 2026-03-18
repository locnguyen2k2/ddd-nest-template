export class Slug {
    private constructor(public readonly value: string) {
        this.value = this.format();
    }

    static create(value: string): Slug {
        if (!value || value.trim().length === 0) {
            throw new Error('Slug value cannot be empty');
        }
        if (value.length > 100) {
            throw new Error('Slug value cannot exceed 100 characters');
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
