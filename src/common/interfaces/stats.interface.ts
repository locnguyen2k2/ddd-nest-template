import { StatsBase } from "fs";

export interface StatsBaseInfo {
    title: string;
    from?: string;
    to?: string;
    max?: {
        label: string;
        value: number;
    };
    min?: {
        label: string;
        value: number;
    }
}

export interface StatsGrowInfo extends StatsBaseInfo {
    data: {
        labels: string[];
        values: number[];
    }
}

export interface StatsPercentInfo extends StatsBaseInfo {
    percent_growth: number;
    total: number;
    current: number;
}
