export function generateUUID(): string {
    const firstPart = (Math.random() * 46656) | 0;
    const secondPart = (Math.random() * 46656) | 0;
    const strFirstPart = ("000" + firstPart.toString(36)).slice(-3);
    const strSecondPart = ("000" + secondPart.toString(36)).slice(-3);
    return "i_" + strFirstPart + strSecondPart;
}