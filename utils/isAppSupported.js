export default function isAppSupported() {
    if ('serial' in navigator) {
        return true;
    }
    return false;
}