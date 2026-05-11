export interface StatsBaseInfo {
    title: string;
    from: string;
    to: string;
}

export interface StatsGrowInfo extends StatsBaseInfo {
    data: {
        labels: string[];
        values: number[];
    }
}
