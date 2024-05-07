/**
 * 获取当前时间
 */
export function nowDate() {
    const date = new Date();
    date.setHours(date.getHours() + 8)
    return date;
}