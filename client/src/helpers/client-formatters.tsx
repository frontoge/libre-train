import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';

export function formatStatisticDiff(value: number | undefined, precision?: number): string {
    if (!value) {
        return "";
    }
    return `(${value > 0 ? "+" : ""}${value.toFixed(precision ?? 0)})`;
}

export function getStatisticPrefix(value: number | undefined) {
    if (value === undefined || value === 0) {
        return undefined;
    }

    return value > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
}