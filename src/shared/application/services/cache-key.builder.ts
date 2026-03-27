// {boundedContext}:{aggregateType}:{entityId}:{version}
export class CacheKeyBuilder {
    private parts: string[] = [];

    constructor(
        private readonly config: { keySeparator: string; keyPrefix?: string }
    ) {
        if (config.keyPrefix) {
            this.parts.push(config.keyPrefix);
        }
    }

    withBoundedContext(context: string): this {
        this.parts.push(context);
        return this;
    }

    withAggregate(aggregateType: string): this {
        this.parts.push(aggregateType);
        return this;
    }

    withId(id: string): this {
        this.parts.push(id);
        return this;
    }

    withVersion(version: number | string): this {
        this.parts.push(`v${version}`);
        return this;
    }

    build(): string {
        return this.parts.join(this.config.keySeparator);
    }

    buildPattern(): string {
        return this.parts.join(this.config.keySeparator) + '*';
    }

    // static forOrder(orderId: string, config: { keySeparator: string; keyPrefix?: string }): string {
    //     return new CacheKeyBuilder(config)
    //         .withBoundedContext('order')
    //         .withAggregate('order')
    //         .withId(orderId)
    //         .build();
    // }
}